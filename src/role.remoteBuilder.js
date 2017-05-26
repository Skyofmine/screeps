const Assign = require("assign"),
    Cache = require("cache"),
    Utilities = require("utilities"),
    TaskBuild = require("task.build"),
    TaskHarvest = require("task.harvest"),
    TaskPickupResource = require("task.pickupResource"),
    TaskRally = require("task.rally"),
    TaskRepair = require("task.repair");

//  ####           ##           ####                         #            ####            #     ##        #               
//  #   #           #           #   #                        #             #  #                  #        #               
//  #   #   ###     #     ###   #   #   ###   ## #    ###   ####    ###    #  #  #   #   ##      #     ## #   ###   # ##  
//  ####   #   #    #    #   #  ####   #   #  # # #  #   #   #     #   #   ###   #   #    #      #    #  ##  #   #  ##  # 
//  # #    #   #    #    #####  # #    #####  # # #  #   #   #     #####   #  #  #   #    #      #    #   #  #####  #     
//  #  #   #   #    #    #      #  #   #      # # #  #   #   #  #  #       #  #  #  ##    #      #    #  ##  #      #     
//  #   #   ###    ###    ###   #   #   ###   #   #   ###     ##    ###   ####    ## #   ###    ###    ## #   ###   #     
/**
 * Represents the remote builder role.
 */
class RoleRemoteBuilder {
    //       #                 #      ##                            ##          #     #     #                       
    //       #                 #     #  #                          #  #         #     #                             
    //  ##   ###    ##    ##   # #    #    ###    ###  #  #  ###    #     ##   ###   ###   ##    ###    ###   ###   
    // #     #  #  # ##  #     ##      #   #  #  #  #  #  #  #  #    #   # ##   #     #     #    #  #  #  #  ##     
    // #     #  #  ##    #     # #   #  #  #  #  # ##  ####  #  #  #  #  ##     #     #     #    #  #   ##     ##   
    //  ##   #  #   ##    ##   #  #   ##   ###    # #  ####  #  #   ##    ##     ##    ##  ###   #  #  #     ###    
    //                                     #                                                            ###         
    /**
     * Gets the settings for checking whether a creep should spawn.
     * @param {RoomEngine} engine The room engine to check for.
     * @param {bool} canSpawn Whether we can spawn a creep.
     * @return {object} The settings to use for checking spawns.
     */
    static checkSpawnSettings(engine, canSpawn) {
        var max = 2,
            creeps;

        if (!canSpawn) {
            return {
                name: "remoteBuilder",
                spawn: false,
                max: max
            };
        }

        creeps = Cache.creeps[engine.room.name];

        return {
            name: "remoteBuilder",
            spawn: (creeps && creeps.remoteBuilder || []).length < max,
            spawnFromRegion: true,
            max: max
        };
    }

    //                                 ##          #     #     #                       
    //                                #  #         #     #                             
    //  ###   ###    ###  #  #  ###    #     ##   ###   ###   ##    ###    ###   ###   
    // ##     #  #  #  #  #  #  #  #    #   # ##   #     #     #    #  #  #  #  ##     
    //   ##   #  #  # ##  ####  #  #  #  #  ##     #     #     #    #  #   ##     ##   
    // ###    ###    # #  ####  #  #   ##    ##     ##    ##  ###   #  #  #     ###    
    //        #                                                            ###         
    /**
     * Gets the settings for spawning a creep.
     * @param {object} checkSettings The settings from checking if a creep needs to be spawned.
     * @return {object} The settings for spawning a creep.
     */
    static spawnSettings(checkSettings) {
        var energy = Math.min(checkSettings.energyCapacityAvailable, 3300),
            units = Math.floor(energy / 200),
            remainder = energy % 200,
            body = [];

        body.push(...Array(units + (remainder >= 150 ? 1 : 0)).fill(WORK));
        body.push(...Array(units + (remainder >= 100 && remainder < 150 ? 1 : 0)).fill(CARRY));
        body.push(...Array(units + (remainder >= 50 ? 1 : 0)).fill(MOVE));

        return {
            body: body,
            memory: {
                role: "remoteBuilder",
                home: checkSettings.home,
                supportRoom: checkSettings.supportRoom
            }
        };
    }

    //                      #                ###                #            
    //                                        #                 #            
    //  ###   ###    ###   ##     ###  ###    #     ###   ###   # #    ###   
    // #  #  ##     ##      #    #  #  #  #   #    #  #  ##     ##    ##     
    // # ##    ##     ##    #     ##   #  #   #    # ##    ##   # #     ##   
    //  # #  ###    ###    ###   #     #  #   #     # #  ###    #  #  ###    
    //                            ###                                        
    /**
     * Assigns tasks to creeps of this role.
     * @param {RoomEngine} engine The room engine to assign tasks for.
     */
    static assignTasks(engine) {
        var roomName = room.name,
            creeps = Cache.creeps[roomName],
            creepsWithNoTask = _.filter(Utilities.creepsWithNoTask(creeps && creeps.remoteBuilder || []), (c) => _.sum(c.carry) > 0 || !c.spawning && c.ticksToLive > 150),
            allCreeps = creeps && creeps.all || [],
            assigned = [];

        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for enemy construction sites and rally to them.
        Assign.stomp(creeps, engine.tasks.hostileConstructionSites, "Stomping");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check critical repairs.
        Assign.repairStructures(creeps, allCreeps, _.filter(Cache.sortedRepairableStructuresInRoom(room), (s) => s.hits < 125000 && s.hits / s.hitsMax < 0.5), "CritRepair");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for construction sites.
        Assign.buildInRoom(creeps, allCreeps, _.filter(Game.constructionSites, (s) => _.map(allCreeps, (c) => c.room.name).indexOf(s.room.name) !== -1), "Build");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for dropped resources in current room.
        Assign.pickupResources(creeps, allCreeps, , "Pickup");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Attempt to assign harvest task to remaining creeps.
        Assign.harvest(creepsWithNoTask, "Harvesting");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Rally remaining creeps.
        Assign.moveToHomeSource(creepsWithNoTask);

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Rally to room.
        Assign.moveToHomeRoom(creepsWithNoTask);
    }
}

if (Memory.profiling) {
    require("screeps-profiler").registerObject(RoleRemoteBuilder, "RoleRemoteBuilder");
}
module.exports = RoleRemoteBuilder;
