var Cache=require("cache"),Utilities=require("utilities"),TaskRally=require("task.rally"),Melee={checkSpawn:function(e,n){var k=_.filter(Cache.creepsInArmy("armyMelee",e),function(b){return b.spawning||300<b.ticksToLive}).length,b=Memory.army[e].melee.maxCreeps;k<b&&Melee.spawn(e,n);Memory.log&&0<b&&Cache.log.army[e].creeps.push({role:"armyMelee",count:k,max:b})},spawn:function(e,n){var k=Memory.army[e],b=k.melee.units,c=[],g,l,d,h;k.boostRoom&&(g=Game.rooms[k.boostRoom],l=g.memory.labsInUse);if(0===
_.filter(Game.spawns,function(b){return!b.spawning&&!Cache.spawning[b.id]}).length)return!1;for(d=0;5>d;d++)c.push(TOUGH);for(d=0;d<b;d++)c.push(ATTACK);for(d=0;d<b+5;d++)c.push(MOVE);if(g&&!(h=Utilities.getLabToBoostWith(g,2)))return!1;d=_.filter(Game.spawns,function(b){return!b.spawning&&!Cache.spawning[b.id]&&b.room.energyAvailable>=Utilities.getBodypartCost(c)&&b.room.memory.region===k.region})[0];if(!d)return!1;e=d.createCreep(c,"armyMelee-"+e+"-"+Game.time.toFixed(0).substring(4),{role:"armyMelee",
army:e,labs:g?_.map(h,function(b){return b.id}):[],portals:n});Cache.spawning[d.id]="number"!==typeof e;"number"!==typeof e&&g&&(h[0].creepToBoost=e,h[0].resource=RESOURCE_CATALYZED_GHODIUM_ALKALIDE,h[0].amount=150,l.push(h[0]),h[1].creepToBoost=e,h[1].resource=RESOURCE_CATALYZED_UTRIUM_ACID,h[1].amount=30*b,l.push(h[1]),Cache.creeps[g.name]&&_.forEach(_.filter(Cache.creeps[g.name].all,function(b){return b.memory.currentTask&&"fillMinerals"===b.memory.currentTask.type&&-1!==_.map(h,function(b){return b.id}).indexOf(b.memory.currentTask.id)}),
function(b){delete b.memory.currentTask}));return"number"!==typeof e},assignTasks:function(e,n,k){var b=_.filter(Utilities.creepsWithNoTask(Cache.creepsInArmy("armyMelee",e)),function(a){return!a.spawning}),c=[],g=Memory.army[e],l=g.stageRoom,d=g.attackRoom,h=g.dismantle,f,m;if(0!==b.length)switch(n){case "building":_.forEach(_.filter(b,function(a){return a.memory.labs&&0<a.memory.labs.length}),function(a){(new TaskRally(a.memory.labs[0])).canAssign(a);c.push(a.name)});_.remove(b,function(a){return-1!==
c.indexOf(a.name)});c=[];if(0===b.length)break;f=new TaskRally(g.buildRoom);_.forEach(b,function(a){a.say("Building");a.memory.portaling&&a.memory.portals[0]!==a.room.name&&a.memory.portals.shift();a.memory.portals&&0<a.memory.portals.length?a.memory.portals[0]===a.room.name?(a.memory.portaling=!0,f=new TaskRally(Cache.portalsInRoom(a.room)[0].id)):f=new TaskRally(a.memory.portals[0]):f=new TaskRally(g.buildRoom);f.canAssign(a)});break;case "staging":f=new TaskRally(l);_.forEach(b,function(a){a.say("Staging");
f.canAssign(a)});break;case "dismantle":m=Cache.creepsInArmy("armyHealer",e);if(0<m.length&&l!==d&&(f=new TaskRally(l),_.forEach(_.filter(b,function(a){return(a.room.name===d||1>=a.pos.x||48<=a.pos.x||1>=a.pos.y||48<=a.pos.y)&&1E3<=a.hitsMax-a.hits}),function(a){a.say("Ouch!");f.canAssign(a);c.push(a.name)}),_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;if(0<m.length&&(_.forEach(b,function(a){var b=Utilities.objectsClosestToObj(m,a);2<b[0].pos.getRangeTo(a)&&(b=new TaskRally(b[0].id),
b.canAssign(a),c.push(a.name))}),_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;0<m.length&&_.remove(b,function(a){return 1E3<=a.hitsMax-a.hits});_.forEach(k.melee.tasks,function(a){_.forEach(b,function(b){a.canAssign(b)&&(b.say("Die!",!0),c.push(b.name))});_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[];if(0===b.length)return!1});if(0===b.length)break;if(Game.rooms[d]&&0<h.length&&(f=new TaskRally(h[0]),f.range=3,_.forEach(b,function(a){f.canAssign(a);c.push(a.name)}),
_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;f=new TaskRally(d);_.forEach(b,function(a){f.canAssign(a)});break;case "attack":m=Cache.creepsInArmy("armyHealer",e);if(0<m.length&&l!==d&&(f=new TaskRally(l),_.forEach(_.filter(b,function(a){return(a.room.name===d||1>=a.pos.x||48<=a.pos.x||1>=a.pos.y||48<=a.pos.y)&&1E3<=a.hitsMax-a.hits}),function(a){a.say("Ouch!");f.canAssign(a);c.push(a.name)}),_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;
0<m.length&&_.remove(b,function(a){return 1E3<=a.hitsMax-a.hits});_.forEach(k.melee.tasks,function(a){_.forEach(b,function(b){a.canAssign(b)&&(b.say("Die!",!0),c.push(b.name))});_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[];if(0===b.length)return!1});0!==b.length&&(_.forEach(k.rally.tasks,function(a){_.forEach(b,function(b){a.canAssign(b);c.push(b.name);return!1});_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[]}),f=new TaskRally(d),_.forEach(b,function(a){f.canAssign(a)}))}}};
require("screeps-profiler").registerObject(Melee,"ArmyMelee");module.exports=Melee;