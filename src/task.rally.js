var Cache = require("cache"),
    Pathing = require("pathing"),
    Rally = function(id, creep) {
        "use strict";
        
        this.init(id, creep);
    };
    
Rally.prototype.init = function(id, creep) {
    "use strict";
    
    this.type = "rally";
    this.id = id;
    this.creep = creep;
    if (id instanceof RoomPosition) {
        this.rallyPoint = new RoomPosition(id.x, id.y, id.roomName);
    } else {
        this.rallyPoint = Game.getObjectById(id);
        if (!this.rallyPoint) {
            this.rallyPoint = new RoomPosition(25, 25, id);
            this.range = 5;
        }
    }
    this.unimportant = true;
};

Rally.prototype.canAssign = function(creep) {
    "use strict";

    if (creep.spawning) {
        return false;
    }

    Cache.creepTasks[creep.name] = this;
    this.toObj(creep);
    return true;
};

Rally.prototype.run = function(creep) {
    "use strict";
    
    var range;

    // If the rally point doesn't exist, complete the task.
    if (!this.rallyPoint) {
        delete creep.memory.currentTask;
        return;
    }

    // Rally to the rally point.
    range = creep.room.name === this.rallyPoint.roomName || !(this.rallyPoint instanceof RoomPosition) || this.rallyPoint.pos && creep.room.name === this.rallyPoint.pos.roomName ? this.range || 0 : 20;
    if (creep.pos.getRangeTo(this.rallyPoint) <= range) {
        if (creep.pos.x === 0) {
            creep.move(RIGHT);
        } else if (creep.pos.x === 49) {
            creep.move(LEFT);
        } else if (creep.pos.y === 0) {
            creep.move(BOTTOM);
        } else if (creep.pos.y === 49) {
            creep.move(TOP);
        } else if (_.filter(creep.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER).length > 0) {
            creep.move(Math.floor(Math.random() * 8));
        }
    } else {
        Pathing.moveTo(creep, this.rallyPoint, range);
    }

    // If the creep has a heal part, heal itself.
    if (creep.hits < creep.hitsMax && creep.getActiveBodyparts(HEAL) > 0) {
        creep.heal(creep);
    }

    // If the creep has a ranged attack part. mass attack.
    if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
        creep.rangedMassAttack();
    }
};

Rally.prototype.toObj = function(creep) {
    "use strict";

    if (this.rallyPoint) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.id,
            unimportant: this.unimportant,
            range: this.range
        };
    } else {
        delete creep.memory.currentTask;
    }
};

Rally.fromObj = function(creep) {
    "use strict";

    var task;

    if (creep.memory.currentTask.id.roomName) {
        task = new Rally(new RoomPosition(creep.memory.currentTask.id.x, creep.memory.currentTask.id.y, creep.memory.currentTask.id.roomName));
    } else {
        task = new Rally(creep.memory.currentTask.id);
    }

    if (creep.memory.currentTask.range) {
        task.range = creep.memory.currentTask.range;
    }

    return task;
};

Rally.getHarvesterTasks = function(creeps) {
    "use strict";

    return _.map(_.filter(creeps, (c) => !c.spawning && c.ticksToLive >= 150), (c) => new Rally(c.memory.homeSource, c));
};

Rally.getDefenderTask = function(creep) {
    "use strict";

    var source = Cache.sourceKeepersInRoom(creep.room).sort((a, b) => a.ticksToSpawn - b.ticksToSpawn)[0];

    if (source && creep.room.name === creep.memory.home) {
        return new Rally(source.id, creep);
    } else {
        return new Rally(creep.memory.home, creep);
    }
};

Rally.getClaimerTask = function(creep) {
    "use strict";

    return new Rally(creep.memory.claim, creep);
};

if (Memory.profiling) {
    require("screeps-profiler").registerObject(Rally, "TaskRally");
}
module.exports = Rally;
