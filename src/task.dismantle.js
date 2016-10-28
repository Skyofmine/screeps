var Task = require("task"),
    Cache = require("cache"),
    Pathing = require("pathing"),
    Dismantle = function(id) {
        Task.call(this);

        this.type = "dismantle";
        this.id = id;
        this.structure = Cache.getObjectById(id);
    };
    
Dismantle.prototype = Object.create(Task.prototype);
Dismantle.prototype.constructor = Dismantle;

Dismantle.prototype.canAssign = function(creep) {
    "use strict";

    if (creep.spawning || _.sum(creep.carry) === creep.carry.capacity || creep.getActiveBodyparts(WORK) === 0) {
        return false;
    }
    
    Task.prototype.assign.call(this, creep);
    return true;
}

Dismantle.prototype.run = function(creep) {
    "use strict";

    // Check for destroyed structure.
    if (!this.structure) {
        Task.prototype.complete.call(this, creep);
        return;
    }
    
    // Move to the structure and dismantle it.
    Pathing.moveTo(creep, this.structure, 1);
    creep.dismantle(this.structure);
};

Dismantle.prototype.canComplete = function(creep) {
    "use strict";

    if (_.sum(creep.carry) === creep.carry.capacity || !this.structure) {
        Task.prototype.complete.call(this, creep);
        return true;
    }
    return false;
};

Dismantle.prototype.toObj = function(creep) {
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

Dismantle.fromObj = function(creep) {
    "use strict";

    return new Dismantle(creep.memory.currentTask.id);
};

require("screeps-profiler").registerObject(Dismantle, "TaskDismantle");
module.exports = Dismantle;
