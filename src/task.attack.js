var Cache = require("cache"),
    Pathing = require("pathing"),
    Attack = function(id) {
        "use strict";
        
        this.init(id);
    };
    
Attack.prototype.init = function() {
    "use strict";
    
    this.type = "attack";
};

Attack.prototype.canAssign = function(creep) {
    "use strict";

    var controller = creep.room.controller;

    if (creep.spawning || creep.memory.role !== "converter" || !controller || controller.level === 0 || creep.getActiveBodyparts(CLAIM) === 0) {
        return false;
    }
    
    Cache.creepTasks[creep.name] = this;
    this.toObj(creep);
    return true;
};

Attack.prototype.run = function(creep) {
    "use strict";

    if (!creep.room.controller || creep.room.controller.level === 0 || !creep.getActiveBodyparts(CLAIM) === 0) {
        delete creep.memory.currentTask;
        return;
    }

    // Move towards the controller and attack it.    
    Pathing.moveTo(creep, creep.room.controller, 1);
    creep.attackController(creep.room.controller);
};

Attack.prototype.toObj = function(creep) {
    "use strict";

    if (creep.room.controller) {
        creep.memory.currentTask = {
            type: this.type
        };
    } else {
        delete creep.memory.currentTask;
    }
};

Attack.fromObj = function(creep) {
    "use strict";

    return new Attack();
};

Attack.getTask = function(creep) {
    "use strict";

    if (creep.room.controller) {
        return new Attack();
    }
};

if (Memory.profiling) {
    require("screeps-profiler").registerObject(Attack, "TaskAttack");
}
module.exports = Attack;