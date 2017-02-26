var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,d){if(d.get||d.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=d.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(a){return $jscomp.SYMBOL_PREFIX+(a||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var b=0;return $jscomp.iteratorPrototype(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.makeIterator=function(a){$jscomp.initSymbolIterator();var b=a[Symbol.iterator];return b?b.call(a):$jscomp.arrayIterator(a)};$jscomp.arrayFromIterator=function(a){for(var b,d=[];!(b=a.next()).done;)d.push(b.value);return d};$jscomp.arrayFromIterable=function(a){return a instanceof Array?a:$jscomp.arrayFromIterator($jscomp.makeIterator(a))};
$jscomp.findInternal=function(a,b,d){a instanceof String&&(a=String(a));for(var c=a.length,e=0;e<c;e++){var g=a[e];if(b.call(d,g,e,a))return{i:e,v:g}}return{i:-1,v:void 0}};$jscomp.polyfill=function(a,b,d,c){if(b){d=$jscomp.global;a=a.split(".");for(c=0;c<a.length-1;c++){var e=a[c];e in d||(d[e]={});d=d[e]}a=a[a.length-1];c=d[a];b=b(c);b!=c&&null!=b&&$jscomp.defineProperty(d,a,{configurable:!0,writable:!0,value:b})}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,d){return $jscomp.findInternal(this,a,d).v}},"es6-impl","es3");$jscomp.checkStringArgs=function(a,b,d){if(null==a)throw new TypeError("The 'this' value for String.prototype."+d+" must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype."+d+" must not be a regular expression");return a+""};
$jscomp.polyfill("String.prototype.startsWith",function(a){return a?a:function(a,d){var c=$jscomp.checkStringArgs(this,a,"startsWith");a+="";var b=c.length,g=a.length;d=Math.max(0,Math.min(d|0,c.length));for(var k=0;k<g&&d<b;)if(c[d++]!=a[k++])return!1;return k>=g}},"es6-impl","es3");
var RoomObj=require("roomObj"),Cache=require("cache"),Market=require("market"),Minerals=require("minerals"),Utilities=require("utilities"),RoleClaimer=require("role.claimer"),RoleCollector=require("role.collector"),RoleDismantler=require("role.dismantler"),RoleMiner=require("role.miner"),RoleScientist=require("role.scientist"),RoleStorer=require("role.storer"),RoleTower=require("role.tower"),RoleUpgrader=require("role.upgrader"),RoleWorker=require("role.worker"),TaskBuild=require("task.build"),TaskCollectEnergy=
require("task.collectEnergy"),TaskCollectMinerals=require("task.collectMinerals"),TaskDismantle=require("task.dismantle"),TaskFillEnergy=require("task.fillEnergy"),TaskFillMinerals=require("task.fillMinerals"),TaskHeal=require("task.heal"),TaskRangedAttack=require("task.rangedAttack"),TaskRepair=require("task.repair"),TaskUpgradeController=require("task.upgradeController"),Base=function(){this.init()};Base.prototype=Object.create(RoomObj.prototype);Base.prototype.constructor=Base;
Base.prototype.init=function(){RoomObj.call(this);this.type="base"};
Base.prototype.manage=function(a){var b=a.controller,d=b.level,c=a.find(FIND_MY_CONSTRUCTION_SITES),e=Cache.spawnsInRoom(a)[0],g=e.pos,k=a.storage,f=a.find(FIND_MINERALS),h=a.name,q;b&&0!==d&&(0<(q=[0,5,10,20,30,40,50,60][d-1]-(Cache.extensionsInRoom(a).length+_.filter(c,function(a){return a.structureType===STRUCTURE_EXTENSION}).length))&&Utilities.buildStructures(a,STRUCTURE_EXTENSION,q,e),3<=d&&0===Cache.towersInRoom(a).length&&0===_.filter(c,function(a){return a.structureType===STRUCTURE_TOWER}).length&&
Utilities.buildStructures(a,STRUCTURE_TOWER,1,e),3<=d&&_.forEach(a.find(FIND_SOURCES),function(b){b=PathFinder.search(b.pos,{pos:g,range:1},{swampCost:1}).path[0];var d=b.lookFor(LOOK_STRUCTURES),e=b.x,p=b.y;0===_.filter(d,function(a){return a.structureType===STRUCTURE_CONTAINER}).length&&0===_.filter(c,function(a){return a.pos.x===e&&a.pos.y===p&&a.structureType===STRUCTURE_CONTAINER}).length&&(_.forEach(_.filter(d,function(a){return-1!==[STRUCTURE_ROAD,STRUCTURE_WALL].indexOf(a.structureType)}),
function(a){a.destroy()}),a.createConstructionSite(e,p,STRUCTURE_CONTAINER))}),4<=d&&!k&&0===_.filter(c,function(a){return a.structureType===STRUCTURE_STORAGE}).length&&Utilities.buildStructures(a,STRUCTURE_STORAGE,1,e),6<=d&&k&&!a.terminal&&0===_.filter(c,function(a){return a.structureType===STRUCTURE_TERMINAL}).length&&Utilities.buildStructures(a,STRUCTURE_TERMINAL,1,k),6<=d&&f.length!==Cache.extractorsInRoom(a).length&&_.forEach(f,function(b){b=b.pos;var d=b.x,e=b.y;0===_.filter(b.lookFor(LOOK_STRUCTURES),
function(a){return a.structureType===STRUCTURE_EXTRACTOR}).length&&0===_.filter(c,function(a){return a.pos.x===d&&a.pos.y===e&&a.structureType===STRUCTURE_EXTRACTOR}).length&&a.createConstructionSite(d,e,STRUCTURE_EXTRACTOR)}),6<=d&&_.forEach(f,function(b){b=PathFinder.search(b.pos,{pos:g,range:1},{swampCost:1}).path[0];var d=b.lookFor(LOOK_STRUCTURES),e=b.x,f=b.y;0===_.filter(d,function(a){return a.structureType===STRUCTURE_CONTAINER}).length&&0===_.filter(c,function(a){return a.pos.x===e&&a.pos.y===
f&&a.structureType===STRUCTURE_CONTAINER}).length&&(_.forEach(_.filter(d,function(a){return-1!==[STRUCTURE_ROAD,STRUCTURE_WALL].indexOf(a.structureType)}),function(a){a.destroy()}),a.createConstructionSite(e,f,STRUCTURE_CONTAINER))}),3<=d&&_.forEach(_.filter(a.find(FIND_MY_STRUCTURES),function(a){return a.structureType===STRUCTURE_SPAWN||a.structureType===STRUCTURE_EXTENSION||a.structureType===STRUCTURE_TOWER||a.structureType===STRUCTURE_STORAGE||a.structureType===STRUCTURE_TERMINAL}),function(b){var d=
b.pos.x;b=b.pos.y;_.forEach([new RoomPosition(d-1,b,h),new RoomPosition(d+1,b,h),new RoomPosition(d,b-1,h),new RoomPosition(d,b+1,h)],function(b){var d=b.x,e=b.y;0===_.filter(b.lookFor(LOOK_STRUCTURES),function(a){return a.structureType===STRUCTURE_ROAD}).length&&0===_.filter(c,function(a){return a.pos.x===d&&a.pos.y===e&&a.structureType===STRUCTURE_ROAD}).length&&a.createConstructionSite(d,e,STRUCTURE_ROAD)})}))};
Base.prototype.transferEnergy=function(a){a=Utilities.objectsClosestToObj(Cache.linksInRoom(a),Cache.spawnsInRoom(a)[0]);var b=a[0];_.forEach(a,function(a,c){0!==c&&!b.cooldown&&0<b.energy&&300>=a.energy&&b.transferEnergy(a)})};
Base.prototype.terminal=function(a,b){var d=b.store,c=d[RESOURCE_ENERGY]||0,e=a.storage,g=a.name,k=a.memory,f=k.buyQueue,h=!1,q=[],p={},u=Game.market,r=Math.max.apply(Math,[].concat($jscomp.arrayFromIterable(_.map(_.filter(Game.rooms,function(a){return a.memory&&a.memory.roomType&&"base"===a.memory.roomType.type&&a.storage&&a.terminal}),function(a){return a.storage?a.storage.store[RESOURCE_ENERGY]:0})))),m,n,l;e&&(p=e.store);b&&1E3<=c&&r>=Memory.dealEnergy&&(Memory.minimumSell||(Memory.minimumSell=
{}),Cache.credits<Memory.minimumCredits&&(delete k.buyQueue,f=void 0),f?((m=(Market.getFilteredOrders().sell[f.resource]||[])[0])?m.price>f.price?(delete k.buyQueue,f=void 0):(n=u.calcTransactionCost(Math.min(f.amount,m.amount),g,m.roomName),c>n&&Cache.credits>=f.amount*m.price?(Market.deal(m.id,Math.min(f.amount,m.amount),g),h=!0,f.amount-=Math.min(f.amount,m.amount)):0<c&&(l=Math.min(Math.floor(Math.min(f.amount,m.amount)*c/n),Math.floor(Cache.credits/m.price)),0<l&&(Market.deal(m.id,l,g),h=!0,
f.amount-=l))):(delete k.buyQueue,f=void 0),f&&0>=f.amount&&(delete k.buyQueue,f=void 0)):(Cache.credits>=Memory.minimumCredits&&Memory.buy&&(b=_.filter(Game.rooms,function(a){return a.memory&&a.memory.roomType&&"base"===a.memory.roomType.type&&a.terminal}),_.forEach(b,function(b){var e=b.name;h=!1;if(g!==b.name)return _.forEach(_.filter(_.map(d,function(a,c){return{resource:c,amount:Math.min(Memory.reserveMinerals?a+p[c]-(c.startsWith("X")&&5===c.length?Memory.reserveMinerals[c]-5E3:Memory.reserveMinerals[c]):
0,a),otherRoomAmount:(b.terminal.store[c]||0)+(b.storage&&b.storage.store[c]||0),needed:Memory.reserveMinerals?(c.startsWith("X")&&5===c.length?Memory.reserveMinerals[c]-5E3:Memory.reserveMinerals[c])||0:0}}),function(a){return Memory.reserveMinerals[a.resource]&&a.otherRoomAmount<a.needed&&0<a.amount&&0<a.needed-a.otherRoomAmount&&100<=Math.min(a.amount,a.needed-a.otherRoomAmount)}),function(b){var d=Math.min(b.amount,b.needed-b.otherRoomAmount);n=u.calcTransactionCost(d,g,e);if(c>n){if(a.terminal.send(b.resource,
d,e)===OK)return Cache.log.events.push("Sending "+d+" "+b.resource+" from "+g+" to "+e),h=!0,!1}else if(0<c&&(d=Math.floor(d*c/n),0<d&&a.terminal.send(b.resource,d,e)===OK))return Cache.log.events.push("Sending "+d+" "+b.resource+" from "+g+" to "+e),h=!0,!1}),!h})),h||(b=_.filter(_.map(d,function(a,b){return{resource:b,amount:Math.min(a,a-(Memory.reserveMinerals?(b.startsWith("X")&&5===b.length?Memory.reserveMinerals[b]-5E3:Memory.reserveMinerals[b])||0:0)+(p[b]||0))}}),function(a){return a.resource!==
RESOURCE_ENERGY&&0<a.amount}),0<b.length&&_.forEach(b.sort(function(a,b){return b.amount-a.amount}),function(a){var b=a.resource;5005<=a.amount&&Cache.credits<Memory.minimumCredits&&delete Memory.minimumSell[a.resource];if(m=_.filter(Market.getFilteredOrders().buy[b]||[],function(a){return!Memory.minimumSell[b]||a.price>=Memory.minimumSell[b]})[0]){n=u.calcTransactionCost(Math.min(a.amount,m.amount),g,m.roomName);if(c>n)return Market.deal(m.id,Math.min(a.amount,m.amount),g),h=!0,delete Memory.minimumSell[m.resourceType],
!1;if(0<c&&(l=Math.floor(Math.min(a.amount,m.amount)*c/n),0<l))return Market.deal(m.id,l,g),h=!0,!1}})),!h&&e&&r>Memory.marketEnergy&&(_.forEach(Minerals,function(a,b){var c;!p||p[b]<Memory.reserveMinerals[b]||-1!==[RESOURCE_ENERGY,SUBSCRIPTION_TOKEN].indexOf(b)||(a=(Market.getFilteredOrders().sell[b]||[])[0],c=(Market.getFilteredOrders().buy[b]||[])[0],a&&c&&a.price<c.price&&a.price<Cache.credits&&q.push({resource:b,buy:c,sell:a}))}),_.forEach(q.sort(function(a,b){return a.sell.price-a.buy.price-
(b.sell.price-b.buy.price)}),function(a,b){var d=a.buy,e=a.sell;l=Math.min(d.amount,e.amount);l*e.price>Cache.credits&&(l=Math.floor(Cache.credits/e.price));0===b&&Cache.log.events.push("Biggest flip: "+a.resource+" x"+l+" "+e.price.toFixed(2)+" to "+d.price.toFixed(2));n=u.calcTransactionCost(l,g,e.roomName);if(c>n||0<c&&(l=Math.floor(l*c/n),0<l))return Market.deal(e.id,l,g),Memory.minimumSell[a.resource]=e.price,h=!0,!1}))))};
Base.prototype.tasks=function(a){var b=a.terminal,d=Memory.dismantle,c=a.name,e=0,g=0,k,f=Cache.creeps[c]&&Cache.creeps[c].worker||[],h=0<_.filter(f,function(a){return!a.memory.currentTask&&0<a.carry[RESOURCE_ENERGY]}).length,q=0<_.filter(f,function(a){return!a.memory.currentTask&&a.carry[RESOURCE_ENERGY]!==_.sum(a.carry)}).length,p=0<_.filter(f,function(a){return!a.memory.currentTask&&0===_.sum(a.carry)}).length,u=Cache.creeps[c]&&Cache.creeps[c].collector||[],r=0<_.filter(u,function(a){return!a.memory.currentTask&&
0<a.carry[RESOURCE_ENERGY]}).length,m=0<_.filter(u,function(a){return!a.memory.currentTask&&0===_.sum(a.carry)}).length,n=Cache.creeps[c]&&Cache.creeps[c].storer||[],l=0<_.filter(n,function(a){return!a.memory.currentTask&&0<a.carry[RESOURCE_ENERGY]}).length,A=0<_.filter(n,function(a){return!a.memory.currentTask&&a.carry[RESOURCE_ENERGY]!==_.sum(a.carry)}).length,n=0<_.filter(n,function(a){return!a.memory.currentTask&&0===_.sum(a.carry)}).length,t=Cache.creeps[c]&&Cache.creeps[c].scientist||[],v=0<
_.filter(t,function(a){return!a.memory.currentTask&&0<a.carry[RESOURCE_ENERGY]}).length,w=0<_.filter(t,function(a){return!a.memory.currentTask&&a.carry[RESOURCE_ENERGY]!==_.sum(a.carry)}).length,t=0<_.filter(t,function(a){return!a.memory.currentTask&&0===_.sum(a.carry)}).length,z=Cache.creeps[c]&&Cache.creeps[c].upgrader||[],C=0<_.filter(z,function(a){return!a.memory.currentTask&&0<a.carry[RESOURCE_ENERGY]}).length,z=0<_.filter(z,function(a){return!a.memory.currentTask&&0===_.sum(a.carry)}).length,
y=0<Utilities.creepsWithNoTask(Cache.creeps[c]&&Cache.creeps[c].dismantler||[]).length,f=0===Game.time%10&&0===f.length+u.length,x={build:{tasks:h||r?TaskBuild.getTasks(a):[]},collectEnergy:{tasks:p||n||t||m||z?TaskCollectEnergy.getTasks(a):[],storerTasks:n?TaskCollectEnergy.getStorerTasks(a):[]},collectMinerals:{storerTasks:n||A?TaskCollectMinerals.getStorerTasks(a):[],labTasks:t||w?TaskCollectMinerals.getLabTasks(a):[],storageTasks:t||w?TaskCollectMinerals.getStorageTasks(a):[],terminalTasks:t||
w?TaskCollectMinerals.getTerminalTasks(a):[]},fillEnergy:{extensionTasks:h||l||v||r?TaskFillEnergy.getExtensionTasks(a):[],spawnTasks:h||l||v||r?TaskFillEnergy.getSpawnTasks(a):[],powerSpawnTasks:v?TaskFillEnergy.getPowerSpawnTasks(a):[],towerTasks:h||v||r?TaskFillEnergy.getTowerTasks(a):[],storageTasks:l||v||y?TaskFillEnergy.getStorageTasks(a):[],containerTasks:y?TaskFillEnergy.getContainerTasks(a):[],labTasks:v?TaskFillEnergy.getLabTasks(a):[],linkTasks:l?TaskFillEnergy.getLinkTasks(a):[],nukerTasks:v?
TaskFillEnergy.getNukerTasks(a):[]},fillMinerals:{labTasks:w?TaskFillMinerals.getLabTasks(a):[],storageTasks:q||A||w||y?TaskFillMinerals.getStorageTasks(a):[],terminalTasks:q||A||w||y?TaskFillMinerals.getTerminalTasks(a):[],nukerTasks:w?TaskFillMinerals.getNukerTasks(a):[],powerSpawnTasks:w?TaskFillMinerals.getPowerSpawnTasks(a):[]},heal:{tasks:TaskHeal.getTasks(a)},rangedAttack:{tasks:TaskRangedAttack.getTasks(a)},repair:{tasks:f||h||r?TaskRepair.getTasks(a):[],criticalTasks:f||h||r?TaskRepair.getCriticalTasks(a):
[],towerTasks:Memory.towerTasks[c]||0===Game.time%10?TaskRepair.getTowerTasks(a):[]},upgradeController:{tasks:h||r||C?TaskUpgradeController.getTasks(a):[],criticalTasks:f||h||r?TaskUpgradeController.getCriticalTasks(a):[]},dismantle:{tasks:[]}};Memory.towerTasks[c]=x.repair.towerTasks.length;b&&(e=b.store[RESOURCE_ENERGY]||0,k=b.id);a.storage&&(g=a.storage.store[RESOURCE_ENERGY]||0);(n||t)&&b&&5E3<=e&&(!a.memory.buyQueue||g<Memory.dealEnergy||Cache.credits<Memory.minimumCredits)&&(x.collectEnergy.terminalTask=
new TaskCollectEnergy(k));(h||l||v)&&b&&1E3>e&&(x.fillEnergy.terminalTask=new TaskFillEnergy(k));if(d&&d[c]&&0<d[c].length){var B=[];_.forEach(d[c],function(b){var c=a.lookForAt(LOOK_STRUCTURES,b.x,b.y);0===c.length?B.push(b):y&&(x.dismantle.tasks=x.dismantle.tasks.concat(_.map(c,function(a){return new TaskDismantle(a.id)})))});_.forEach(B,function(a){_.remove(d[c],function(b){return b.x===a.x&&b.y===a.y})})}else _.forEach(Cache.creeps[c]&&Cache.creeps[c].dismantler||[],function(b){b.memory.role=
"remoteWorker";b.memory.container=Cache.containersInRoom(a)[0].id});return x};Base.prototype.spawn=function(a,b){var d=Memory.dismantle,c=a.name,e=a.controller;RoleWorker.checkSpawn(a,b);RoleMiner.checkSpawn(a);RoleStorer.checkSpawn(a);RoleScientist.checkSpawn(a);d&&d[c]&&0<d[c].length&&RoleDismantler.checkSpawn(a);RoleCollector.checkSpawn(a);RoleClaimer.checkSpawn(a);e&&(8>e.level||0===_.filter(Game.rooms,function(a){return a.controller&&a.controller.my&&8>a.controller.level}).length)&&RoleUpgrader.checkSpawn(a)};
Base.prototype.assignTasks=function(a,b){RoleWorker.assignTasks(a,b);RoleMiner.assignTasks(a,b);RoleStorer.assignTasks(a,b);RoleScientist.assignTasks(a,b);RoleDismantler.assignTasks(a,b);RoleCollector.assignTasks(a,b);RoleClaimer.assignTasks(a,b);RoleUpgrader.assignTasks(a,b);RoleTower.assignTasks(a,b)};
Base.prototype.labQueue=function(a,b){var d=a.memory,c=Cache.labsInRoom(a),e=d.labsInUse,g=b.sourceLabs||[],k=b.children||[],f=Game.getObjectById(g[0]),h=Game.getObjectById(g[1]),q=b.resource;switch(b.status){case "clearing":if(!e||2<c.length-e.length&&0===_.filter(c,function(a){return-1===e.indexOf(a.id)&&0<a.mineralAmount}).length)b.status="moving";break;case "moving":if(!b.start||b.start+500<Game.time)delete d.labQueue,b=void 0;else{var p=!0;_.forEach(k,function(a){if(_.sum(_.filter(c,function(b){return b.mineralType===
a}),function(a){return a.mineralAmount})<b.amount)return p=!1});f.mineralType===k[0]&&h.mineralType===k[1]&&_.forEach(_.filter(c,function(a){return-1===g.indexOf(a.id)&&(!e||-1===_.map(_.filter(e,function(a){return a.resource!==q}),function(a){return a.id}).indexOf(a.id))}),function(a){a.runReaction(f,h)===OK&&(b.amount-=5)});p&&(b.status="creating")}break;case "creating":_.forEach(_.filter(c,function(a){return-1===g.indexOf(a.id)&&(!e||-1===_.map(_.filter(e,function(a){return a.resource!==q}),function(a){return a.id}).indexOf(a.id))}),
function(a){a.mineralAmount===LAB_MINERAL_CAPACITY&&(b.status="returning");a.runReaction(f,h)===OK&&(b.amount-=5)});0===_.sum(_.filter(c,function(a){return-1!==g.indexOf(a.id)}),function(a){return a.mineralAmount})&&(b.status="returning");break;case "returning":0===_.sum(_.filter(c,function(a){return a.mineralType===q}),function(a){return a.mineralAmount})&&(delete d.labQueue,b=void 0);break;default:b.status="clearing",b.sourceLabs=Utilities.getSourceLabs(a)}};
Base.prototype.labsInUse=function(a,b){var d=[];_.forEach(b,function(a){var b=Game.getObjectById(a.id);switch(a.status){case "emptying":0===b.mineralAmount&&(a.status="filling");break;case "filling":b.mineralAmount===a.amount&&b.mineralType===a.resource&&(a.status="waiting");break;default:var c=Game.creeps[a.creepToBoost];1>=b.pos.getRangeTo(c)&&b.mineralType===a.resource&&b.mineralAmount>=a.amount&&b.boostCreep(c)===OK&&(_.remove(c.memory.labs,function(b){return b===a.id}),a.status&&0!==a.oldAmount?
a.status="refilling":d.push(a));break;case "refilling":b.mineralAmount===a.oldAmount&&b.mineralType===a.oldResource&&d.push(a)}});_.forEach(d,function(a){_.remove(b,function(b){return b.id===a.id})})};
Base.prototype.run=function(a){var b=a.name,d=Cache.spawnsInRoom(a),c=a.terminal,e=a.storage,g=a.memory,k=g.labQueue,g=g.labsInUse;a.unobservable?Game.notify("Base Room "+b+" is unobservable, something is wrong!"):(0===Game.time%100&&0<d.length&&this.manage(a),0<d.length&&this.transferEnergy(a),c&&this.terminal(a,c),b=this.tasks(a),this.spawn(a,!e||e.store[RESOURCE_ENERGY]>=Memory.workerEnergy||3500>a.controller.ticksToDowngrade||0<a.find(FIND_MY_CONSTRUCTION_SITES).length||b.repair.criticalTasks&&
0<b.repair.criticalTasks.length||b.repair.tasks&&0<_.filter(b.repair.tasks,function(a){return(a.structure.structureType===STRUCTURE_WALL||a.structure.structureType===STRUCTURE_RAMPART)&&1E6>a.structure.hits}).length),this.assignTasks(a,b),e&&3<=Cache.labsInRoom(a).length&&k&&!Utilities.roomLabsArePaused(a)&&this.labQueue(a,k),g&&this.labsInUse(a,g))};Base.prototype.toObj=function(a){Memory.rooms[a.name].roomType={type:this.type}};Base.fromObj=function(a){return new Base};
require("screeps-profiler").registerObject(Base,"RoomBase");module.exports=Base;