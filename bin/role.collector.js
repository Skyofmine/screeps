var $jscomp={scope:{},findInternal:function(c,f,e){c instanceof String&&(c=String(c));for(var a=c.length,g=0;g<a;g++){var d=c[g];if(f.call(e,d,g,c))return{i:g,v:d}}return{i:-1,v:void 0}}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(c,f,e){if(e.get||e.set)throw new TypeError("ES3 does not support getters and setters.");c!=Array.prototype&&c!=Object.prototype&&(c[f]=e.value)};
$jscomp.getGlobal=function(c){return"undefined"!=typeof window&&window===c?c:"undefined"!=typeof global&&null!=global?global:c};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(c,f,e,a){if(f){e=$jscomp.global;c=c.split(".");for(a=0;a<c.length-1;a++){var g=c[a];g in e||(e[g]={});e=e[g]}c=c[c.length-1];a=e[c];f=f(a);f!=a&&null!=f&&$jscomp.defineProperty(e,c,{configurable:!0,writable:!0,value:f})}};
$jscomp.polyfill("Array.prototype.find",function(c){return c?c:function(c,e){return $jscomp.findInternal(this,c,e).v}},"es6-impl","es3");
var Cache=require("cache"),Utilities=require("utilities"),TaskHarvest=require("task.harvest"),TaskPickupResource=require("task.pickupResource"),TaskRally=require("task.rally"),Collector={checkSpawn:function(c){var f=Cache.spawnsInRoom(c),e=0,a=c.name,g=Cache.creeps[a]&&Cache.creeps[a].collector||[],d,b;0!==Cache.containersInRoom(c).length&&c.storage||0===f.length||(f=Utilities.objectsClosestToObj(c.find(FIND_SOURCES),f[0]),1>=f.length||(b=Math.max((2500-c.energyCapacityAvailable)/2500,.1),_.forEach(f,
function(k,h){var a=k.id;0!==h&&(e+=Math.ceil(3*b),d=_.filter(g,function(b){return b.memory.homeSource===a}).length,d<3*b&&Collector.spawn(c,a))}),Memory.log&&(0<g.length||0<e)&&Cache.log.rooms[a].creeps.push({role:"collector",count:g.length,max:e})))},spawn:function(c,f){var e=[],a=c.name,g,d,b;if(0===_.filter(Game.spawns,function(b){return!b.spawning&&!Cache.spawning[b.id]}).length)return!1;g=Math.min(c.energyCapacityAvailable,3300);d=Math.floor(g/200);g%=200;for(b=0;b<d;b++)e.push(WORK);150<=g&&
e.push(WORK);for(b=0;b<d;b++)e.push(CARRY);100<=g&&150>g&&e.push(CARRY);for(b=0;b<d;b++)e.push(MOVE);50<=g&&e.push(MOVE);d=_.filter(Game.spawns,function(b){return!b.spawning&&!Cache.spawning[b.id]&&b.room.energyAvailable>=Utilities.getBodypartCost(e)&&b.room.memory.region===c.memory.region}).sort(function(b,h){return(b.room.name===a?0:1)-(h.room.name===a?0:1)})[0];if(!d)return!1;f=d.createCreep(e,"collector-"+a+"-"+Game.time.toFixed(0).substring(4),{role:"collector",home:a,homeSource:f});d.room.name===
a&&(Cache.spawning[d.id]="number"!==typeof f);return"number"!==typeof f},assignTasks:function(c,f){var e=c.name,a=_.filter(Utilities.creepsWithNoTask(Cache.creeps[e]&&Cache.creeps[e].collector||[]),function(b){return 0<_.sum(b.carry)||!b.spawning&&150<b.ticksToLive}),g=Cache.creeps[e]&&Cache.creeps[e].all||[],d=[];0!==a.length&&(_.forEach(f.upgradeController.criticalTasks,function(b){0===_.filter(g,function(a){return a.memory.currentTask&&"upgradeController"===a.memory.currentTask.type&&a.memory.currentTask.room===
b.room}).length&&(_.forEach(Utilities.objectsClosestToObj(a,c.controller),function(a){if(b.canAssign(a))return a.say("CritCntrlr"),d.push(a.name),!1}),_.remove(a,function(b){return-1!==d.indexOf(b.name)}),d=[])}),0!==a.length&&(_.forEach(a,function(b){b.carry[RESOURCE_ENERGY]<(8===c.controller.level?200:7===c.controller.level?100:50)||_.forEach(f.fillEnergy.extensionTasks.sort(function(a,h){return a.object.pos.getRangeTo(b)-h.object.pos.getRangeTo(b)}),function(a){if(0<a.object.energyCapacity-a.object.energy-
_.reduce(_.filter(g,function(b){return b.memory.currentTask&&"fillEnergy"===b.memory.currentTask.type&&b.memory.currentTask.id===a.id}),function(b,a){return b+(a.carry[RESOURCE_ENERGY]||0)},0)&&a.canAssign(b))return b.say("Extension"),d.push(b.name),!1})}),_.remove(a,function(b){return-1!==d.indexOf(b.name)}),d=[],0!==a.length&&(_.forEach(f.fillEnergy.spawnTasks,function(b){var c=b.object.energyCapacity-b.object.energy-_.reduce(_.filter(g,function(a){return a.memory.currentTask&&"fillEnergy"===a.memory.currentTask.type&&
a.memory.currentTask.id===b.id}),function(b,a){return b+(a.carry[RESOURCE_ENERGY]||0)},0);0<c&&(_.forEach(Utilities.objectsClosestToObj(a,b.object),function(a){if(b.canAssign(a)&&(a.say("Spawn"),d.push(a.name),c-=a.carry[RESOURCE_ENERGY]||0,0>=c))return!1}),_.remove(a,function(b){return-1!==d.indexOf(b.name)}),d=[])}),0!==a.length&&(_.forEach(f.fillEnergy.towerTasks,function(b){var c=b.object.energyCapacity-b.object.energy-_.reduce(_.filter(g,function(a){return a.memory.currentTask&&"fillEnergy"===
a.memory.currentTask.type&&a.memory.currentTask.id===b.id}),function(b,a){return b+(a.carry[RESOURCE_ENERGY]||0)},0);0<c&&(_.forEach(Utilities.objectsClosestToObj(a,b.object),function(a){if(b.canAssign(a)&&(a.say("Tower"),d.push(a.name),c-=a.carry[RESOURCE_ENERGY]||0,0>=c))return!1}),_.remove(a,function(b){return-1!==d.indexOf(b.name)}),d=[])}),0!==a.length&&(_.forEach(f.repair.criticalTasks,function(b){_.forEach(Utilities.objectsClosestToObj(a,b.structure),function(a){if(0===_.filter(Cache.creeps[b.structure.room.name]&&
Cache.creeps[b.structure.room.name].all||[],function(a){return a.memory.currentTask&&"repair"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}).length&&b.canAssign(a))return a.say("CritRepair"),d.push(a.name),!1});_.remove(a,function(b){return-1!==d.indexOf(b.name)});d=[]}),0!==a.length&&(_.forEach(f.build.tasks,function(b){var c=b.constructionSite.progressTotal-b.constructionSite.progress-_.reduce(_.filter(Cache.creeps[b.constructionSite.room.name]&&Cache.creeps[b.constructionSite.room.name].all||
[],function(a){return a.memory.currentTask&&"build"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}),function(b,a){return b+(a.carry[RESOURCE_ENERGY]||0)},0);0<c&&(_.forEach(Utilities.objectsClosestToObj(a,b.constructionSite),function(a){if(b.canAssign(a)&&(a.say("Build"),d.push(a.name),c-=a.carry[RESOURCE_ENERGY]||0,0>=c))return!1}),_.remove(a,function(a){return-1!==d.indexOf(a.name)}),d=[])}),0!==a.length&&(_.forEach(f.repair.tasks,function(b){var c=b.structure.hitsMax-b.structure.hits-
100*_.reduce(_.filter(Cache.creeps[b.structure.room.name]&&Cache.creeps[b.structure.room.name].all||[],function(a){return a.memory.currentTask&&"repair"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}),function(a,b){return a+(b.carry[RESOURCE_ENERGY]||0)},0),e=!1;0<c&&(_.forEach(Utilities.objectsClosestToObj(a,b.structure),function(a){if(b.canAssign(a)&&(a.say("Repair"),d.push(a.name),c-=100*(a.carry[RESOURCE_ENERGY]||0),e=!0,0>=c))return!1}),_.remove(a,function(a){return-1!==d.indexOf(a.name)}),
d=[]);return e}),0!==a.length&&(_.forEach(f.upgradeController.tasks,function(b){_.forEach(Utilities.objectsClosestToObj(a,c.controller),function(a){b.canAssign(a)&&(a.say("Controller"),d.push(a.name))});_.remove(a,function(a){return-1!==d.indexOf(a.name)});d=[]}),0!==a.length&&(0===Cache.hostilesInRoom(c).length&&_.forEach(a,function(a){_.forEach(TaskPickupResource.getTasks(a.room),function(b){if(!(0<_.filter(Cache.creeps[b.resource.room.name]&&Cache.creeps[b.resource.room.name].all||[],function(a){return a.memory.currentTask&&
"pickupResource"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}).length)&&b.canAssign(a))return a.say("Pickup"),d.push(a.name),!1})}),_.remove(a,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==a.length&&(_.forEach(f.collectEnergy.tasks,function(b){_.forEach(a,function(a){b.canAssign(a)&&(a.say("Collecting"),d.push(a.name))});_.remove(a,function(a){return-1!==d.indexOf(a.name)});d=[]}),0!==a.length&&(_.forEach(a,function(a){(new TaskHarvest).canAssign(a)&&(a.say("Harvesting"),d.push(a.name))}),
_.remove(a,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==a.length&&_.forEach(TaskRally.getHarvesterTasks(a),function(a){a.canAssign(a.creep)}))))))))))))}};require("screeps-profiler").registerObject(Collector,"RoleCollector");module.exports=Collector;