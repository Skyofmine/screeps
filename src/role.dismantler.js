var Cache = require("cache"),
    Utilities = require("utilities"),
    TaskBuild = require("task.build"),
    TaskCollectEnergy = require("task.collectEnergy"),
    TaskPickupResource = require("task.pickupResource"),
    TaskRally = require("task.rally"),
    TaskRepair = require("task.repair"),

    Dismantler = {
        checkSpawn: (room, supportRoom) => {
            "use strict";

            var max = 1;

            if (!supportRoom) {
                supportRoom = room;
            }

            // If there are no spawns in the support room, or the room is unobservable, ignore the room.
            if (Cache.spawnsInRoom(supportRoom).length === 0 || room.unobservable) {
                return;
            }

            // If we don't have a dismantler for this room, spawn one.
            if (_.filter(Cache.creepsInRoom("dismantler", room), (c) => c.spawning || c.ticksToLive >= 150).length === 0) {
                Dismantler.spawn(room, supportRoom);
            }

            // Output dismantler count in the report.
            if (max > 0) {
                Cache.log.rooms[room.name].creeps.push({
                    role: "dismantler",
                    count: Cache.creepsInRoom("dismantler", room).length,
                    max: max
                });
            }        
        },
        
        spawn: (room, supportRoom) => {
            "use strict";

            var body = [],
                energy, count, spawnToUse, name;

            // Fail if all the spawns are busy.
            if (_.filter(Game.spawns, (s) => !s.spawning && !Cache.spawning[s.id]).length === 0) {
                return false;
            }

            // Get the total energy in the room, limited to 3300.
            energy = Math.min(supportRoom.energyCapacityAvailable, 3300);

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
            spawnToUse = _.sortBy(_.filter(Game.spawns, (s) => !s.spawning && !Cache.spawning[s.id] && s.room.energyAvailable >= Utilities.getBodypartCost(body)), (s) => s.room.name === supportRoom.name ? 0 : 1)[0];
            if (!spawnToUse) {
                return false;
            }
            name = spawnToUse.createCreep(body, undefined, {role: "dismantler", home: room.name, supportRoom: supportRoom.name});
            if (spawnToUse.room.name === supportRoom.name) {
                Cache.spawning[spawnToUse.id] = true;
            }

            return typeof name !== "number";
        },

        assignTasks: (room, tasks) => {
            "use strict";

            var creepsWithNoTask = _.filter(Utilities.creepsWithNoTask(Cache.creepsInRoom("dismantler", room)), (c) => _.sum(c.carry) > 0 || (!c.spawning && c.ticksToLive > 150)),
                assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check for structures needing dismantling.
            _.forEach(creepsWithNoTask, (creep) => {
                _.forEach(tasks.dismantle.tasks, (task) => {
                    if (_.filter(task.structure.room.find(FIND_MY_CREEPS), (c) => c.memory.currentTask && c.memory.currentTask.type === "dismantle" && c.memory.currentTask.id === task.id).length > 0) {
                        return;
                    }
                    if (task.canAssign(creep)) {
                        creep.say("Dismantle");
                        assigned.push(creep.name);
                        return false;
                    }
                });
            });

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check critical repairs.
            _.forEach(_.filter(creepsWithNoTask, (c) => c.room.name !== room.name), (creep) => {
                _.forEach(TaskRepair.getCriticalTasks(creep.room), (task) => {
                    if (_.filter(task.structure.room.find(FIND_MY_CREEPS), (c) => c.memory.currentTask && c.memory.currentTask.type === "repair" && c.memory.currentTask.id === task.id).length === 0) {
                        if (task.canAssign(creep)) {
                            creep.say("CritRepair");
                            assigned.push(creep.name);
                            return false;
                        }
                    }
                });
            });

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check for construction sites.
            _.forEach(creepsWithNoTask, (creep) => {
                if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
                    var task = new TaskBuild(creep.room.find(FIND_MY_CONSTRUCTION_SITES)[0].id);
                    if (task.canAssign(creep)) {
                        creep.say("Build");
                        assigned.push(creep.name);
                    }
                }
            });

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check for unfilled links.
            if (tasks.fillEnergy.fillLinkTask) {
                _.forEach(_.filter(creepsWithNoTask, (c) => c.room.name === c.memory.supportRoom && c.carry[RESOURCE_ENERGY] && c.carry[RESOURCE_ENERGY] > 0), (creep) => {
                    if (tasks.fillEnergy.fillLinkTask.canAssign(creep)) {
                        creep.say("Link");
                        assigned.push(creep.name);
                    }
                });
            }

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check for unfilled containers.
            _.forEach([].concat.apply([], [tasks.fillEnergy.fillStorageTasks, tasks.fillMinerals.fillStorageTasks, tasks.fillEnergy.fillContainerTasks]), (task) => {
                var energyMissing = task.object.storeCapacity - _.sum(task.object.store) - _.reduce(_.filter(task.object.room.find(FIND_MY_CREEPS), (c) => c.memory.currentTask && ["fillEnergy", "fillMinerals"].indexOf(c.memory.currentTask.type) !== -1 && c.memory.currentTask.id === task.id), function(sum, c) {return sum + (c.carry[RESOURCE_ENERGY] || 0);}, 0)
                if (energyMissing > 0) {
                    _.forEach(Utilities.objectsClosestToObj(creepsWithNoTask, task.object), (creep) => {
                        if (task.canAssign(creep)) {
                            creep.say("Container");
                            assigned.push(creep.name);
                            energyMissing -= creep.carry[RESOURCE_ENERGY] || 0;
                            if (energyMissing <= 0) {
                                return false;
                            }
                        }
                    });

                    _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                    assigned = [];
                }
            });

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Check for dropped resources in current room.
            _.forEach(creepsWithNoTask, (creep) => {
                _.forEach(TaskPickupResource.getTasks(creep.room), (task) => {
                    if (_.filter(task.resource.room.find(FIND_MY_CREEPS), (c) => c.memory.currentTask && c.memory.currentTask.type === "pickupResource" && c.memory.currentTask.id === task.id).length > 0) {
                        return;
                    }
                    if (task.canAssign(creep)) {
                        creep.say("Pickup");
                        assigned.push(creep.name);
                        return false;
                    }
                });
            });

            _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
            assigned = [];

            if (creepsWithNoTask.length === 0) {
                return;
            }

            // Rally remaining creeps.
            _.forEach(creepsWithNoTask, (creep) => {
                var task = new TaskRally(creep.memory.home);
                task.canAssign(creep);
            });
        }
    };

require("screeps-profiler").registerObject(Dismantler, "RoleDismantler");
module.exports = Dismantler;
