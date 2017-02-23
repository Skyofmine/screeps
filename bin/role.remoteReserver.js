var Cache=require("cache"),Commands=require("commands"),Utilities=require("utilities"),TaskRally=require("task.rally"),TaskReserve=require("task.reserve"),Reserver={checkSpawn:function(c){var b=Game.rooms[Memory.rooms[c.name].roomType.supportRoom],d=b.name,a=Cache.spawnsInRoom(b),e=c.controller,f=c.name,k=Cache.creeps[f]&&Cache.creeps[f].remoteReserver||[],m=0,h=0,g,l;if(0!==a.length&&!c.unobservable&&e){g=e.id;l=e.reservation;Memory.lengthToController||(Memory.lengthToController={});Memory.lengthToController[g]||
(Memory.lengthToController[g]={});Memory.lengthToController[g][d]||(Memory.lengthToController[g][d]=PathFinder.search(e.pos,{pos:a[0].pos,range:1},{swampCost:1,maxOps:1E5}).path.length);m=_.filter(k,function(a){return a.spawning||a.ticksToLive>Memory.lengthToController[g][d]}).length;if(!l||4E3>l.ticksToEnd)h+=1;m<h&&Reserver.spawn(c,b);Memory.log&&(0<k.length||0<h)&&Cache.log.rooms[f].creeps.push({role:"remoteReserver",count:k.length,max:h})}},spawn:function(c,b){var d=[];c=c.name;var a=b.name,e,
f;if(0===_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]}).length)return!1;e=Math.floor(Math.min(b.energyCapacityAvailable,3250)/650);for(f=0;f<e;f++)d.push(CLAIM);for(f=0;f<e;f++)d.push(MOVE);e=_.filter(Game.spawns,function(a){return!a.spawning&&!Cache.spawning[a.id]&&a.room.energyAvailable>=Utilities.getBodypartCost(d)&&a.room.memory.region===b.memory.region}).sort(function(b,c){return(b.room.name===a?0:1)-(c.room.name===a?0:1)})[0];if(!e)return!1;c=e.createCreep(d,"remoteReserver-"+
c+"-"+Game.time.toFixed(0).substring(4),{role:"remoteReserver",home:c,supportRoom:a});e.room.name===a&&(Cache.spawning[e.id]="number"!==typeof c);return"number"!==typeof c},assignTasks:function(c,b){b=c.name;b=Utilities.creepsWithNoTask(Cache.creeps[b]&&Cache.creeps[b].remoteReserver||[]);var d=[];0!==b.length&&(c.unobservable||_.forEach(b,function(a){a.room.name===a.memory.home&&a.room.controller.my&&(d.push(a.name),Commands.setRoomType(a.room,{type:"base"}),a.suicide())}),_.remove(b,function(a){return-1!==
d.indexOf(a.name)}),d=[],0!==b.length&&(c&&!c.unobservable&&c.controller&&_.forEach(b,function(a){TaskReserve.getRemoteTask(a).canAssign(a)&&(a.say("Reserving"),d.push(a.name))}),_.remove(b,function(a){return-1!==d.indexOf(a.name)}),d=[],0!==b.length&&_.forEach(b,function(a){(new TaskRally(a.memory.home)).canAssign(a)})))}};require("screeps-profiler").registerObject(Reserver,"RoleRemoteReserver");module.exports=Reserver;