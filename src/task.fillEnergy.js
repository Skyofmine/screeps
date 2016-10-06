var Task = require("task"),
    Cache = require("cache"),
    FillEnergy = function(id) {
        Task.call(this);

        this.type = "fillEnergy";
        this.id = id;
        this.object = Cache.getObjectById(id);
    };
    
FillEnergy.prototype = Object.create(Task.prototype);
FillEnergy.prototype.constructor = FillEnergy;

FillEnergy.prototype.canAssign = function(creep, tasks) {
    if (creep.carry[RESOURCE_ENERGY] === 0) {
        return false;
    }
    
    Task.prototype.assign.call(this, creep, tasks);
    return true;
}

FillEnergy.prototype.run = function(creep) {
    // Object not found, complete task.
    if (!this.object) {
        Task.prototype.complete.call(this, creep);
        return;
    }

    // Fill the object, or move closer to it if not in range.
    if (creep.transfer(this.object, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(this.object, {reusePath: Math.floor(Math.random() * 2)});
        return;
    }

    // If we didn't move, complete task.
    Task.prototype.complete.call(this, creep);
};

FillEnergy.prototype.canComplete = function(creep) {
    if (creep.carry[RESOURCE_ENERGY] === 0 || this.object.energy === this.object.energyCapacity) {
        Task.prototype.complete.call(this, creep);
        return true;
    }
    return false;
};

FillEnergy.prototype.toObj = function(creep) {
    if (this.object) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.id
        }
    } else {
        delete creep.memory.currentTask;
    }
};

FillEnergy.fromObj = function(creep) {
    return new FillEnergy(creep.memory.currentTask.id);
};

FillEnergy.getFillExtensionTasks = function(room) {
    return _.map(_.filter(Cache.extensionsInRoom(room), (e) => e.energy < e.energyCapacity), (e) => new FillEnergy(e.id));
};

FillEnergy.getFillSpawnTasks = function(room) {
    return _.map(_.filter(Cache.spawnsInRoom(room), (s) => s.energy < s.energyCapacity), (s) => new FillEnergy(s.id));
};

FillEnergy.getFillTowerTasks = function(room) {
    return _.map(_.filter(Cache.towersInRoom(room), (t) => t.energy < t.energyCapacity), (t) => new FillEnergy(t.id));
};

FillEnergy.getFillCollectorTasks = function(room) {
    return _.map(_.filter(Cache.collectorsInRoom(room), (t) => t.energy < t.energyCapacity), (t) => new FillEnergy(t.id));
};

module.exports = FillEnergy;
