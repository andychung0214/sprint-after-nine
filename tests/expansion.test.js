import test from 'node:test';
import assert from 'node:assert/strict';
import * as content from '../src/content.js';
import {createGame,transition,getEnding} from '../src/game-state.js';
import {validateSave} from '../src/storage.js';
const send=(s,c)=>transition(s,{...c,expectedRevision:s.revision});
test('expanded office has nine usable stations and 24 unique events',()=>{
  assert.equal(content.STATIONS.length,9);
  assert.equal(content.EVENTS.length,24);
  assert.equal(new Set(content.EVENTS.map(e=>e.id)).size,24);
});
test('facility choices spend time, cannot repeat rewards, and roundtrip as valid saves',()=>{
  let s=createGame({seed:42});
  let r=send(s,{type:'facility',actionId:'recovery'});
  assert.equal(r.accepted,true);
  s=r.state;assert.equal(s.minute,555);assert.equal(s.stats.quality,73);
  assert.equal(validateSave(s),true);
  assert.equal(send(s,{type:'facility',actionId:'recovery'}).accepted,false);
  assert.equal(send(s,{type:'facility',actionId:'unknown'}).accepted,false);
});
test('role-specific events stay out of other roles and followups are not drawn initially',()=>{
  for(const role of ['junior','senior','manager'])for(let seed=0;seed<80;seed++){
    const s=createGame({role,seed});
    for(const id of s.eventDeck){const e=content.EVENTS.find(e=>e.id===id);assert.ok(!e.followupOnly);assert.ok(!e.roles||e.roles.includes(role));}
  }
  assert.ok(content.EVENTS.some(e=>e.roles));
});
test('rushed production incident schedules a real consequence without duplicating the deck',()=>{
  let s=createGame({seed:42});
  s.eventDeck=['incident','help','spec'];
  while(!s.pendingEvent){const due=content.MEETINGS.find(m=>!s.meetings[m.id]&&m.at===s.minute);s=send(s,due?{type:'meeting',meetingId:due.id,choiceId:'attend'}:{type:'rest'}).state;}
  s=send(s,{type:'event',choiceId:'quick'}).state;
  assert.equal(s.eventDeck[1],'incident-followup');
  assert.equal(validateSave(s),true);
});
test('six specialist endings are reachable through legal facility decisions',()=>{
  for(const [actionId,ending] of [['recovery','guardian'],['pairing','mentor'],['handover','bridge'],['scope-plan','strategist'],['experiment','inventor'],['unplug','balanced']]){
    let s=createGame({seed:42});
    const actions=[actionId];
    for(let i=0;i<80&&s.status==='playing';i++){
      const due=content.MEETINGS.find(m=>!s.meetings[m.id]&&m.at===s.minute);
      const task=content.TASKS[s.role].find(t=>!s.completedTasks.includes(t.id));
      let c=due?{type:'meeting',meetingId:due.id,choiceId:'attend'}:s.pendingEvent?{type:'event',choiceId:'careful'}:actions.length?{type:'facility',actionId:actions[0]}:task?{type:'task',actionId:task.id,choiceId:'careful'}:{type:'rest'};
      if(!due&&!s.pendingEvent&&s.stats.energy<25)c={type:'rest'};
      let r=send(s,c);
      if(!r.accepted&&r.conflicts.length)r=send(s,{type:'rest'});
      else if(r.accepted&&c.type==='facility')actions.shift();
      assert.equal(r.accepted,true,r.reason);s=r.state;assert.equal(validateSave(s),true);
    }
    assert.equal(getEnding(s).id,ending,actionId);
  }
});
