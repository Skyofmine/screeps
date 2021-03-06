const Assign = require("assign"),
    Cache = require("cache"),
    Utilities = require("utilities");

//  ####           ##           ####            ##                     #
//  #   #           #            #  #          #  #                    #
//  #   #   ###     #     ###    #  #   ###    #      ###   # ##    ## #   ###   # ##
//  ####   #   #    #    #   #   #  #  #   #  ####   #   #  ##  #  #  ##  #   #  ##  #
//  # #    #   #    #    #####   #  #  #####   #     #####  #   #  #   #  #####  #
//  #  #   #   #    #    #       #  #  #       #     #      #   #  #  ##  #      #
//  #   #   ###    ###    ###   ####    ###    #      ###   #   #   ## #   ###   #
/**
 * Represents the defender role.
 */
class RoleDefender {
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
        let settings = engine.checkSpawnSettingsCache("defender");

        if (settings) {
            return settings;
        }

        const max = 1;

        if (!canSpawn) {
            return {
                name: "defender",
                spawn: false,
                max
            };
        }

        const {creeps: {[engine.room.name]: creeps}} = Cache,
            defenders = creeps && creeps.defender || [];

        settings = {
            name: "defender",
            spawn: _.filter(defenders || [], (c) => c.spawning || c.ticksToLive >= 300).length < max,
            spawnFromRegion: true,
            max
        };

        if (defenders.length > 0) {
            engine.room.memory.maxCreeps.defender = {
                cache: settings,
                cacheUntil: Game.time + (settings.spawn ? 25 : Math.min(..._.map(defenders, (c) => c.spawning ? 25 : Math.min(c.ticksToLive - 300, 25))))
            };
        }

        return settings;
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
        return {
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL],
            memory: {
                role: "defender",
                home: checkSettings.home,
                supportRoom: checkSettings.supportRoom,
                quadrant: 0
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
     * @return {void}
     */
    static assignTasks(engine) {
        const {room: {name: roomName}, tasks} = engine,
            {creeps: {[roomName]: creeps}} = Cache,
            creepsWithNoTask = _.filter(Utilities.creepsWithNoTask(creeps && creeps.defender || []), (c) => !c.spawning);

        if (creepsWithNoTask.length === 0) {
            return;
        }

        // If we have a target, attack it.
        Assign.attackTarget(creepsWithNoTask, tasks.hostiles, "Die!");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // If there is a hostile in the quadrant, attack it.
        Assign.attackInQuadrant(creepsWithNoTask, tasks.hostiles, "Die!");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // If there is a source keeper in the quadrant under 200 ticks, move towards it.
        Assign.moveToSourceKeeper(creepsWithNoTask, tasks.keepers);

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Rally to the room.
        Assign.moveToRoom(creepsWithNoTask, roomName);

        // Move to the next quadrant.
        _.forEach(_.filter(creepsWithNoTask, (c) => !c.memory.currentTask || c.memory.currentTask.unimportant), (creep) => {
            creep.memory.quadrant = (creep.memory.quadrant + 1) % 4 || 0;
        });
    }
}

if (Memory.profiling) {
    require("screeps-profiler").registerObject(RoleDefender, "RoleDefender");
}
module.exports = RoleDefender;
