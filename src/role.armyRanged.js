var Cache = require("cache"),
    Utilities = require("utilities"),
    TaskRally = require("task.rally"),

    Ranged = {
        checkSpawn: (army) => {
            "use strict";

            var count = Cache.creepsInArmy("armyRanged", army).length, max = Memory.army[army].ranged.maxCreeps;

            if (count < max) {
                Ranged.spawn(army);
            }

            // Output ranged attacker count in the report.
            if (max > 0) {
                Cache.log.army[army].creeps.push({
                    role: "armyRanged",
                    count: count,
                    max: max
                });
            }        
        },
        
        spawn: (army) => {
            "use strict";

            var body = [],
                energy, count, spawnToUse, name;

            // Fail if all the spawns are busy.
            if (_.filter(Game.spawns, (s) => !s.spawning && !Cache.spawning[s.id]).length === 0) {
                return false;
            }

            // Create the body of the army.
            for (count = 0; count < Memory.army[army].ranged.units; count++) {
                body.push(RANGED_ATTACK);
                body.push(MOVE);
            }

            // Create the creep from the first listed spawn that is available.
            spawnToUse = _.filter(Game.spawns, (s) => !s.spawning && !Cache.spawning[s.id])[0];
            name = spawnToUse.createCreep(body, undefined, {role: "armyRanged", army: army});
            Cache.spawning[spawnToUse.id] = true;

            return typeof name !== "number";
        },

        assignTasks: (army, directive, tasks) => {
            "use strict";

            var creepsWithNoTask = _.filter(Utilities.creepsWithNoTask(Cache.creepsInArmy("armyRanged", army)), (c) => !c.spawning && c.ticksToLive > 150),
                assigned = [],
                task;

            if (creepsWithNoTask.length === 0) {
                return;
            }

            switch (directive) {
                case "building":
                    // Rally to army's building location.
                    task = new TaskRally(Memory.army[army].buildRoom);
                    _.forEach(creepsWithNoTask, (creep) => {
                        creep.say("Building");
                        task.canAssign(creep);
                    });
                    break;
                case "staging":
                    // Rally to army's staging location.
                    task = new TaskRally(Memory.army[army].stageRoom);
                    _.forEach(creepsWithNoTask, (creep) => {
                        creep.say("Staging");
                        task.canAssign(creep);
                    });
                    break;
                case "dismantle":
                    // Return to army's staging location if missing 1000 hits.
                    task = new TaskRally(Memory.army[army].stageRoom);
                    _.forEach(_.filter(creepsWithNoTask, (c) => c.room.name === Memory.army[army].attackRoom && c.hitsMax - c.hits >= 1000), (creep) => {
                        creep.say("Ouch!");
                        task.canAssign(creep);
                        assigned.push(creep.name);
                    });

                    _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                    assigned = [];

                    if (creepsWithNoTask.length === 0) {
                        return;
                    }

                    // Attack hostile units within 2 of the dismantle location.
                    _.forEach(tasks.ranged.tasks, (task) => {
                        _.forEach(creepsWithNoTask, (creep) => {
                            if (task.canAssign(creep)) {
                                creep.say("Die!", true);
                                assigned.push(creep.name);
                            }
                        });

                        _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                        assigned = [];

                        if (creepsWithNoTask.length === 0) {
                            return false;
                        }
                    });
                    
                    if (creepsWithNoTask.length === 0) {
                        return;
                    }

                    // Rally to near dismantle location.
                    if (Game.rooms[Memory.army[army].attackRoom] && Memory.army[army].dismantle.length > 0) {
                        task = new TaskRally(Memory.army[army].dismantle[0]);
                        task.range = 3;
                        _.forEach(creepsWithNoTask, (creep) => {
                            task.canAssign(creep);
                            assigned.push(creep.name);
                        });

                        _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                        assigned = [];

                        if (creepsWithNoTask.length === 0) {
                            return;
                        }
                    }

                    // Rally to army's attack location.
                    task = new TaskRally(Memory.army[army].attackRoom);
                    _.forEach(creepsWithNoTask, (creep) => {
                        task.canAssign(creep);
                    });

                    break;
                case "attack":
                    // Attack hostile units.
                    _.forEach(tasks.ranged.tasks, (task) => {
                        _.forEach(creepsWithNoTask, (creep) => {
                            if (task.canAssign(creep)) {
                                creep.say("Die!", true);
                                assigned.push(creep.name);
                            }
                        });

                        _.remove(creepsWithNoTask, (c) => assigned.indexOf(c.name) !== -1);
                        assigned = [];

                        if (creepsWithNoTask.length === 0) {
                            return false;
                        }
                    });
                    
                    if (creepsWithNoTask.length === 0) {
                        return;
                    }

                    // Rally to army's attack location.
                    task = new TaskRally(Memory.army[army].attackRoom);
                    _.forEach(creepsWithNoTask, (creep) => {
                        task.canAssign(creep);
                    });

                    break;
            }
        }
    };

require("screeps-profiler").registerObject(Ranged, "ArmyRanged");
module.exports = Ranged;
