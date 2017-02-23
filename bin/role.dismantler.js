var $jscomp={scope:{},findInternal:function(b,f,e){b instanceof String&&(b=String(b));for(var c=b.length,d=0;d<c;d++){var a=b[d];if(f.call(e,a,d,b))return{i:d,v:a}}return{i:-1,v:void 0}}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(b,f,e){if(e.get||e.set)throw new TypeError("ES3 does not support getters and setters.");b!=Array.prototype&&b!=Object.prototype&&(b[f]=e.value)};
$jscomp.getGlobal=function(b){return"undefined"!=typeof window&&window===b?b:"undefined"!=typeof global&&null!=global?global:b};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(b,f,e,c){if(f){e=$jscomp.global;b=b.split(".");for(c=0;c<b.length-1;c++){var d=b[c];d in e||(e[d]={});e=e[d]}b=b[b.length-1];c=e[b];f=f(c);f!=c&&null!=f&&$jscomp.defineProperty(e,b,{configurable:!0,writable:!0,value:f})}};
$jscomp.polyfill("Array.prototype.find",function(b){return b?b:function(b,e){return $jscomp.findInternal(this,b,e).v}},"es6-impl","es3");
var Cache=require("cache"),Utilities=require("utilities"),TaskBuild=require("task.build"),TaskPickupResource=require("task.pickupResource"),TaskRally=require("task.rally"),TaskRepair=require("task.repair"),Dismantler={checkSpawn:function(b,f){var e=b.name,c=Cache.creeps[e]&&Cache.creeps[e].dismantler||[];f||(f=b);0===Cache.spawnsInRoom(f).length||b.unobservable||(0===_.filter(c,function(b){return b.spawning||150<=b.ticksToLive}).length&&Dismantler.spawn(b,f),Memory.log&&Cache.log.rooms[e].creeps.push({role:"dismantler",
count:c.length,max:1}))},spawn:function(b,f){var e=[];b=b.name;var c=f.name,d,a,g;if(0===_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]}).length)return!1;d=Math.min(f.energyCapacityAvailable,3300);a=Math.floor(d/200);d%=200;for(g=0;g<a;g++)e.push(WORK);150<=d&&e.push(WORK);for(g=0;g<a;g++)e.push(CARRY);100<=d&&150>d&&e.push(CARRY);for(g=0;g<a;g++)e.push(MOVE);50<=d&&e.push(MOVE);a=_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]&&a.room.energyAvailable>=
Utilities.getBodypartCost(e)&&a.room.memory.region===f.memory.region}).sort(function(a,b){return(a.room.name===c?0:1)-(b.room.name===c?0:1)})[0];if(!a)return!1;b=a.createCreep(e,"dismantler-"+b+"-"+Game.time.toFixed(0).substring(4),{role:"dismantler",home:b,supportRoom:c});a.room.name===c&&(Cache.spawning[a.id]="number"!==typeof b);return"number"!==typeof b},assignTasks:function(b,f){var e=b.name,c=_.filter(Utilities.creepsWithNoTask(Cache.creeps[e]&&Cache.creeps[e].dismantler||[]),function(a){return 0<
_.sum(a.carry)||!a.spawning&&150<a.ticksToLive}),d=[];0!==c.length&&(_.forEach(_.filter(c,function(a){return a.room.name!==e}),function(a){_.forEach(TaskRepair.getCriticalTasks(a.room),function(b){if(0===_.filter(Cache.creeps[b.structure.room.name]&&Cache.creeps[b.structure.room.name].all||[],function(a){return a.memory.currentTask&&"repair"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}).length&&b.canAssign(a))return a.say("CritRepair"),d.push(a.name),!1})}),_.remove(c,function(a){return-1!==
d.indexOf(a.name)}),d=[],0!==c.length&&(_.forEach(c,function(a){var b=a.room.find(FIND_MY_CONSTRUCTION_SITES);0<b.length&&(new TaskBuild(b[0].id)).canAssign(a)&&(a.say("Build"),d.push(a.name))}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==c.length&&(_.forEach([].concat.apply([],[f.fillEnergy.storageTasks,f.fillEnergy.containerTasks]),function(a){var b=a.object.storeCapacity-_.sum(a.object.store)-_.reduce(_.filter(a.object.room.find(FIND_MY_CREEPS),function(b){return b.memory.currentTask&&
-1!==["fillEnergy","fillMinerals"].indexOf(b.memory.currentTask.type)&&b.memory.currentTask.id===a.id}),function(a,b){return a+(b.carry[RESOURCE_ENERGY]||0)},0);0<b&&(_.forEach(Utilities.objectsClosestToObj(c,a.object),function(c){if(a.canAssign(c)&&(c.say("Container"),d.push(c.name),b-=c.carry[RESOURCE_ENERGY]||0,0>=b))return!1}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),d=[])}),0!==c.length&&(_.forEach(f.fillMinerals.storageTasks,function(a){_.forEach(c,function(b){a.canAssign(b)&&(b.say("Storage"),
d.push(b.name))});_.remove(c,function(a){return-1!==d.indexOf(a.name)});d=[]}),0!==c.length&&(_.forEach(f.fillMinerals.terminalTasks,function(a){_.forEach(c,function(b){a.canAssign(b)&&(b.say("Terminal"),d.push(b.name))});_.remove(c,function(a){return-1!==d.indexOf(a.name)});d=[]}),0!==c.length&&(_.forEach(_.filter(c,function(a){return a.room.name===e}),function(a){_.forEach(f.dismantle.tasks,function(b){if(!(0<_.filter(b.structure.room.find(FIND_MY_CREEPS),function(a){return a.memory.currentTask&&
"dismantle"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}).length)&&b.canAssign(a))return a.say("Dismantle"),d.push(a.name),!1})}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==c.length&&(_.forEach(c,function(a){_.forEach(TaskPickupResource.getTasks(a.room),function(b){if(!(0<_.filter(b.resource.room.find(FIND_MY_CREEPS),function(a){return a.memory.currentTask&&"pickupResource"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}).length)&&b.canAssign(a))return a.say("Pickup"),
d.push(a.name),!1})}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==c.length&&_.forEach(c,function(a){(new TaskRally(a.memory.home)).canAssign(a)}))))))))}};require("screeps-profiler").registerObject(Dismantler,"RoleDismantler");module.exports=Dismantler;