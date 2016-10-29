var Task = require("task"),
    Cache = require("cache"),
    Pathing = require("pathing"),
    Heal = function(id) {
        Task.call(this);
        
        this.type = "heal";
        this.id = id;
        this.ally = Cache.getObjectById(id);
    };
    
Heal.prototype = Object.create(Task.prototype);
Heal.prototype.constructor = Heal;

Heal.prototype.canAssign = function(creep, tasks) {
    "use strict";

    if (creep.spawning || creep.getActiveBodyparts(HEAL) === 0) {
        return false;
    }

    Task.prototype.assign.call(this, creep, tasks);
    return true;
}

Heal.prototype.run = function(creep) {
    "use strict";

    // If ally is gone or at full health, we're done.
    if (!this.ally || this.ally.hits === this.ally.hitsMax) {
        Task.prototype.complete.call(this, creep);
        return;
    }
    
    // Move and heal, or ranged heal if not in range.
    Pathing.moveTo(creep, this.ally, 1);
    if (creep.heal(this.ally) === ERR_NOT_IN_RANGE) {
        creep.rangedHeal(this.ally)
    }
};

Heal.prototype.canComplete = function(creep) {
    "use strict";

    if (!this.ally || this.ally.hits === this.ally.hitsMax || creep.getActiveBodyparts(HEAL) === 0) {
        Task.prototype.complete.call(this, creep);
        return true;
    }
    return false;
};

Heal.prototype.toObj = function(creep) {
    "use strict";

    if (this.ally) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.ally.id
        }
    } else {
        delete creep.memory.currentTask;
    }
};

Heal.fromObj = function(creep) {
    "use strict";

    return new Heal(creep.memory.currentTask.id);
};

Heal.getTasks = function(room) {
    "use strict";

    return _.map(_.sortBy(_.filter(Game.creeps, (c) => c.room.name === room.name && c.hits < c.hitsMax), (c) => c.hits), (c) => new Heal(c.id));
};

Heal.getDefenderTask = function(creep) {
    "use strict";

    return _.map(_.sortBy(_.filter(Game.creeps, (c) => c.room.name === creep.room.name && c.hits < c.hitsMax), (c) => c.hits), (c) => new Heal(c.id))[0];
};

require("screeps-profiler").registerObject(Heal, "TaskHeal");
module.exports = Heal;
