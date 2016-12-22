var Functions = require("functions"),

    creepsInRoom = {},
    creepsInArmy = {},
    spawnsInRoom = {},
    extensionsInRoom = {},
    towersInRoom = {},
    labsInRoom = {},
    containersInRoom = {},
    linksInRoom = {},
    repairableStructuresInRoom = {},
    extractorsInRoom = {},
    hostilesInRoom = {},
    costMatricies = {},
    objects = {},

    Cache = {
        creepTasks: {},
        roomTypes: {},
        spawning: {},
        minerals: {},
        log: {},
    
        // Reset the cache.
        reset: () => {
            "use strict";
    
            creepsInRoom = {};
            creepsInArmy = {};
            spawnsInRoom = {};
            extensionsInRoom = {};
            towersInRoom = {};
            labsInRoom = {};
            containersInRoom = {};
            linksInRoom = {};
            repairableStructuresInRoom = {};
            extractorsInRoom = {};
            hostilesInRoom = {};
            costMatricies = {};
            objects = {};
            Cache.creepTasks = {};
            Cache.roomTypes = {};
            Cache.spawning = {};
            Cache.minerals = {};
    
            Cache.log = {
                events: [],
                hostiles: [],
                creeps: [],
                spawns: [],
                structures: [],
                rooms: {},
                army: {}
            };
        },
    
        // Returns all creeps of a certain in the current room.
        creepsInRoom: (type, room) => {
            "use strict";
            
            var roomName = room.name;
    
            if (!creepsInRoom[roomName]) {
                creepsInRoom[roomName] = {};
            }
    
            if (!creepsInRoom[roomName].all) {
                creepsInRoom[roomName].all = _.filter(Game.creeps, (c) => c.memory.home === roomName);
            }

            return creepsInRoom[roomName][type] ? creepsInRoom[roomName][type] : (creepsInRoom[roomName][type] = (type === "all" ? creepsInRoom[roomName].all : _.filter(creepsInRoom[roomName].all, (c) => c.memory.role === type)));
        },
    
        // Returns all creeps of a certain in an army.
        creepsInArmy: (type, army) => {
            "use strict";
    
            if (!creepsInArmy[army]) {
                creepsInArmy[army] = {};
            }
    
            if (!creepsInArmy[army].all) {
                creepsInArmy[army].all = _.filter(Game.creeps, (c) => c.memory.army === army);
            }
    
            return creepsInArmy[army][type] ? creepsInArmy[army][type] : (creepsInArmy[army][type] = (type === "all" ? creepsInArmy[army].all : _.filter(creepsInArmy[army].all, (c) => type === "all" || c.memory.role === type)));
        },
    
        // Returns all spawns in the current room.    
        spawnsInRoom: (room) => {
            "use strict";
    
            return spawnsInRoom[room.name] ? spawnsInRoom[room.name] : (spawnsInRoom[room.name] = room.find(FIND_MY_STRUCTURES, {filter: Functions.filterIsSpawn}));
        },
        
        // Returns all extentions in the current room.
        extensionsInRoom: (room) => {
            "use strict";
    
            return extensionsInRoom[room.name] ? extensionsInRoom[room.name] : (extensionsInRoom[room.name] = room.find(FIND_MY_STRUCTURES, {filter: Functions.filterIsExtension}));
        },
    
        // Returns all towers in the current room.
        towersInRoom: (room) => {
            "use strict";
    
            return towersInRoom[room.name] ? towersInRoom[room.name] : (towersInRoom[room.name] = room.find(FIND_MY_STRUCTURES, {filter: Functions.filterIsTower}));
        },
    
        // Returns all labs in the current room.
        labsInRoom: (room) => {
            "use strict";
    
            return labsInRoom[room.name] ? labsInRoom[room.name] : (labsInRoom[room.name] = room.find(FIND_MY_STRUCTURES, {filter: Functions.filterIsLab}));
        },
    
        // Returns all containers in the current room.
        containersInRoom: (room) => {
            "use strict";
    
            return containersInRoom[room.name] ? containersInRoom[room.name] : (containersInRoom[room.name] = room.find(FIND_STRUCTURES, {filter: Functions.filterIsContainer}));
        },
    
        // Returns all links in the current room.
        linksInRoom: (room) => {
            "use strict";
    
            return linksInRoom[room.name] ? linksInRoom[room.name] : (linksInRoom[room.name] = room.find(FIND_STRUCTURES, {filter: Functions.filterIsLink}));
        },
    
        // Returns all repairable structures in the current room.
        repairableStructuresInRoom: (room) => {
            "use strict";
    
            return repairableStructuresInRoom[room.name] ? repairableStructuresInRoom[room.name] : (repairableStructuresInRoom[room.name] = room.find(FIND_STRUCTURES, {filter: Functions.filterIsRepairable}));
        },
    
        // Returns all extractors in the current room.
        extractorsInRoom: (room) => {
            "use strict";
    
            return extractorsInRoom[room.name] ? extractorsInRoom[room.name] : (extractorsInRoom[room.name] = room.find(FIND_STRUCTURES, {filter: Functions.filterIsExtractor}));
        },
    
        // Return all hostile creeps in the current room.
        hostilesInRoom: (room) => {
            "use strict";
    
            var hostiles = hostilesInRoom[room.name] ? hostilesInRoom[room.name] : (hostilesInRoom[room.name] = room.find(FIND_HOSTILE_CREEPS, {filter: Functions.filterNotAllied}));

            // Check for new hostiles, resetting the harvested count if there are hostiles.
            if (!room.memory.hostiles) {
                room.memory.hostiles = [];
            }
    
            _.forEach(hostiles, (hostile) => {
                if (room.memory.hostiles.indexOf(hostile.id) !== -1) {
                    room.memory.harvested = 0;
                }
            });
    
            room.memory.hostiles = _.map(hostiles, (h) => h.id);
    
            return hostiles;
        },
    
        // Get the cost matrix for a room.
        getCostMatrix: (room) => {
            "use strict";
            
            var roomName = room.name;
    
            if (!costMatricies[roomName]) {
                let matrix = new PathFinder.CostMatrix();
    
                _.forEach(room.find(FIND_STRUCTURES), (structure) => {
                    if (structure instanceof StructureRoad) {
                        matrix.set(structure.pos.x, structure.pos.y, 1);
                    } else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my)) {
                        matrix.set(structure.pos.x, structure.pos.y, 255);
                    }
                });
    
                _.forEach(room.find(FIND_CONSTRUCTION_SITES), (structure) => {
                    matrix.set(structure.pos.x, structure.pos.y, 5);
                });

                costMatricies[roomName] = matrix;
            }
            
            return costMatricies[roomName];
        },
    
        // Get object by ID.
        getObjectById: (id) => {
            "use strict";
    
            return objects[id] ? objects[id] : (objects[id] = Game.getObjectById(id));
        }
    };

require("screeps-profiler").registerObject(Cache, "Cache");
module.exports = Cache;
