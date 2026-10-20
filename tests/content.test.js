import test from 'node:test';
import assert from 'node:assert/strict';
import {TASKS,EVENTS,TRACKS,MEETINGS} from '../src/content.js';
test('three distinct role chains and six complete events',()=>{
  assert.equal(Object.keys(TASKS).length,3);
  for(const tasks of Object.values(TASKS)){
    assert.equal(tasks.length,4);
    tasks.forEach((t,i)=> {
      assert.equal(t.requires.length,i?1:0);
      for(const c of t.choices)assert.ok([15,30,45].includes(c.minutes));
    });
  }
  assert.equal(EVENTS.length,6);
  assert.equal(new Set(EVENTS.map(e=>e.id)).size,6);
  assert.equal(Object.keys(TRACKS).length,3);
  assert.deepEqual(MEETINGS.map(m=>[m.at,m.minutes]),[[570,15],[660,30],[900,30]]);
});
