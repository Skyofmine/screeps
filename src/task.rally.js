var Task = require("task"),
    Cache = require("cache"),
    Utilities = require("utilities"),
    Rally = function(id, creep) {
        Task.call(this);

        this.type = "rally";
        this.id = id;
        this.creep = creep;
        this.rallyPoint = Cache.getObjectById(id);
        if (!this.rallyPoint) {
            this.rallyPoint = Game.flags[id];
        }
        if (!this.rallyPoint) {
            this.rallyPoint = new RoomPosition(25, 25, id);
        }
    };
    
Rally.prototype = Object.create(Task.prototype);
Rally.prototype.constructor = Rally;

Rally.prototype.canAssign = function(creep) {
    "use strict";

    if (creep.spawning) {
        return false;
    }

    Task.prototype.assign.call(this, creep);
    return true;
}

Rally.prototype.run = function(creep) {
    "use strict";
    
    var pos;

    // If the rally point doesn't exist, complete the task.
    if (!this.rallyPoint) {
        Task.prototype.complete.call(this, creep);
        return;
    }

    // Rally to the rally point.
    if (this.rallyPoint instanceof RoomPosition) {
        creep.moveTo(this.rallyPoint, {reusePath: Math.floor(Math.random() * 2) + 4});
    } else {
        pos = new RoomPosition(this.rallyPoint.pos.x + Math.floor(Math.random() * 7 - 3), this.rallyPoint.pos.y + Math.floor(Math.random() * 7 - 3), this.rallyPoint.pos.roomName);
        pos.x = Math.max(Math.min(pos.x, 48), 1);
        pos.y = Math.max(Math.min(pos.y, 48), 1);
        creep.moveTo(pos, {reusePath: Math.floor(Math.random() * 2) + 4});
    }

    // Always complete the task.
    Task.prototype.complete.call(this, creep);
};

Rally.prototype.canComplete = function(creep) {
    "use strict";

    Task.prototype.complete.call(this, creep);
    return true;
};

Rally.prototype.toObj = function(creep) {
    "use strict";

    if (this.rallyPoint) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.id
        }
    } else {
        delete creep.memory.currentTask;
    }
};

Rally.fromObj = function(creep) {
    "use strict";

    return new Rally(creep.memory.currentTask.id);
};

Rally.getHarvesterTasks = function(creeps) {
    "use strict";

    return _.map(_.filter(creeps, (c) => !c.spawning && c.ticksToLive >= 150), (c) => new Rally(c.memory.homeSource, c));
};

Rally.getDefenderTask = function(creep) {
    "use strict";

    if (creep.memory.role === "healer") {
        // Find a rally target.
        var targets = Cache.creepsInRoom("rangedAttack", creep.room);
        if (targets.length === 0) {
            targets = Cache.creepsInRoom("meleeAttack", creep.room);
        }
        if (targets.length === 0) {
            targets = Cache.creepsInRoom("defender", creep.room);
        }

        // Return the rally point.
        if (targets.length === 0) {
            return new Rally(creep.memory.defending, creep);
        }
    }

    return new Rally(creep.memory.defending, creep);
};

Rally.getReserverTask = function(creep) {
    "use strict";

    return new Rally(creep.memory.reserve, creep);
};

Rally.getClaimerTask = function(creep) {
    "use strict";

    return new Rally(creep.memory.claim, creep);
};

require("screeps-profiler").registerObject(Rally, "TaskRally");
module.exports = Rally;
