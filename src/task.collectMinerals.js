var Cache = require("cache"),
    Pathing = require("pathing"),
    Utilities = require("utilities"),
    CollectMinerals = function(id, resource, amount) {
        "use strict";
        
        this.init(id, resource, amount);
    };
    
CollectMinerals.prototype.init = function(id, resource, amount) {
    "use strict";
    
    this.type = "collectMinerals";
    this.id = id;
    this.resource = resource;
    this.amount = amount;
    this.object = Game.getObjectById(id);
};

CollectMinerals.prototype.canAssign = function(creep) {
    "use strict";

    var obj = this.object;

    if (this.amount < 0 || creep.spawning || creep.ticksToLive < 150 || _.sum(creep.carry) === creep.carryCapacity) {
        return false;
    }
    
    if (this.resource && this.amount) {
        if (obj.structureType === STRUCTURE_LAB && obj.mineralType !== this.resource && obj.mineralAmount < this.amount) {
            return false;
        }

        if (!(obj.structureType === STRUCTURE_LAB) && (obj.store[this.resource] || 0) < this.amount) {
            return false;
        }
    }
    
    Cache.creepTasks[creep.name] = this;
    this.toObj(creep);
    return true;
}

CollectMinerals.prototype.run = function(creep) {
    "use strict";

    var obj = this.object,
        resource = this.resource,
        creepCarry = creep.carry,
        creepCarryCapacity = creep.carryCapacity,
        amount = this.amount,
        objStore, minerals;

    // If the amount is less than 0, or the creep is about to die, or if the object doesn't exist, complete.
    if (amount < 0 || creep.ticksToLive < 150 || !obj) {
        delete creep.memory.currentTask;
        return;
    }

    objStore = obj.store;

    // If we're full, complete task.
    if (_.sum(creep.carry) === creep.carryCapacity) {
        delete creep.memory.currentTask;
        return;
    }

    // Get the resource we're going to use.
    if (obj.structureType === STRUCTURE_LAB) {
        // Lab is empty, complete task.
        if (obj.mineralType === null) {
            delete creep.memory.currentTask;
            return;
        }
        minerals = [obj.mineralType];
    } else if (resource) {
        minerals = [resource];
    } else {
        minerals = _.filter(_.keys(objStore), (m) => m !== RESOURCE_ENERGY && objStore[m] > 0);
    }

    // We're out of minerals, complete task.
    if (minerals.length === 0) {
        delete creep.memory.currentTask;
        return;
    }

    // Move to the object.
    Pathing.moveTo(creep, obj, 1);

    // Collect from the object.
    if (amount) {
        if (creep.withdraw(obj, minerals[0], Math.min(amount, creepCarryCapacity - _.sum(creepCarry))) === OK) {
            delete creep.memory.currentTask;
        }
        return;
    }

    if (creep.withdraw(obj, minerals[0]) === OK) {
        // Complete task.
        delete creep.memory.currentTask;
        return;
    }
};

CollectMinerals.prototype.toObj = function(creep) {
    "use strict";

    if (this.object) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.id,
            resource: this.resource,
            amount: this.amount
        }
    } else {
        delete creep.memory.currentTask;
    }
};

CollectMinerals.fromObj = function(creep) {
    "use strict";

    if (Game.getObjectById(creep.memory.currentTask.id)) {
        return new CollectMinerals(creep.memory.currentTask.id, creep.memory.currentTask.resource, creep.memory.currentTask.amount);
    } else {
        return;
    }
};

CollectMinerals.getStorerTasks = function(room) {
    "use strict";

    return _.map(_.filter(Cache.containersInRoom(room), (c) => _.filter(_.keys(c.store), (m) => m !== RESOURCE_ENERGY && c.store[m] >= 500).length > 0).sort((a, b) => _.sum(b.store) - _.sum(a.store)), (c) => new CollectMinerals(c.id));
};

CollectMinerals.getCleanupTasks = function(structures) {
    "use strict";

    return _.map(_.filter(structures, (s) => (s.store || [STRUCTURE_LAB, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN].indexOf(s.structureType) !== -1) && ((_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY] < _.sum(s.store)) || s.mineralAmount > 0 || s.ghodium > 0 || s.power > 0)).sort((a, b) => (a.mineralAmount || a.ghodium || a.power || (_.sum(a.store) - a.store[RESOURCE_ENERGY])) - (b.mineralAmount || b.ghodium || b.power || (_.sum(b.store) - b.store[RESOURCE_ENERGY]))), (s) => new CollectMinerals(s.id));
};

CollectMinerals.getLabTasks = function(room) {
    "use strict";

    var roomMemory = room.memory,
        labsInUse = roomMemory.labsInUse,
        labQueue = roomMemory.labQueue,
        roomStorage = room.storage,
        labs = Cache.labsInRoom(room),
        tasks = [],
        status, sourceLabs;

    if (labQueue) {
        status = labQueue.status,
        sourceLabs = labQueue.sourceLabs;
    }

    if (labsInUse) {
        _.forEach(labsInUse, (lab) => {
            if (!Game.creeps[lab.creepToBoost]) {
                tasks.push(new CollectMinerals(lab.id));
            }
        });

        _.forEach(tasks, (task) => {
            _.remove(labsInUse, (l) => l.id === task.id);
        });
    }

    if (roomStorage && labQueue && status === "clearing") {
        _.forEach(_.filter(labs, (l) => _.map(labsInUse, (liu) => liu.id).indexOf(l.id) === -1 && l.mineralAmount > 0), (lab) => {
            tasks.push(new CollectMinerals(lab.id));
        });
    }

    if (roomStorage && labsInUse) {
        _.forEach(_.filter(labsInUse, (l) => (!l.status || l.status === "emptying") && Game.getObjectById(l.id).mineralType && Game.getObjectById(l.id).mineralType !== l.resource), (lab) => {
            tasks.push(new CollectMinerals(lab.id));
        });
    }

    if (roomStorage && labQueue && status === "creating" && !Utilities.roomLabsArePaused(room)) {
        if (Game.getObjectById(sourceLabs[0]).mineralAmount === 0 && Game.getObjectById(sourceLabs[1]).mineralAmount !== 0) {
            tasks.push(new CollectMinerals(sourceLabs[1]));
        }
        if (Game.getObjectById(sourceLabs[0]).mineralAmount !== 0 && Game.getObjectById(sourceLabs[1]).mineralAmount === 0) {
            tasks.push(new CollectMinerals(sourceLabs[0]));
        }
    }

    if (roomStorage && labQueue && status === "returning") {
        _.forEach(_.filter(labs, (l) => l.mineralType === labQueue.resource), (lab) => {
            tasks.push(new CollectMinerals(lab.id));
        });
    }

    return tasks;
};

CollectMinerals.getStorageTasks = function(room) {
    "use strict";

    var tasks = [],
        amount;

    if (room.controller && room.controller.level >= 6) {
        if (room.storage && room.memory.labsInUse) {
            _.forEach(_.filter(room.memory.labsInUse, (l) => (!l.status || ["filling", "refilling"].indexOf(l.status) !== -1) && (!Game.getObjectById(l.id).mineralType || Game.getObjectById(l.id).mineralType === (l.status === "refilling" ? l.oldResource : l.resource))), (l) => {
                if ((l.status === "refilling" ? (l.oldAmount - Game.getObjectById(l.id).mineralAmount) : (l.amount - Game.getObjectById(l.id).mineralAmount)) > 0) {
                    tasks.push(new CollectMinerals(room.storage.id, l.status === "refilling" ? l.oldResource : l.resource, l.status === "refilling" ? (l.oldAmount - Game.getObjectById(l.id).mineralAmount) : (l.amount - Game.getObjectById(l.id).mineralAmount)));
                }
            });
        }

        // We only need to transfer from storage to lab when we have both storage and at least 3 labs.
        if (room.storage && room.memory.labQueue && room.memory.labQueue.status === "moving" && Cache.labsInRoom(room).length >= 3 && !Utilities.roomLabsArePaused(room)) {
            _.forEach(room.memory.labQueue.children, (resource) => {
                if ((amount = _.sum(_.filter(Cache.labsInRoom(room), (l) => l.mineralType === resource), (l) => l.mineralAmount)) < room.memory.labQueue.amount) {
                    tasks.push(new CollectMinerals(room.storage.id, resource, room.memory.labQueue.amount - amount));
                }
            });
        }

        // We only need to transfer from storage to terminal when we have both storage and terminal.
        if (room.storage && room.terminal && Memory.reserveMinerals) {
            _.forEach(room.storage.store, (amount, resource) => {
                if (resource === RESOURCE_ENERGY) {
                    return;
                }
                if (!Memory.reserveMinerals[resource]) {
                    tasks.push(new CollectMinerals(room.storage.id, resource, amount));
                } else if ((resource.startsWith("X") && resource.length === 5 ? Memory.reserveMinerals[resource] - 5000 : Memory.reserveMinerals[resource]) < amount) {
                    tasks.push(new CollectMinerals(room.storage.id, resource, amount - (resource.startsWith("X") && resource.length === 5 ? Memory.reserveMinerals[resource] - 5000 : Memory.reserveMinerals[resource])));
                }
            });
        }

        if (room.controller.level >= 8) {
            // If we have a nuker, transfer ghodium.
            _.forEach(Cache.nukersInRoom(room), (nuker) => {
                if (nuker.ghodium < nuker.ghodiumCapacity) {
                    tasks.push(new CollectMinerals(room.storage.id, RESOURCE_GHODIUM, nuker.ghodiumCapacity - nuker.ghodium));
                }
            });

            // If we have a power spawn, transfer power.
            _.forEach(Cache.powerSpawnsInRoom(room), (spawn) => {
                if (spawn.power < spawn.powerCapacity) {
                    tasks.push(new CollectMinerals(room.storage.id, RESOURCE_POWER, spawn.powerCapacity - spawn.power));
                }
            });
        }
    }

    return tasks;
};

CollectMinerals.getTerminalTasks = function(room) {
    "use strict";

    var tasks = [];

    // We only need to transfer from terminal when we have both storage and terminal.
    if (room.storage && room.terminal && Memory.reserveMinerals) {
        _.forEach(room.terminal.store, (amount, resource) => {
            if (resource === RESOURCE_ENERGY) {
                return;
            }
            if (!Memory.reserveMinerals[resource]) {
                return;
            }
            if (!room.storage.store[resource]) {
                tasks.push(new CollectMinerals(room.terminal.id, resource, Math.min(amount, (resource.startsWith("X") && resource.length === 5 ? Memory.reserveMinerals[resource] - 5000 : Memory.reserveMinerals[resource]))));
            } else if (room.storage.store[resource] < (resource.startsWith("X") && resource.length === 5 ? Memory.reserveMinerals[resource] - 5000 : Memory.reserveMinerals[resource])) {
                tasks.push(new CollectMinerals(room.terminal.id, resource, Math.min(amount, (resource.startsWith("X") && resource.length === 5 ? Memory.reserveMinerals[resource] - 5000 : Memory.reserveMinerals[resource]) - room.storage.store[resource])));
            }
        });
    }

    return tasks;
};

if (Memory.profiling) {
    require("screeps-profiler").registerObject(CollectMinerals, "TaskCollectMinerals");
}
module.exports = CollectMinerals;
