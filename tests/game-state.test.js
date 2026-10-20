import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, transition, getEnding, getAvailableActions} from '../src/game-state.js';
import {TASKS, MEETINGS} from '../src/content.js';
const game = role => createGame({role: role || 'junior', track: 'frontend', seed: 42});
const send = (s, c) => transition(s, {...c, expectedRevision: s.revision});
test('initial state and immutability; stale revision rejected', () => {
  const s = game();
  assert.equal(s.minute, 540);
  assert.deepEqual(s.stats, {progress:0, quality:65, trust:60, energy:85});
  const r = send(s, {type:'rest'});
  assert.equal(r.accepted, true);
  assert.equal(s.minute, 540);
  assert.equal(r.state.minute, 555);
  assert.equal(transition(r.state, {type:'rest', expectedRevision:0}).accepted, false);
  assert.equal(r.state.stats.progress, 0);
});
test('meeting conflicts are transactional and skips applied once', () => {
  const s = send(game(), {type:'rest'}).state;
  const cmd = {type:'task', actionId:'junior-0', choiceId:'careful'};
  const r = send(s, cmd);
  assert.equal(r.accepted, false);
  assert.deepEqual(r.conflicts, ['standup']);
  assert.equal(r.state, s);
  const confirmed = send(s, {...cmd, skipMeetingIds:r.conflicts});
  assert.equal(confirmed.accepted, true);
  assert.equal(confirmed.state.meetings.standup, 'skipped');
  assert.equal(send(confirmed.state, {type:'meeting',meetingId:'standup',choiceId:'attend'}).accepted,false);
});
test('due meeting gates work, attendance consumes exact time', () => {
  let s = send(game(),{type:'rest'}).state;
  s = send(s,{type:'rest'}).state;
  assert.equal(send(s,{type:'rest'}).accepted,false);
  s = send(s,{type:'meeting',meetingId:'standup',choiceId:'attend'}).state;
  assert.equal(s.minute,585);
  assert.equal(s.meetings.standup,'attended');
});
test('dependencies, lunch and invalid commands cannot grant rewards', () => {
  const s = game();
  assert.equal(send(s,{type:'task',actionId:'junior-3',choiceId:'careful'}).accepted,false);
  assert.equal(send(s,{type:'lunch'}).accepted,false);
  assert.equal(send(s,{type:'invent'}).accepted,false);
  assert.equal(getAvailableActions(s,'desk').some(a=>a.id==='junior-1'),false);
});
test('deterministic events, pending gates work; end has priority', () => {
  assert.deepEqual(game().eventDeck,game().eventDeck);
  assert.equal(new Set(game().eventDeck).size,3);
  const s = game(); s.minute=615; s.meetings.standup='attended';
  const r=send(s,{type:'rest'}).state;
  assert.ok(r.pendingEvent);
  assert.equal(send(r,{type:'rest'}).accepted,false);
  const e=send(r,{type:'event',choiceId:'careful'}).state;
  assert.equal(e.pendingEvent,null);
  const last=game();last.minute=1065;last.meetings={standup:'attended',requirements:'attended',training:'attended'};
  const end=send(last,{type:'rest'}).state;
  assert.equal(end.status,'ended');assert.equal(end.pendingEvent,null);
  assert.equal(send(end,{type:'rest'}).accepted,false);
});
test('six endings, bounds, energy zero and overtime', () => {
  const cases=[
    [90,90,90,0,'burnout'],[80,65,50,1,'steady'],[80,64,80,1,'debt'],
    [80,65,49,1,'isolated'],[79,65,65,1,'negotiated'],[79,65,64,1,'unfinished']
  ];
  for(const [progress,quality,trust,energy,id] of cases)
    assert.equal(getEnding({...game(),stats:{progress,quality,trust,energy}}).id,id);
  const s=game();s.stats.energy=99;
  assert.equal(send(s,{type:'rest'}).state.stats.energy,100);
  s.minute=1070;
  assert.equal(send(s,{type:'rest'}).accepted,false);
  const tired=game();tired.stats.energy=1;
  assert.equal(send(tired,{type:'task',actionId:'junior-0',choiceId:'quick'}).state.status,'ended');
});
for(const role of ['junior','senior','manager']) test(`${role}: legal successful full workday`, () => {
  let s=game(role);
  for(let i=0;i<80 && s.status==='playing';i++){
    const due=MEETINGS.find(m=>!s.meetings[m.id] && s.minute>=m.at);
    let c;
    if(due)c={type:'meeting',meetingId:due.id,choiceId:'attend'};
    else if(s.pendingEvent)c={type:'event',choiceId:'careful'};
    else {
      const task=TASKS[role].find(t=>!s.completedTasks.includes(t.id));
      c=task ? {type:'task',actionId:task.id,choiceId:'careful'} : {type:'rest'};
    }
    let r=send(s,c);
    if(!r.accepted && r.conflicts.length) r=send(s,{type:'rest'});
    assert.equal(r.accepted,true, `${s.minute} ${r.reason}`);
    s=r.state;
  }
  assert.equal(s.status,'ended');
  assert.equal(s.completedTasks.length,4);
  assert.equal(s.minute,1080);
  assert.equal(getEnding(s).id,'steady');
});
test('burnout is reachable through legal choices without injecting resource values',()=>{
  let s=game('senior');
  for(let i=0;i<20&&s.status==='playing';i++){
    const due=MEETINGS.find(m=>!s.meetings[m.id]&&s.minute===m.at);
    const task=TASKS.senior.find(t=>!s.completedTasks.includes(t.id));
    const c=due?{type:'meeting',meetingId:due.id,choiceId:'attend'}:s.pendingEvent?{type:'event',choiceId:'careful'}:task?{type:'task',actionId:task.id,choiceId:'careful'}:{type:'finish'};
    let r=send(s,c);
    if(!r.accepted&&r.conflicts.length)r=send(s,{...c,skipMeetingIds:r.conflicts});
    assert.equal(r.accepted,true,r.reason);s=r.state;
  }
  assert.equal(getEnding(s).id,'burnout');
});
