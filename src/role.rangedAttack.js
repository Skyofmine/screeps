var Cache = require("cache"),
    Utilities = require("utilities"),
    TaskHeal = require("task.heal"),
    TaskRally = require("task.rally"),
    TaskRangedAttack = require("task.rangedAttack"),

    Ranged = {
        checkSpawn: (room) => {
            "use strict";

            var num = 0, max = 0;
            
            // If there are no spawns in the room, ignore the room.
            if (Cache.spawnsInRoom(room).length === 0) {
                return;
            }

            // Loop through the room ranged attackers to see if we need to spawn a creep.
            if (Memory.maxCreeps.rangedAttack) {
                _.forEach(Memory.maxCreeps.rangedAttack[room.name], (value, toRoom) => {
                    var count = _.filter(Cache.creepsInRoom("rangedAttack", room), (c) => c.memory.defending === toRoom).length;

                    num += count;
                    max += value.maxCreeps;

                    if (count < value.maxCreeps) {
                        Ranged.spawn(room, toRoom);
                    }
                });
            }

            // Output ranged attacker count in the report.
            if (max > 0) {
                console.log("    Ranged Attackers: " + num + "/" + max);
            }        
        },
        
        spawn: (room, toRoom) => {
            "use strict";

            var body = [],
                energy, count, spawnToUse, name;

            // Fail if all the spawns are busy.
            if (_.filter(Cache.spawnsInRoom(room), (s) => !s.spawning && !Cache.spawning[s.id]).length === 0) {
                return false;
            }

            // Get the total energy in the room, limited to 1850.
            energy = Math.min(Utilities.getAvailableEnergyInRoom(room), 1850);

            // If we're not at 1850 and energy is not at capacity, bail.
            if (energy < 1850 && energy !== Utilities.getEnergyCapacityInRoom(room)) {
                return;
            }

            // Create the body based on the energy.
            for (count = 0; count < Math.floor(energy / 350); count++) {
                body.push(TOUGH);
                body.push(TOUGH);
                body.push(TOUGH);
                body.push(TOUGH);
                body.push(TOUGH);
            }

            if (energy % 350 >= 150 && energy % 350 < 250) {
                body.push(TOUGH);
                body.push(TOUGH);
                body.push(TOUGH);
                body.push(TOUGH);
                body.push(TOUGH);
            }

            for (count = 0; count < Math.floor(energy / 350); count++) {
                body.push(MOVE);
                body.push(MOVE);
                body.push(MOVE);
            }

            if (energy % 350 >= 50) {
                body.push(MOVE);
            }

            if (energy % 350 >= 100) {
                body.push(MOVE);
            }

            if ((energy % 350 >= 200 && energy % 350 < 250) || (energy % 350 >= 300)) {
                body.push(MOVE);
            }

            for (count = 0; count < Math.floor(energy / 350); count++) {
                body.push(RANGED_ATTACK);
            }

            if (energy % 350 >= 250) {
                body.push(RANGED_ATTACK);
            }

            // Create the creep from the first listed spawn that is available.
            spawnToUse = _.filter(Cache.spawnsInRoom(room), (s) => !s.spawning && !Cache.spawning[s.id])[0];
            name = spawnToUse.createCreep(body, undefined, {role: "rangedAttack", home: room.name, defending: toRoom});
            Cache.spawning[spawnToUse.id] = true;

            // If successful, log it.
            if (typeof name !== "number") {
                console.log("    Spawning new ranged attacker " + name);
                _.forEach(Cache.creepsInRoom("worker", room), (creep) => {
                    creep.memory.completeTask = true;
                    return false;
                });
                return true;
            }

            return false;
        },

        assignTasks: (room, tasks) => {
            "use strict";

            var creepsWithNoTask = _.filter(Utilities.creepsWithNoTask(Cache.creepsInRoom("rangedAttack", room)), (c) => !c.spawning && c.ticksToLive > 150),
                assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // If the creeps are not in the room, rally them.
            _.forEach(_.filter(creepsWithNoTask, (c) => c.room.name !== c.memory.defending), (creep) => {
                var task = TaskRally.getDefenderTask(creep);
                if (task.canAssign(creep)) {
                    assigned.push(creep.name);
                };
            });

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }
            
            // Find hostiles to attack.
            _.forEach(creepsWithNoTask, (creep) => {
                var task = TaskRangedAttack.getDefenderTask(creep);
                if (task && task.canAssign(creep)) {
                    creep.say("Die!", true);
                    assigned.push(creep.name);
                }
            });

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Rally the troops!
            _.forEach(_.filter(creepsWithNoTask, (c) => c.room.name === c.memory.defending), (creep) => {
                var task = TaskRally.getDefenderTask(creep);
                if (task.canAssign(creep)) {
                    assigned.push(creep.name);
                };
            });
        }
    };

require("screeps-profiler").registerObject(Ranged, "RoleRangedAttack");
module.exports = Ranged;
