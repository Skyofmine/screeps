var Task = require("task"),
    Cache = require("cache"),
    Pathing = require("pathing"),
    Repair = function(id) {
        Task.call(this);

        this.type = "repair";
        this.id = id;
        this.structure = Cache.getObjectById(id);
    };
    
Repair.prototype = Object.create(Task.prototype);
Repair.prototype.constructor = Repair;

Repair.prototype.canAssign = function(creep) {
    "use strict";

    if (creep.spawning || !creep.carry[RESOURCE_ENERGY] || creep.carry[RESOURCE_ENERGY] === 0 || creep.getActiveBodyparts(WORK) === 0) {
        return false;
    }
    
    Task.prototype.assign.call(this, creep);
    return true;
}

Repair.prototype.run = function(creep) {
    "use strict";

    // Check for destroyed structure.
    if (!this.structure) {
        Task.prototype.complete.call(this, creep);
        return;
    }
    
    // Move to the structure and repair it.
    Pathing.moveTo(creep, this.structure, 3);
    creep.repair(this.structure);
};

Repair.prototype.canComplete = function(creep) {
    "use strict";

    if (!creep.carry[RESOURCE_ENERGY] || !this.structure || this.structure.hits === this.structure.hitsMax) {
        Task.prototype.complete.call(this, creep);
        return true;
    }
    return false;
};

Repair.prototype.toObj = function(creep) {
    "use strict";

    if (this.structure) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.structure.id
        }
    } else {
        delete creep.memory.currentTask;
    }
};

Repair.fromObj = function(creep) {
    "use strict";

    return new Repair(creep.memory.currentTask.id);
};

Repair.getCriticalTasks = function(room) {
    "use strict";

    return _.sortBy(_.map(_.filter(Cache.repairableStructuresInRoom(room), (s) => s.hits < 100000 && s.hits / s.hitsMax < 0.5), (s) => new Repair(s.id)), (s) => s.structure.hits);
};

Repair.getTasks = function(room) {
    "use strict";

    return _.sortBy(_.map(_.filter(Cache.repairableStructuresInRoom(room), (s) => (room.controller.level === 8 || s.hits < 1000000) && s.hits / s.hitsMax < 0.9), (s) => new Repair(s.id)), (s) => s.structure.hits);
};

require("screeps-profiler").registerObject(Repair, "TaskRepair");
module.exports = Repair;
