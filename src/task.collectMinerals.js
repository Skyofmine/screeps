var Task = require("task"),
    Cache = require("cache"),
    Pathing = require("pathing"),
    CollectMinerals = function(id, resource, amount) {
        Task.call(this);

        this.type = "collectMinerals";
        this.id = id;
        this.resource = resource;
        this.amount = amount;
        this.object = Cache.getObjectById(id);
    };
    
CollectMinerals.prototype = Object.create(Task.prototype);
CollectMinerals.prototype.constructor = CollectMinerals;

CollectMinerals.prototype.canAssign = function(creep) {
    "use strict";

    if (creep.spawning || creep.ticksToLive < 150 || _.sum(creep.carry) === creep.carryCapacity) {
        return false;
    }
    
    Task.prototype.assign.call(this, creep);
    return true;
}

CollectMinerals.prototype.run = function(creep) {
    "use strict";

    var minerals;

    // Object not found, complete task.
    if (!this.object) {
        Task.prototype.complete.call(this, creep);
        return;
    }

    // Get the resource we're going to use.
    if (this.object instanceof StructureLab) {
        minerals = [this.object.mineralType];
    } else if (this.resource) {
        minerals = [this.resource];
    } else {
        minerals = _.filter(_.keys(this.object.store), (m) => m !== RESOURCE_ENERGY && this.object.store[m] > 0);
    }

    // We're out of minerals, complete task.
    if (minerals.length === 0) {
        Task.prototype.complete.call(this, creep);
        return;
    }

    // Move to the object.
    Pathing.moveTo(creep, this.object, 1);

    // Collect from the object.
    if (this.amount) {
        if (creep.withdraw(this.object, minerals[0], Math.min(this.amount, creep.carryCapacity - _.sum(creep.carry))) === OK) {
            Task.prototype.complete.call(this, creep);
        }
        return;
    }

    if (creep.withdraw(this.object, minerals[0]) === OK) {
        // If we're full or there are no more minerals, complete task.
        if (this.resource || _.sum(creep.carry) === creep.carryCapacity || (this.object.store && _.filter(_.keys(this.object.store), (m) => m !== RESOURCE_ENERGY && this.object.store[m] > 0).length === 0) || (this.object instanceof StructureLab && this.object.mineralAmount === 0)) {
            Task.prototype.complete.call(this, creep);
        }
    }
};

CollectMinerals.prototype.canComplete = function(creep) {
    "use strict";

    // If the creep is about to die or if the object doesn't exist, complete.
    if (creep.ticksToLive < 150 || !this.object) {
        Task.prototype.complete.call(this, creep);
        return true;
    }

    // If we're full or there are no more minerals, complete task.
    if (_.sum(creep.carry) === creep.carryCapacity || (this.object.store && _.filter(_.keys(this.object.store), (m) => m !== RESOURCE_ENERGY && this.object.store[m] > 0).length === 0) || (this.object instanceof StructureLab && this.object.mineralAmount === 0)) {
        Task.prototype.complete.call(this, creep);
        return true;
    }
    return false;
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

    return new CollectMinerals(creep.memory.currentTask.id, creep.memory.currentTask.resource, creep.memory.currentTask.amount);
};

CollectMinerals.getStorerTasks = function(room) {
    "use strict";

    return _.map(_.sortBy(_.filter(Cache.containersInRoom(room), (c) => _.filter(_.keys(c.store), (m) => m !== RESOURCE_ENERGY && c.store[m] > 0).length > 0), (c) => -_.sum(c.store)), (c) => new CollectMinerals(c.id));
};

CollectMinerals.getCleanupTasks = function(structures) {
    "use strict";

    return _.map(_.sortBy(_.filter(structures, (s) => (s.store || s instanceof StructureLab) && ((_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY] < _.sum(s.store)) || s.mineralAmount > 0)), (s) => (s instanceof StructureLab ? s.mineralAmount : _.sum(s.store) - s.store[RESOURCE_ENERGY])), (s) => new CollectMinerals(s.id));
};

CollectMinerals.getLabTasks = function(room) {
    "use strict";

    if (room.storage && room.memory.labQueue && room.memory.labQueue.type === "returning") {
        return _.map(_.filter(Cache.labsInRoom(room), (l) => l.mineralType === room.memory.labQueue.resource), (l) => new CollectMinerals(l.id));
    }

    return [];
};

CollectMinerals.getStorageTasks = function(room) {
    "use strict";

    var tasks = [],
        amount;

    // We only need to transfer from storage to lab when we have both storage and at least 3 labs.
    if (room.storage && room.memory.labQueue && room.memory.labQueue.type === "create" && room.memory.labQueue.status === "moving" && Cache.labsInRoom(room).length >= 3) {
        _.forEach(room.memory.labQueue.children, (resource) => {
            if (amount = _.sum(_.filter(Cache.labsInRoom(room), (l) => l.mineralType === resource), (l) => l.mineralAmount) < room.memory.labQueue.amount) {
                tasks.push(new CollectMinerals(room.storage.id, resource, room.memory.labQueue.amount - amount));
            }
        });
    }

    // We only need to transfer from storage to terminal when we have both storage and terminal.
    if (room.storage && room.terminal && room.memory.reserveMinerals) {
        _.forEach(room.storage.store, (amount, resource) => {
            if (resource === RESOURCE_ENERGY) {
                return;
            }
            if (!room.memory.reserveMinerals[resource]) {
                tasks.push(new CollectMinerals(room.storage.id, resource, amount));
            } else if (room.memory.reserveMinerals[resource] < amount) {
                tasks.push(new CollectMinerals(room.storage.id, resource, amount - room.memory.reserveMinerals[resource]));
            }
        });
    }

    return tasks;
};

CollectMinerals.getTerminalTasks = function(room) {
    "use strict";

    var tasks = [];

    // We only need to transfer from terminal when we have both storage and terminal.
    if (room.storage && room.terminal && room.memory.reserveMinerals) {
        _.forEach(room.terminal.store, (amount, resource) => {
            if (resource === RESOURCE_ENERGY) {
                return;
            }
            if (!room.memory.reserveMinerals[resource]) {
                return;
            }
            if (!room.storage.store[resource]) {
                tasks.push(new CollectMinerals(room.terminal.id, resource, Math.min(amount, room.memory.reserveMinerals[resource])));
            } else if (room.storage.store[resource] < room.memory.reserveMinerals[resource]) {
                tasks.push(new CollectMinerals(room.terminal.id, resource, Math.min(amount, room.memory.reserveMinerals[resource] - room.storage.store[resource])));
            }
        });
    }

    return tasks;
};

require("screeps-profiler").registerObject(CollectMinerals, "TaskCollectMinerals");
module.exports = CollectMinerals;
