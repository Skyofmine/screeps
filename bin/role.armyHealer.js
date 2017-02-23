var Cache=require("cache"),Utilities=require("utilities"),TaskHeal=require("task.heal"),TaskRally=require("task.rally"),Healer={checkSpawn:function(e,l){var k=_.filter(Cache.creepsInArmy("armyHealer",e),function(c){return c.spawning||300<c.ticksToLive}).length,b=Memory.army[e].healer.maxCreeps;k<b&&Healer.spawn(e,l);Memory.log&&0<b&&Cache.log.army[e].creeps.push({role:"armyHealer",count:k,max:b})},spawn:function(e,l){var k=Memory.army[e],b=k.healer.units,c=[],g,h,f,d;k.boostRoom&&(g=Game.rooms[k.boostRoom],
h=g.memory.labsInUse);if(0===_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]}).length)return!1;for(f=0;5>f;f++)c.push(TOUGH);for(f=0;f<b-1;f++)c.push(HEAL);for(f=0;f<b+5;f++)c.push(MOVE);c.push(HEAL);if(g&&!(d=Utilities.getLabToBoostWith(g,2)))return!1;f=_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]&&a.room.energyAvailable>=Utilities.getBodypartCost(c)&&a.room.memory.region===k.region})[0];if(!f)return!1;e=f.createCreep(c,"armyHealer-"+e+"-"+Game.time.toFixed(0).substring(4),
{role:"armyHealer",army:e,labs:g?_.map(d,function(a){return a.id}):[],portals:l});Cache.spawning[f.id]="number"!==typeof e;"number"!==typeof e&&g&&(d[0].creepToBoost=e,d[0].resource=RESOURCE_CATALYZED_GHODIUM_ALKALIDE,d[0].amount=150,h.push(d[0]),d[1].creepToBoost=e,d[1].resource=RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,d[1].amount=30*b,h.push(d[1]),Cache.creeps[g.name]&&_.forEach(_.filter(Cache.creeps[g.name].all,function(a){return a.memory.currentTask&&"fillMinerals"===a.memory.currentTask.type&&-1!==
_.map(d,function(a){return a.id}).indexOf(a.memory.currentTask.id)}),function(a){delete a.memory.currentTask}));return"number"!==typeof e},assignTasks:function(e,l,k){var b=_.filter(Utilities.creepsWithNoTask(Cache.creepsInArmy("armyHealer",e)),function(a){return!a.spawning}),c=[],g=Memory.army[e];e=g.stageRoom;var h=g.attackRoom,f=g.dismantle,d;if(0!==b.length)switch(l){case "building":_.forEach(_.filter(b,function(a){return a.memory.labs&&0<a.memory.labs.length}),function(a){(new TaskRally(a.memory.labs[0])).canAssign(a);
c.push(a.name)});_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[];if(0===b.length)break;d=new TaskRally(g.buildRoom);_.forEach(b,function(a){a.say("Building");a.memory.portaling&&a.memory.portals[0]!==a.room.name&&a.memory.portals.shift();a.memory.portals&&0<a.memory.portals.length?a.memory.portals[0]===a.room.name?(a.memory.portaling=!0,d=new TaskRally(Cache.portalsInRoom(a.room)[0].id)):d=new TaskRally(a.memory.portals[0]):d=new TaskRally(g.buildRoom);d.canAssign(a)});break;case "staging":d=
new TaskRally(e);_.forEach(b,function(a){a.say("Staging");d.canAssign(a)});break;case "dismantle":if(e!==h&&(d=new TaskRally(e),_.forEach(_.filter(b,function(a){return(a.room.name===h||1>=a.pos.x||48<=a.pos.x||1>=a.pos.y||48<=a.pos.y)&&1E3<=a.hitsMax-a.hits}),function(a){a.say("Ouch!");d.canAssign(a);c.push(a.name)}),_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;_.forEach(k.heal.tasks,function(a){_.forEach(b,function(b){a.canAssign(b)&&(b.say("Heal"),c.push(b.name))});
_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[]});if(Game.rooms[h]&&0<f.length&&(d=new TaskRally(f[0]),d.range=3,_.forEach(b,function(a){d.canAssign(a);c.push(a.name)}),_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;d=new TaskRally(h);_.forEach(b,function(a){d.canAssign(a)});break;case "attack":if(e!==h&&(d=new TaskRally(e),_.forEach(_.filter(b,function(a){return(a.room.name===h||1>=a.pos.x||48<=a.pos.x||1>=a.pos.y||48<=a.pos.y)&&1E3<=a.hitsMax-a.hits}),
function(a){a.say("Ouch!");d.canAssign(a);c.push(a.name)}),_.remove(b,function(a){return-1!==c.indexOf(a.name)}),c=[],0===b.length))break;_.forEach(k.heal.tasks,function(a){_.forEach(b,function(b){a.canAssign(b)&&(b.say("Heal"),c.push(b.name))});_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[]});Game.rooms[h]&&!Game.rooms[h].unobservable&&_.forEach(TaskHeal.getTasks(Game.rooms[h]),function(a){_.forEach(b,function(b){a.canAssign(b)&&(b.say("Heal"),c.push(b.name))});_.remove(b,function(a){return-1!==
c.indexOf(a.name)});c=[]});_.forEach(k.rally.tasks,function(a){_.forEach(b,function(b){a.canAssign(b);c.push(b.name);return!1});_.remove(b,function(a){return-1!==c.indexOf(a.name)});c=[]});d=new TaskRally(h);_.forEach(b,function(a){d.canAssign(a)})}}};require("screeps-profiler").registerObject(Healer,"ArmyHealer");module.exports=Healer;