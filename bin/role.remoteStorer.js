var $jscomp={scope:{},findInternal:function(a,f,e){a instanceof String&&(a=String(a));for(var c=a.length,d=0;d<c;d++){var b=a[d];if(f.call(e,b,d,a))return{i:d,v:b}}return{i:-1,v:void 0}}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(a,f,e){if(e.get||e.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[f]=e.value)};
$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,f,e,c){if(f){e=$jscomp.global;a=a.split(".");for(c=0;c<a.length-1;c++){var d=a[c];d in e||(e[d]={});e=e[d]}a=a[a.length-1];c=e[a];f=f(c);f!=c&&null!=f&&$jscomp.defineProperty(e,a,{configurable:!0,writable:!0,value:f})}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,e){return $jscomp.findInternal(this,a,e).v}},"es6-impl","es3");
var Cache=require("cache"),Utilities=require("utilities"),TaskCollectEnergy=require("task.collectEnergy"),TaskCollectMinerals=require("task.collectMinerals"),TaskPickupResource=require("task.pickupResource"),TaskRally=require("task.rally"),Storer={checkSpawn:function(a){var f=Game.rooms[Memory.rooms[a.name].roomType.supportRoom],e=Cache.containersInRoom(a),c=a.name,d=Cache.creeps[c]&&Cache.creeps[c].remoteStorer||[],b=0,k=!1;0===Cache.spawnsInRoom(f).length||a.unobservable||0===e.length||(_.forEach(e,
function(g){var c=0,e=g.id,h;Memory.containerSource[e]||(Memory.containerSource[e]=Utilities.objectsClosestToObj([].concat.apply([],[a.find(FIND_SOURCES),a.find(FIND_MINERALS)]),g)[0].id);g=Game.getObjectById(Memory.containerSource[e]);if(g instanceof Mineral){if(0===g.mineralAmount)return}else c=k?0:-1,k=!0;h=Memory.lengthToContainer[e][f.name];c+=Math.max(Math.ceil(h/[18,18,18,18,30,44,54,58,58][f.controller.level]),0);b+=c;_.filter(d,function(b){return(b.spawning||b.ticksToLive>=150+2*h)&&b.memory.container===
e}).length<c&&Storer.spawn(a,f,e)}),Memory.log&&(0<d.length||0<b)&&Cache.log.rooms[c].creeps.push({role:"remoteStorer",count:d.length,max:b}))},spawn:function(a,f,e){var c=a.name,d=f.name,b=[];if(0===_.filter(Game.spawns,function(b){return!b.spawning&&!Cache.spawning[b.id]}).length)return!1;switch(f.controller.level){case 3:b=[MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];break;case 4:b=[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,
CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];break;case 5:b=[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];break;case 6:b=[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];break;case 7:case 8:b=[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}a=_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]&&a.room.energyAvailable>=Utilities.getBodypartCost(b)&&a.room.memory.region===
f.memory.region}).sort(function(b,a){return(b.room.name===d?0:1)-(a.room.name===d?0:1)})[0];if(!a)return!1;e=a.createCreep(b,"remoteStorer-"+c+"-"+Game.time.toFixed(0).substring(4),{role:"remoteStorer",home:c,supportRoom:d,container:e});a.room.name===d&&(Cache.spawning[a.id]="number"!==typeof e);return"number"!==typeof e},assignTasks:function(a,f){var e=a.name,c=_.filter(Utilities.creepsWithNoTask(Cache.creeps[e]&&Cache.creeps[e].remoteStorer||[]),function(b){return 0<_.sum(b.carry)||!b.spawning&&
150<b.ticksToLive}),d=[];0!==c.length&&(_.forEach(f.fillEnergy.storageTasks,function(b){var a=b.object.storeCapacity-_.sum(b.object.store)-_.reduce(_.filter(b.object.room.find(FIND_MY_CREEPS),function(a){return a.memory.currentTask&&["fillEnergy","fillMinerals"].indexOf(a.memory.currentTask.type)&&a.memory.currentTask.id===b.id}),function(b,a){return b+_.sum(a.carry)},0);0<a&&(_.forEach(Utilities.objectsClosestToObj(c,b.object),function(c){if(b.canAssign(c)&&(c.say("Storage"),d.push(c.name),a-=_.sum(c.carry),
0>=a))return!1}),_.remove(c,function(b){return-1!==d.indexOf(b.name)}),d=[])}),0!==c.length&&(_.forEach(f.fillMinerals.storageTasks,function(b){_.forEach(c,function(a){b.canAssign(a)&&(a.say("Storage"),d.push(a.name))});_.remove(c,function(b){return-1!==d.indexOf(b.name)});d=[]}),0!==c.length&&(_.forEach(f.fillMinerals.terminalTasks,function(b){_.forEach(c,function(a){b.canAssign(a)&&(a.say("Terminal"),d.push(a.name))});_.remove(c,function(a){return-1!==d.indexOf(a.name)});d=[]}),0!==c.length&&(_.forEach(f.fillEnergy.containerTasks,
function(a){var b=a.object.storeCapacity-_.sum(a.object.store)-_.reduce(_.filter(a.object.room.find(FIND_MY_CREEPS),function(b){return b.memory.currentTask&&["fillEnergy","fillMinerals"].indexOf(b.memory.currentTask.type)&&b.memory.currentTask.id===a.id}),function(a,b){return a+_.sum(b.carry)},0);0<b&&(_.forEach(Utilities.objectsClosestToObj(c,a.object),function(c){if(a.canAssign(c)&&(c.say("Container"),d.push(c.name),b-=_.sum(c.carry),0>=b))return!1}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),
d=[])}),0!==c.length&&(a.unobservable||_.forEach(c,function(a){var b=Game.getObjectById(a.memory.container),c;b&&(b.store[RESOURCE_ENERGY]?c=new TaskCollectEnergy(a.memory.container):0<_.sum(b.store)&&(c=new TaskCollectMinerals(a.memory.container)),c&&c.canAssign(a)&&(a.say("Collecting"),d.push(a.name)))}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==c.length&&(_.forEach(c,function(a){_.forEach(TaskPickupResource.getTasks(a.room),function(b){if(!(0<_.filter(b.resource.room.find(FIND_MY_CREEPS),
function(a){return a.memory.currentTask&&"pickupResource"===a.memory.currentTask.type&&a.memory.currentTask.id===b.id}).length)&&b.canAssign(a))return a.say("Pickup"),d.push(a.name),!1})}),_.remove(c,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==c.length&&_.forEach(c,function(a){(0<_.sum(a.carry)?new TaskRally(a.memory.supportRoom):new TaskRally(a.memory.home)).canAssign(a)})))))))}};require("screeps-profiler").registerObject(Storer,"RoleRemoteStorer");module.exports=Storer;