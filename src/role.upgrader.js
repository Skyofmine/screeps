var Cache = require("cache"),
    Utilities = require("utilities"),

    Upgrader = {
        checkSpawn: (room) => {
            "use strict";

            var count, sources, max;
            
            // If there are no spawns in the room, ignore the room.
            if (Cache.spawnsInRoom(room).length === 0) {
                return;
            }

            // If there is not enough energy in storage, ignore the room.
            if (!room.storage || room.storage.store[RESOURCE_ENERGY] < 100000) {
                return;
            }

            // If we have less than max upgraders, spawn an upgrader.
            count = _.filter(Cache.creepsInRoom("upgrader", room), (c) => c.spawning || c.ticksToLive >= 150).length;
            max = 1;

            if (count < max) {
                Upgrader.spawn(room);
            }

            // Output upgrader count in the report.
            console.log("    Upgraders: " + Cache.creepsInRoom("upgrader", room).length + "/" + max);        
        },
        
        spawn: (room) => {
            "use strict";

            var body = [],
                energy, count, spawnToUse, name;

            // Fail if all the spawns are busy.
            if (_.filter(Cache.spawnsInRoom(room), (s) => !s.spawning && !Cache.spawning[s.id]).length === 0) {
                return false;
            }

            // Get the total energy in the room, limited to 3300.
            energy = Math.min(Utilities.getAvailableEnergyInRoom(room), 3300);

            // If we're not at 3300 and energy is not at capacity, bail.
            if (energy < 3300 && energy !== Utilities.getEnergyCapacityInRoom(room)) {
                return;
            }

            // Create the body based on the energy.
            for (count = 0; count < Math.floor(energy / 200); count++) {
                body.push(WORK);
            }

            if (energy % 200 >= 150) {
                body.push(WORK);
            }

            for (count = 0; count < Math.floor(energy / 200); count++) {
                body.push(CARRY);
            }

            if (energy % 200 >= 100 && energy % 200 < 150) {
                body.push(CARRY);
            }

            for (count = 0; count < Math.floor(energy / 200); count++) {
                body.push(MOVE);
            }

            if (energy % 200 >= 50) {
                body.push(MOVE);
            }

            // Create the creep from the first listed spawn that is available.
            spawnToUse = _.filter(Cache.spawnsInRoom(room), (s) => !s.spawning && !Cache.spawning[s.id])[0];
            name = spawnToUse.createCreep(body, undefined, {role: "upgrader", home: room.name});
            Cache.spawning[spawnToUse.id] = true;

            // If successful, log it.
            if (typeof name !== "number") {
                console.log("    Spawning new upgrader " + name);
                _.forEach(Cache.creepsInRoom("upgrader", room), (creep) => {
                    creep.memory.completeTask = true;
                });
                return true;
            }

            return false;
        },

        assignTasks: (room, tasks) => {
            "use strict";

            var creepsWithNoTask = _.filter(Utilities.creepsWithNoTask(Cache.creepsInRoom("upgrader", room)), (c) => _.sum(c.carry) > 0 || (!c.spawning && c.ticksToLive > 150)),
                assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check for controllers to upgrade.
            _.forEach(tasks.upgradeController.tasks, (task) => {
                _.forEach(Utilities.objectsClosestToObj(creepsWithNoTask, room.controller), (creep) => {
                    if (task.canAssign(creep)) {
                        creep.say("Controller");
                        assigned.push(creep.name);
                    }
                });
                _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                assigned = [];
            });
            
            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Attempt to get energy from containers.
            _.forEach(tasks.collectEnergy.tasks, (task) => {
                _.forEach(creepsWithNoTask, (creep) => {
                    if (task.canAssign(creep)) {
                        creep.say("Collecting");
                        assigned.push(creep.name);
                    }
                });
                _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                assigned = [];
            });

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Rally remaining creeps.
            _.forEach(TaskRally.getHarvesterTasks(creepsWithNoTask), (task) => {
                task.canAssign(task.creep);
            });
        }
    };

require("screeps-profiler").registerObject(Upgrader, "RoleUpgrader");
module.exports = Upgrader;