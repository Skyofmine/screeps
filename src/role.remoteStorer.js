const Assign = require("assign"),
    Cache = require("cache"),
    Utilities = require("utilities");

//  ####           ##           ####                         #             ###    #
//  #   #           #           #   #                        #            #   #   #
//  #   #   ###     #     ###   #   #   ###   ## #    ###   ####    ###   #      ####    ###   # ##    ###   # ##
//  ####   #   #    #    #   #  ####   #   #  # # #  #   #   #     #   #   ###    #     #   #  ##  #  #   #  ##  #
//  # #    #   #    #    #####  # #    #####  # # #  #   #   #     #####      #   #     #   #  #      #####  #
//  #  #   #   #    #    #      #  #   #      # # #  #   #   #  #  #      #   #   #  #  #   #  #      #      #
//  #   #   ###    ###    ###   #   #   ###   #   #   ###     ##    ###    ###     ##    ###   #       ###   #
/**
 * Represents the remote storer role.
 */
class RoleRemoteStorer {
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
        const {room} = engine,
            containers = Cache.containersInRoom(room);
        let max = 0,
            foundFirstSource, containerIdToCollectFrom;

        // If there are no containers in the room, ignore the room.
        if (containers.length === 0) {
            return {
                name: "remoteStorer",
                spawn: false,
                max: 0
            };
        }

        const {containerSource, lengthToContainer} = Memory,
            sources = Array.prototype.concat.apply([], [room.find(FIND_SOURCES), room.find(FIND_MINERALS)]),
            {supportRoom} = engine,
            {name: supportRoomName} = supportRoom,
            {controller: {level: supportRoomRcl}} = supportRoom,
            {creeps: {[room.name]: creeps}} = Cache,
            remoteStorers = creeps && creeps.remoteStorer;

        foundFirstSource = false;

        // Loop through containers to see if we have anything we need to spawn.
        _.forEach(containers, (container) => {
            const {id: containerId} = container;
            let count = 0;

            if (!containerSource[containerId]) {
                ({0: {id: containerSource[containerId]}} = Utilities.objectsClosestToObj(sources, container));
            }

            const source = Game.getObjectById(containerSource[containerId]);

            if (source instanceof Mineral) {
                // If this container is for a mineral, bail if there are no minerals left.
                if (source.mineralAmount === 0) {
                    return;
                }
            } else if (!foundFirstSource) {
                // If this is the first energy source, don't count the worker.
                count = -1;
                foundFirstSource = true;
            }

            // Calculate the length the storers need to travel.
            const length = lengthToContainer[containerId] ? lengthToContainer[containerId][supportRoomName] : 0;

            // Calculate number of storers needed.
            count += Math.max(Math.ceil(length / [18, 18, 18, 18, 30, 44, 54, 62, 62][supportRoomRcl]), 0);
            max += count;

            // If we don't have enough remote storers for this container, spawn one.
            if (canSpawn && !containerIdToCollectFrom && _.filter(remoteStorers || [], (c) => (c.spawning || c.ticksToLive >= 150 + length * 2) && c.memory.container === containerId).length < count) {
                containerIdToCollectFrom = containerId;
            }
        });

        if (!canSpawn) {
            return {
                name: "remoteStorer",
                spawn: false,
                max
            };
        }

        return {
            name: "remoteStorer",
            spawn: !!containerIdToCollectFrom,
            max,
            spawnFromRegion: true,
            containerIdToCollectFrom,
            supportRoomRcl
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
        let body;

        switch (checkSettings.supportRoomRcl) {
            case 3:
                body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                break;
            case 4:
                body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                break;
            case 5:
                body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                break;
            case 6:
                body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                break;
            case 7:
            case 8:
                body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
                break;
        }

        return {
            body,
            memory: {
                role: "remoteStorer",
                home: checkSettings.home,
                supportRoom: checkSettings.supportRoom,
                container: checkSettings.containerIdToCollectFrom
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
        const {creeps: {[engine.room.name]: creeps}} = Cache,
            creepsWithNoTask = Utilities.creepsWithNoTask(creeps && creeps.remoteStorer || []),
            allCreeps = creeps && creeps.all || [],
            {supportRoom} = engine;

        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for dropped resources in current room.
        Assign.pickupResourcesInCurrentRoom(creepsWithNoTask, allCreeps, "Pickup");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for unfilled storage.
        Assign.fillStorageWithEnergy(creepsWithNoTask, allCreeps, supportRoom, "Storage");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for unfilled storage for minerals.
        Assign.fillWithMinerals(creepsWithNoTask, supportRoom.storage, Cache.rooms[supportRoom.name].tasks.storageResourcesNeeded, "Storage");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for unfilled terminals for minerals.
        Assign.fillWithMinerals(creepsWithNoTask, supportRoom.terminal, void 0, "Terminal");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Check for unfilled containers.
        Assign.fillWithEnergy(creepsWithNoTask, allCreeps, Cache.containersInRoom(supportRoom), "Container");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Attempt to get energy from containers.
        Assign.collectEnergyFromHomeContainer(creepsWithNoTask, "Collecting");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Attempt to get minerals from containers.
        Assign.collectMineralsFromHomeContainer(creepsWithNoTask, "Collecting");

        _.remove(creepsWithNoTask, (c) => c.memory.currentTask && (!c.memory.currentTask.unimportant || c.memory.currentTask.priority === Game.time));
        if (creepsWithNoTask.length === 0) {
            return;
        }

        // Rally remaining creeps.
        Assign.moveToHomeOrSupport(creepsWithNoTask);
    }
}

if (Memory.profiling) {
    require("screeps-profiler").registerObject(RoleRemoteStorer, "RoleRemoteStorer");
}
module.exports = RoleRemoteStorer;
