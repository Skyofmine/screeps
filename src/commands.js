const Cache = require("cache");

//   ###                                          #
//  #   #                                         #
//  #       ###   ## #   ## #    ###   # ##    ## #   ###
//  #      #   #  # # #  # # #      #  ##  #  #  ##  #
//  #      #   #  # # #  # # #   ####  #   #  #   #   ###
//  #   #  #   #  # # #  # # #  #   #  #   #  #  ##      #
//   ###    ###   #   #  #   #   ####  #   #   ## #  ####
/**
 * Commands intended to be used in the Screeps console.  Can be used elsewhere as well.
 */
class Commands {
    //          #     #   ##   ##    ##
    //          #     #  #  #   #     #
    //  ###   ###   ###  #  #   #     #    #  #
    // #  #  #  #  #  #  ####   #     #    #  #
    // # ##  #  #  #  #  #  #   #     #     # #
    //  # #   ###   ###  #  #  ###   ###     #
    //                                      #
    /**
     * Adds an ally.  All creeps belonging to this user will not be attacked.
     * @param {string} name The ally to add.
     * @return {void}
     */
    static addAlly(name) {
        Memory.allies.push(name);
    }

    //          #     #   ##    #
    //          #     #  #  #
    //  ###   ###   ###   #    ##     ###  ###
    // #  #  #  #  #  #    #    #    #  #  #  #
    // # ##  #  #  #  #  #  #   #     ##   #  #
    //  # #   ###   ###   ##   ###   #     #  #
    //                                ###
    /**
     * Adds a sign to a room.  When a reserver or upgrader is near the controller, it will apply the sign.
     * @param {string} roomName The name of the room to sign.
     * @param {string} text The text to sign.
     * @return {void}
     */
    static addSign(roomName, text) {
        if (!Memory.signs) {
            Memory.signs = {};
        }
        if (text) {
            Memory.signs[roomName] = text;
        } else {
            delete Memory.signs[roomName];
        }
    }

    //                    #       #  ###
    //                            #  #  #
    //  ###  # #    ##   ##     ###  #  #   ##    ##   # #
    // #  #  # #   #  #   #    #  #  ###   #  #  #  #  ####
    // # ##  # #   #  #   #    #  #  # #   #  #  #  #  #  #
    //  # #   #     ##   ###    ###  #  #   ##    ##   #  #
    /**
     * Directs creeps to avoid a room.
     * @param {string} roomName The name of the room to avoid.
     * @param {bool} avoid Whether to avoid the room or not.
     * @return {void}
     */
    static avoidRoom(roomName, avoid) {
        if (avoid && Memory.avoidRooms.indexOf(roomName) === -1) {
            Memory.avoidRooms.push(roomName);
        }
        if (!avoid) {
            _.remove(Memory.avoidRooms, (r) => r === roomName);
        }
    }

    //                    #       #   ##
    //                            #  #  #
    //  ###  # #    ##   ##     ###   #     ###  #  #   ###  ###    ##
    // #  #  # #   #  #   #    #  #    #   #  #  #  #  #  #  #  #  # ##
    // # ##  # #   #  #   #    #  #  #  #  #  #  #  #  # ##  #     ##
    //  # #   #     ##   ###    ###   ##    ###   ###   # #  #      ##
    //                                        #
    /**
     * Directs creeps to avoid a square.
     * @param {number} x The X coordinate of the square to avoid.
     * @param {number} y The Y coordinate of the square to avoid.
     * @param {string} roomName The name of the room of the square to avoid.
     * @param {bool} avoid Whether to avoid the square or not.
     * @return {void}
     */
    static avoidSquare(x, y, roomName, avoid) {
        if (avoid) {
            if (!Memory.avoidSquares[roomName]) {
                Memory.avoidSquares[roomName] = [];
            }
            Memory.avoidSquares[roomName].push({x, y});
        }
        if (!avoid) {
            if (Memory.avoidSquares[roomName]) {
                _.remove(Memory.avoidSquares[roomName], (s) => s.x === x && s.y === y);
            }
        }
    }

    //       ##           #          #  #   #
    //        #                      ####
    //  ##    #     ###  ##    # #   ####  ##    ###    ##
    // #      #    #  #   #    ####  #  #   #    #  #  # ##
    // #      #    # ##   #    #  #  #  #   #    #  #  ##
    //  ##   ###    # #  ###   #  #  #  #  ###   #  #   ##
    /**
     * Claim a room that's currently being reserved.  Only works if you already have a reserver on the controller.
     * @param {string} roomName The name of the room to claim.
     * @return {void}
     */
    static claimMine(roomName) {
        if (Game.rooms[roomName] && Cache.creeps[roomName]) {
            _.forEach(Cache.creeps[roomName].remoteReserver, (creep) => {
                creep.claimController(Game.rooms[roomName].controller);
            });
        }
    }

    //       ##           #          ###
    //        #                      #  #
    //  ##    #     ###  ##    # #   #  #   ##    ##   # #
    // #      #    #  #   #    ####  ###   #  #  #  #  ####
    // #      #    # ##   #    #  #  # #   #  #  #  #  #  #
    //  ##   ###    # #  ###   #  #  #  #   ##    ##   #  #
    /**
     * Claims a room.
     * @param {string} fromRoomName The name of the room to spawn the claimer from.
     * @param {string} toRoomName The name of the room to claim.
     * @param {bool} claim Whether to claim the room or not.
     * @return {void}
     */
    static claimRoom(fromRoomName, toRoomName, claim) {
        if (!Memory.maxCreeps.claimer) {
            Memory.maxCreeps.claimer = {};
        }

        if (!Memory.maxCreeps.claimer[fromRoomName]) {
            Memory.maxCreeps.claimer[fromRoomName] = {};
        }

        if (claim) {
            Memory.maxCreeps.claimer[fromRoomName][toRoomName] = true;
        } else {
            delete Memory.maxCreeps.claimer[fromRoomName][toRoomName];
        }
    }

    //                          #           ##
    //                          #          #  #
    //  ##   ###    ##    ###  ###    ##   #  #  ###   # #   #  #
    // #     #  #  # ##  #  #   #    # ##  ####  #  #  ####  #  #
    // #     #     ##    # ##   #    ##    #  #  #     #  #   # #
    //  ##   #      ##    # #    ##   ##   #  #  #     #  #    #
    //                                                        #
    /**
     * Creates an army.
     * @param {string} armyName The name of the army.
     * @param {object} options The options for the army.
     * @return {void}
     */
    static createArmy(armyName, options) {
        if (options === void 0) {
            delete Memory.army[armyName];
        } else {
            Memory.army[armyName] = options;
            Memory.army[armyName].directive = "preparing";
        }
    }

    //    #   #                              #    ##
    //    #                                  #     #
    //  ###  ##     ###   # #    ###  ###   ###    #     ##
    // #  #   #    ##     ####  #  #  #  #   #     #    # ##
    // #  #   #      ##   #  #  # ##  #  #   #     #    ##
    //  ###  ###   ###    #  #   # #  #  #    ##  ###    ##
    /**
     * Dismantle a location within a room.
     * @param {number} x The X coordinate of the object to dismantle.
     * @param {number} y The Y coordinate of the object to dismantle.
     * @param {string} roomName The room to dismantle in.
     * @return {void}
     */
    static dismantle(x, y, roomName) {
        if (!Memory.dismantle) {
            Memory.dismantle = {};
        }

        if (!Memory.dismantle[roomName]) {
            Memory.dismantle[roomName] = [];
        }

        Memory.dismantle[roomName].push({x, y});
    }

    //    #                                         #        ###                      ##                #                ##    ##
    //    #                                         #        #  #                    #  #               #                 #     #
    //  ###   ##   #  #  ###    ###  ###    ###   ###   ##   #  #   ##    ##   # #   #      ##   ###   ###   ###    ##    #     #     ##   ###
    // #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  # ##  ###   #  #  #  #  ####  #     #  #  #  #   #    #  #  #  #   #     #    # ##  #  #
    // #  #  #  #  ####  #  #   ##   #     # ##  #  #  ##    # #   #  #  #  #  #  #  #  #  #  #  #  #   #    #     #  #   #     #    ##    #
    //  ###   ##   ####  #  #  #     #      # #   ###   ##   #  #   ##    ##   #  #   ##    ##   #  #    ##  #      ##   ###   ###    ##   #
    //                          ###
    /**
     * Downgrades the controller in a room.
     * @param {string} fromRoomName The name of the room to spawn the downgrader from.
     * @param {string} toRoomName The name of the room to downgrade the controller in.
     * @param {bool} downgrade Whether to downgrade the room's controller or not.
     * @return {void}
     */
    static downgradeRoomController(fromRoomName, toRoomName, downgrade) {
        if (!Memory.maxCreeps.downgrader) {
            Memory.maxCreeps.downgrader = {};
        }

        if (!Memory.maxCreeps.downgrader[fromRoomName]) {
            Memory.maxCreeps.downgrader[fromRoomName] = {};
        }

        if (downgrade) {
            Memory.maxCreeps.downgrader[fromRoomName][toRoomName] = true;
        } else {
            delete Memory.maxCreeps.downgrader[fromRoomName][toRoomName];
        }
    }

    // ###    ##    ##    ##   # #    ##   ###
    // #  #  # ##  #     #  #  # #   # ##  #  #
    // #     ##    #     #  #  # #   ##    #
    // #      ##    ##    ##    #     ##   #
    /**
     * Recover from an emergency.
     * @return {void}
     */
    static recover() {
        _.forEach(Game.spawns, (spawn) => spawn.createCreep([MOVE, MOVE, CARRY, CARRY, CARRY, CARRY], `storer-emerg-${spawn.room.name}-${spawn.name}`, {role: "storer", home: spawn.room.name}));
    }

    //                                      ##   ##    ##
    //                                     #  #   #     #
    // ###    ##   # #    ##   # #    ##   #  #   #     #    #  #
    // #  #  # ##  ####  #  #  # #   # ##  ####   #     #    #  #
    // #     ##    #  #  #  #  # #   ##    #  #   #     #     # #
    // #      ##   #  #   ##    #     ##   #  #  ###   ###     #
    //                                                        #
    /**
     * Removes an ally.
     * @param {string} name The ally to remove.
     * @return {void}
     */
    static removeAlly(name) {
        _.pull(Memory.allies, name);
    }

    //                           #    ###                      #  #         #           #
    //                           #    #  #                     ####         #
    // ###    ##    ###    ##   ###   ###    ###   ###    ##   ####   ###  ###   ###   ##    #  #
    // #  #  # ##  ##     # ##   #    #  #  #  #  ##     # ##  #  #  #  #   #    #  #   #     ##
    // #     ##      ##   ##     #    #  #  # ##    ##   ##    #  #  # ##   #    #      #     ##
    // #      ##   ###     ##     ##  ###    # #  ###     ##   #  #   # #    ##  #     ###   #  #
    /**
     * Resets a wartime cost matrix for a room.  It will be automatically recalculated.
     * @param {string} roomName The name of the room to reset the base matrix for.
     * @return {void}
     */
    static resetBaseMatrix(roomName) {
        Memory.baseMatrixes[roomName] = {};
    }

    //               #     ##                #           #                       ##
    //               #    #  #               #                                  #  #
    //  ###    ##   ###   #      ##   ###   ###    ###  ##    ###    ##   ###    #     ##   #  #  ###    ##    ##
    // ##     # ##   #    #     #  #  #  #   #    #  #   #    #  #  # ##  #  #    #   #  #  #  #  #  #  #     # ##
    //   ##   ##     #    #  #  #  #  #  #   #    # ##   #    #  #  ##    #     #  #  #  #  #  #  #     #     ##
    // ###     ##     ##   ##    ##   #  #    ##   # #  ###   #  #   ##   #      ##    ##    ###  #      ##    ##
    /**
     * Set a container's source.  Useful when you want to have a container for a source be at a location different than default, ie: E36N11.
     * @param {string} containerId The container ID to assign to a source.
     * @param {string} sourceId The source ID to assign to a container.
     * @return {void}
     */
    static setContainerSource(containerId, sourceId) {
        Memory.containerSource[containerId] = sourceId;
    }

    //               #    ###                     ###
    //               #    #  #                     #
    //  ###    ##   ###   #  #   ##    ##   # #    #    #  #  ###    ##
    // ##     # ##   #    ###   #  #  #  #  ####   #    #  #  #  #  # ##
    //   ##   ##     #    # #   #  #  #  #  #  #   #     # #  #  #  ##
    // ###     ##     ##  #  #   ##    ##   #  #   #      #   ###    ##
    //                                                   #    #
    /**
     * Set the room type.  Options should be an object containing at least a "type" key.
     * @param {string} roomName The name of the room.
     * @param {string} region The region of the room.
     * @param {object} options The options for the room.
     * @return {void}
     */
    static setRoomType(roomName, region, options) {
        if (options === void 0) {
            delete Memory.rooms[roomName].roomType;
        } else {
            if (!Memory.rooms[roomName]) {
                Memory.rooms[roomName] = {};
            }
            Memory.rooms[roomName].roomType = options;
            Memory.rooms[roomName].region = region;
        }
    }

    //         #                 #     ##   ##    ##     ##
    //         #                 #    #  #   #     #    #  #
    //  ###   ###    ###  ###   ###   #  #   #     #    #     ###    ##    ##   ###    ###
    // ##      #    #  #  #  #   #    ####   #     #    #     #  #  # ##  # ##  #  #  ##
    //   ##    #    # ##  #      #    #  #   #     #    #  #  #     ##    ##    #  #    ##
    // ###      ##   # #  #       ##  #  #  ###   ###    ##   #      ##    ##   ###   ###
    //                                                                          #
    /**
     * Starts all creeps moving again.
     * @return {void}
     */
    static startAllCreeps() {
        _.forEach(Game.creeps, (creep) => {
            delete creep.memory.stop;
        });
    }

    //         #                 #     ##
    //         #                 #    #  #
    //  ###   ###    ###  ###   ###   #     ###    ##    ##   ###
    // ##      #    #  #  #  #   #    #     #  #  # ##  # ##  #  #
    //   ##    #    # ##  #      #    #  #  #     ##    ##    #  #
    // ###      ##   # #  #       ##   ##   #      ##    ##   ###
    //                                                        #
    /**
     * Starts a creep moving again.
     * @param {string} name The name of the creep to start moving.
     * @return {void}
     */
    static startCreep(name) {
        if (Game.creeps[name]) {
            delete Game.creeps[name].memory.stop;
        }
    }

    //         #                 ##
    //         #                #  #
    //  ###   ###    ##   ###   #     ###    ##    ##   ###
    // ##      #    #  #  #  #  #     #  #  # ##  # ##  #  #
    //   ##    #    #  #  #  #  #  #  #     ##    ##    #  #
    // ###      ##   ##   ###    ##   #      ##    ##   ###
    //                    #                             #
    /**
     * Stops a creep from moving.
     * @param {string} name The name of the creep to stop moving.
     * @return {void}
     */
    static stopCreep(name) {
        if (Game.creeps[name]) {
            Game.creeps[name].memory.stop = true;
        }
    }
}

if (Memory.profiling) {
    require("screeps-profiler").registerObject(Commands, "Commands");
}
module.exports = Commands;
