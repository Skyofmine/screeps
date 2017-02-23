var $jscomp={scope:{},findInternal:function(a,b,c){a instanceof String&&(a=String(a));for(var e=a.length,d=0;d<e;d++){var f=a[d];if(b.call(c,f,d,a))return{i:d,v:f}}return{i:-1,v:void 0}}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};
$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,b,c,e){if(b){c=$jscomp.global;a=a.split(".");for(e=0;e<a.length-1;e++){var d=a[e];d in c||(c[d]={});c=c[d]}a=a[a.length-1];e=c[a];b=b(e);b!=e&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,c){return $jscomp.findInternal(this,a,c).v}},"es6-impl","es3");
var RoomObj=require("roomObj"),Cache=require("cache"),Commands=require("commands"),Utilities=require("utilities"),RoleDismantler=require("role.dismantler"),RoleRemoteBuilder=require("role.remoteBuilder"),RoleRemoteMiner=require("role.remoteMiner"),RoleRemoteReserver=require("role.remoteReserver"),RoleRemoteStorer=require("role.remoteStorer"),RoleRemoteWorker=require("role.remoteWorker"),TaskBuild=require("task.build"),TaskDismantle=require("task.dismantle"),TaskFillEnergy=require("task.fillEnergy"),
TaskFillMinerals=require("task.fillMinerals"),Mine=function(a,b){this.init(a,b)};Mine.prototype=Object.create(RoomObj.prototype);Mine.prototype.constructor=Mine;Mine.prototype.init=function(a,b){RoomObj.call(this);this.type="mine";this.supportRoom=a;this.stage=b||1};
Mine.prototype.convert=function(a,b){var c=this,e=a.name;b=Memory.rooms[e];var d=b.roomType.type;Commands.setRoomType(e,{type:"base",region:b.region});Commands.claimRoom(this.supportRoom,e,!1);switch(d){case "mine":_.forEach(Cache.creeps[e]&&Cache.creeps[e].all||[],function(b){var d=b.memory;switch(d.role){case "remoteBuilder":case "remoteWorker":d.role="worker";d.home=e;d.homeSource=Utilities.objectsClosestToObj(a.find(FIND_SOURCES),b)[0].id;break;case "remoteReserver":b.suicide();break;case "remoteStorer":d.role=
"storer";d.home=c.supportRoom;break;case "dismantler":d.home=e,d.supportRoom=e}})}};Mine.prototype.stage1Tasks=function(a,b){b={fillEnergy:{storageTasks:TaskFillEnergy.getStorageTasks(b),containerTasks:TaskFillEnergy.getContainerTasks(b)},fillMinerals:{storageTasks:TaskFillMinerals.getStorageTasks(b),terminalTasks:TaskFillMinerals.getTerminalTasks(b)},dismantle:{tasks:[]}};a.unobservable||(b.build={tasks:TaskBuild.getTasks(a)});return b};
Mine.prototype.stage1Spawn=function(a){RoleRemoteReserver.checkSpawn(a);RoleRemoteBuilder.checkSpawn(a)};Mine.prototype.stage1AssignTasks=function(a,b){RoleRemoteReserver.assignTasks(a,b);RoleRemoteBuilder.assignTasks(a);RoleRemoteMiner.assignTasks(a,b);RoleRemoteWorker.assignTasks(a,b);RoleRemoteStorer.assignTasks(a,b);RoleDismantler.assignTasks(a,b)};
Mine.prototype.stage1Manage=function(a,b){var c=b.name,e,d,f,g;a.unobservable||(e=[].concat.apply([],[a.find(FIND_SOURCES),/^[EW][1-9][0-9]*5[NS][1-9][0-9]*5$/.test(a.name)?a.find(FIND_MINERALS):[]]),d=Cache.containersInRoom(a),f=a.name,d.length===e.length?(this.stage=2,_.forEach(d,function(b){var c=Utilities.objectsClosestToObj([].concat.apply([],[e,a.find(FIND_MINERALS)]),b)[0];if(!(c instanceof Mineral))return _.forEach(Cache.creeps[f]&&Cache.creeps[f].remoteBuilder||[],function(a){a.memory.role=
"remoteWorker";a.memory.container=Utilities.objectsClosestToObj(d,c)[0].id}),!1})):(g=a.find(FIND_MY_CONSTRUCTION_SITES),0===g.length&&_.forEach(e,function(c){var d=PathFinder.search(c.pos,{pos:Cache.spawnsInRoom(b)[0].pos,range:1},{swampCost:1}).path[0];0===_.filter(d.lookFor(LOOK_STRUCTURES),function(a){return a instanceof StructureContainer}).length&&0===_.filter(g,function(a){return a.pos.x===d.x&&a.pos.y===d.y&&a instanceof StructureContainer}).length&&a.createConstructionSite(d.x,d.y,STRUCTURE_CONTAINER)}),
0<_.filter(Cache.hostilesInRoom(a),function(a){return a.owner&&"Invader"===a.owner.username}).length?Memory.army[f+"-defense"]||Commands.createArmy(f+"-defense",{reinforce:!1,region:a.memory.region,boostRoom:void 0,buildRoom:c,stageRoom:c,attackRoom:f,dismantle:[],dismantler:{maxCreeps:0,units:20},healer:{maxCreeps:1,units:Math.min(Math.floor((b.energyCapacityAvailable-300)/300),20)},melee:{maxCreeps:1,units:Math.min(Math.floor((b.energyCapacityAvailable-300)/130),20)},ranged:{maxCreeps:0,units:20}}):
Memory.army[f+"-defense"]&&(Memory.army[f+"-defense"].directive="attack",Memory.army[f+"-defense"].success=!0)))};Mine.prototype.stage1=function(a,b){var c=this.stage1Tasks(a,b);this.stage1Spawn(a);this.stage1AssignTasks(a,c);this.stage1Manage(a,b)};
Mine.prototype.stage2Manage=function(a,b){var c=a.name,e=b.name,d;a.unobservable?0===(Cache.creeps[c]&&Cache.creeps[c].remoteMiner||[]).length&&0===(Cache.creeps[c]&&Cache.creeps[c].remoteWorker||[]).length&&0===(Cache.creeps[c]&&Cache.creeps[c].remoteStorer||[]).length&&0===(Cache.creeps[c]&&Cache.creeps[c].remoteReserver||[]).length&&(this.stage=1):(d=[].concat.apply([],[a.find(FIND_SOURCES),/^[EW][1-9][0-9]*5[NS][1-9][0-9]*5$/.test(a.name)?a.find(FIND_MINERALS):[]]),Cache.containersInRoom(a).length!==
d.length?this.stage=1:0<_.filter(Cache.hostilesInRoom(a),function(a){return a.owner&&"Invader"===a.owner.username}).length?Memory.army[c+"-defense"]||Commands.createArmy(c+"-defense",{reinforce:!1,region:a.memory.region,boostRoom:void 0,buildRoom:e,stageRoom:e,attackRoom:c,dismantle:[],dismantler:{maxCreeps:0,units:20},healer:{maxCreeps:1,units:Math.min(Math.floor((b.energyCapacityAvailable-300)/300),20)},melee:{maxCreeps:1,units:Math.min(Math.floor((b.energyCapacityAvailable-300)/130),20)},ranged:{maxCreeps:0,
units:20}}):Memory.army[c+"-defense"]&&(Memory.army[c+"-defense"].directive="attack",Memory.army[c+"-defense"].success=!0))};Mine.prototype.stage2Spawn=function(a,b){var c=Memory.dismantle;0<Cache.hostilesInRoom(a).length||(RoleRemoteReserver.checkSpawn(a),RoleRemoteMiner.checkSpawn(a),RoleRemoteWorker.checkSpawn(a),RoleRemoteStorer.checkSpawn(a),c&&c[a.name]&&0<c[a.name].length&&RoleDismantler.checkSpawn(a,b))};
Mine.prototype.stage2Tasks=function(a,b){var c=a.name,e=0<Utilities.creepsWithNoTask(Cache.creeps[c]&&Cache.creeps[c].remoteWorker||[]).length||0<Utilities.creepsWithNoTask(Cache.creeps[c]&&Cache.creeps[c].remoteStorer||[]).length||0<Utilities.creepsWithNoTask(Cache.creeps[c]&&Cache.creeps[c].remoteDismantler||[]).length;tasks={fillEnergy:{storageTasks:e?TaskFillEnergy.getStorageTasks(b):[],containerTasks:e?TaskFillEnergy.getContainerTasks(b):[]},fillMinerals:{storageTasks:e?TaskFillMinerals.getStorageTasks(b):
[],terminalTasks:e?TaskFillMinerals.getTerminalTasks(b):[]}};if(!a.unobservable){var d=Memory.dismantle;tasks.dismantle={tasks:[]};if(d&&d[c]&&0<d[c].length){var f=[];_.forEach(d[c],function(b){var c=a.lookForAt(LOOK_STRUCTURES,b.x,b.y);0===c.length?f.push(b):tasks.dismantle.tasks=tasks.dismantle.tasks.concat(_.map(c,function(a){return new TaskDismantle(a.id)}))});_.forEach(f,function(a){_.remove(d[c],function(b){return b.x===a.x&&b.y===a.y})})}else _.forEach(Cache.creeps[c]&&Cache.creeps[c].dismantler||
[],function(b){b.memory.role="remoteWorker";b.memory.container=Cache.containersInRoom(a)[0].id})}return tasks};Mine.prototype.stage2AssignTasks=function(a,b){RoleRemoteReserver.assignTasks(a,b);RoleRemoteMiner.assignTasks(a,b);RoleRemoteWorker.assignTasks(a,b);RoleRemoteStorer.assignTasks(a,b);RoleDismantler.assignTasks(a,b)};Mine.prototype.stage2=function(a,b){this.stage2Manage(a,b);1!==this.stage&&(a.unobservable||this.stage2Spawn(a,b),b=this.stage2Tasks(a,b),this.stage2AssignTasks(a,b))};
Mine.prototype.run=function(a){var b;if(a.unobservable||0!==a.find(FIND_SOURCES).length)if(b=Game.rooms[Memory.rooms[a.name].roomType.supportRoom])a.controller&&a.controller.my?this.convert(a,b):(1===this.stage&&this.stage1(a,b),2===this.stage&&this.stage2(a,b))};Mine.prototype.toObj=function(a){Memory.rooms[a.name].roomType={type:this.type,supportRoom:this.supportRoom,stage:this.stage}};Mine.fromObj=function(a){return new Mine(a.roomType.supportRoom,a.roomType.stage)};
require("screeps-profiler").registerObject(Mine,"RoomMine");module.exports=Mine;