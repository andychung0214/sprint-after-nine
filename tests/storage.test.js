import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,transition} from '../src/game-state.js';
import {validateSave,loadGame,saveGame,clearGame} from '../src/storage.js';
const fresh=()=>createGame({seed:42});
test('state roundtrip including pending event',()=>{
  const s=fresh();s.minute=615;s.meetings.standup='attended';
  const next=transition(s,{type:'rest',expectedRevision:0}).state;
  const storage={value:null,setItem(k,v){this.value=v;},getItem(){return this.value;},removeItem(){this.value=null;}};
  assert.ok(next.pendingEvent);
  assert.equal(saveGame(storage,next).ok,true);
  assert.deepEqual(loadGame(storage).state,next);
  assert.equal(clearGame(storage).ok,true);
  assert.equal(loadGame(storage).state,null);
});
for(const [name,change] of [
  ['version',s=>s.version=99],['infinite',s=>s.stats.energy=Infinity],
  ['role',s=>s.role='__proto__'],['duplicates',s=>s.eventDeck[1]=s.eventDeck[0]],
  ['dependency',s=>s.completedTasks=['junior-3']],['pending',s=>s.pendingEvent='unknown'],
  ['minute',s=>s.minute=600.5],['history',s=>s.history=[{title:42}]],
  ['index',s=>s.eventIndex=4],['finished',s=>{s.status='ended';s.pendingEvent=s.eventDeck[0];}],
  ['meetings',s=>s.meetings={madeup:'attended'}]
])test(`invalid save rejected: ${name}`,()=>{const s=fresh();change(s);assert.equal(validateSave(s),false);});
test('malformed and denied storage never throw or overwrite',()=>{
  let writes=0;
  const bad={getItem(){return '{';},setItem(){writes++;}};
  assert.equal(loadGame(bad).state,null);assert.ok(loadGame(bad).warning);assert.equal(writes,0);
  const denied={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
  assert.ok(loadGame(denied).warning);assert.equal(saveGame(denied,fresh()).ok,false);assert.equal(clearGame(denied).ok,false);
  assert.equal(validateSave(null),false);
});
