var Task = require("task"),
    Cache = require("cache"),
    CollectMinerals = function(id) {
        Task.call(this);

        this.type = "collectMinerals";
        this.id = id;
        this.object = Cache.getObjectById(id);
    };
    
CollectMinerals.prototype = Object.create(Task.prototype);
CollectMinerals.prototype.constructor = CollectMinerals;

CollectMinerals.prototype.canAssign = function(creep) {
    "use strict";

    if (creep.ticksToLive < 150 || _.sum(creep.carry) === creep.carryCapacity) {
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
    minerals = _.filter(_.keys(this.object.store), (m) => m !== RESOURCE_ENERGY && this.object.store[m] > 0);

    // We're out of minerals, complete task.
    if (minerals.length === 0) {
        Task.prototype.complete.call(this, creep);
        return;
    }

    // Collect from the object, or move closer to it if not in range.
    if (creep.withdraw(this.object, minerals[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(this.object, {reusePath: Math.floor(Math.random() * 2) + 1});
        return;
    }

    // If we're full or there are no more minerals, complete task.
    if (_.sum(creep.carry) === creep.carryCapacity || _.filter(_.keys(this.object.store), (m) => m !== RESOURCE_ENERGY && this.object.store[m] > 0).length === 0) {
        Task.prototype.complete.call(this, creep);
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
    if (_.sum(creep.carry) === creep.carryCapacity || _.filter(_.keys(this.object.store), (m) => m !== RESOURCE_ENERGY && this.object.store[m] > 0).length === 0) {
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
            id: this.id
        }
    } else {
        delete creep.memory.currentTask;
    }
};

CollectMinerals.fromObj = function(creep) {
    "use strict";

    return new CollectMinerals(creep.memory.currentTask.id);
};

CollectMinerals.getStorerTasks = function(room) {
    "use strict";

    return _.map(_.sortBy(_.filter(Cache.containersInRoom(room), (c) => _.filter(_.keys(c.store), (m) => m !== RESOURCE_ENERGY && c.store[m] > 0).length > 0), (c) => -_.sum(c.store)), (c) => new CollectMinerals(c.id));
};

require("screeps-profiler").registerObject(CollectMinerals, "TaskCollectMinerals");
module.exports = CollectMinerals;