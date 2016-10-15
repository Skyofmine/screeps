var Task = require("task"),
    Cache = require("cache"),
    Pickup = function(id) {
        Task.call(this);

        this.type = "pickupResource";
        this.resource = Cache.getObjectById(id);
    };
    
Pickup.prototype = Object.create(Task.prototype);
Pickup.prototype.constructor = Pickup;

Pickup.prototype.canAssign = function(creep) {
    "use strict";

    // Get creep range to the resource.


    if (!this.resource || _.sum(creep.carry) === creep.carryCapacity) {
        return false;
    }
    
    Task.prototype.assign.call(this, creep);
    return true;
}

Pickup.prototype.run = function(creep) {
    "use strict";

    // Resource is gone.
    if (!this.resource) {
        Task.prototype.complete.call(this, creep);
        return;
    }
    
    // Pickup, or move closer to it if not in range.
    switch (creep.pickup(this.resource)) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(this.resource, {reusePath: Math.floor(Math.random() * 2) + 1});
            break;
        case OK:
            // Task always is completed one way or another upon successful transfer.
            Task.prototype.complete.call(this, creep);
            break;
    }
};

Pickup.prototype.canComplete = function(creep) {
    "use strict";

    if (!this.resource) {
        Task.prototype.complete.call(this, creep);
        return true;
    }
    return false;
};

Pickup.fromObj = function(creep) {
    "use strict";

    return new Pickup(creep.memory.currentTask.id);
};

Pickup.prototype.toObj = function(creep) {
    "use strict";

    if (this.resource) {
        creep.memory.currentTask = {
            type: this.type,
            id: this.resource.id
        }
    } else {
        delete creep.memory.currentTask;
    }
};

require("screeps-profiler").registerObject(Pickup, "TaskPickupResource");
module.exports = Pickup;
