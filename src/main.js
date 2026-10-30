import {createGame,transition} from './game-state.js';
import {loadGame,saveGame,clearGame} from './storage.js';
import {MEETINGS,TASKS,FACILITY_ACTIONS} from './content.js';
import {mountUI} from './ui.js';
let storage;
try{storage=window.localStorage;}catch{storage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};}
let loaded=loadGame(storage),state=null,scene=null,audio=null;
const u={paused:false,activeStation:null,soundEnabled:false,storageWarning:loaded.warning,sceneWarning:'',hasSave:!!loaded.state,feedback:''};
const modal=document.querySelector('#modal');
let returnFocus=null,returnId=null;
function closeModal(){
  modal.close();u.paused=false;sync();
  const target=(returnId&&document.getElementById(returnId))||(returnFocus?.isConnected&&returnFocus!==document.body?returnFocus:null)||document.querySelector('#panel');
  target.focus({preventScroll:true});
}
function showModal(title,text,buttons){
  returnFocus=document.activeElement;returnId=returnFocus?.id;u.paused=true;sync();
  modal.replaceChildren();
  const h=document.createElement('h2');h.id='modal-title';h.textContent=title;modal.append(h);
  const p=document.createElement('p');p.textContent=text;modal.append(p);
  for(const [label,action] of buttons){const b=document.createElement('button');b.className='secondary';b.textContent=label;b.onclick=()=>{closeModal();action?.();};modal.append(b);}
  modal.showModal();
}
function sync(){
  ui.render(state,u);
  const mandatory=state?.pendingEvent||MEETINGS.some(m=>state&&!state.meetings[m.id]&&state.minute===m.at);
  scene?.setInputEnabled(!!state&&state.status==='playing'&&!u.paused&&!mandatory&&!u.activeStation);
  scene?.setPaused?.(!state||state.status!=='playing'||u.paused);
  document.querySelector('#move-controls').hidden=!state||state.status!=='playing'||u.paused||!!mandatory||!!u.activeStation;
}
function command(c){
  if(!state||u.paused)return;
  if(c.type==='finish'&&!c.confirmed){showModal('今天先到這裡？','將依目前的進度、品質、信任與精力結算。',[['繼續工作'],['確定下班',()=>command({...c,confirmed:true})]]);return;}
  const r=transition(state,c);
  if(!r.accepted){
    if(r.conflicts.length&&!MEETINGS.some(m=>r.conflicts.includes(m.id)&&m.at===state.minute)){
      showModal('這項工作會撞到會議。',r.conflicts.map(id=>MEETINGS.find(m=>m.id===id).title).join('、')+'：略過每場會議會降低 9 點信任。',[['取消，重新安排'],['略過會議並繼續',()=>command({...c,skipMeetingIds:r.conflicts})]]);
    }else{u.feedback=r.reason;sync();ui.announce(r.reason);}
    return;
  }
  state=r.state;u.feedback=r.reason||state.history.at(-1).title+'已記錄。';u.activeStation=null;
  const saved=saveGame(storage,state);u.storageWarning=saved.warning;loaded={state,warning:saved.warning};u.hasSave=true;
  sync();ui.announce(u.feedback);audio?.play('done');
  const actionStation=c.type==='facility'?FACILITY_ACTIONS.find(a=>a.id===c.actionId)?.stationId:c.type==='task'?TASKS[state.role].find(a=>a.id===c.actionId)?.stationId:c.type==='meeting'?'meeting':['rest','lunch'].includes(c.type)?'pantry':null;
  if(state.status==='playing'&&actionStation)scene?.playAction?.(actionStation);
}
const ui=mountUI(document.querySelector('#app'),{
  onNewGame(role,track){
    state=createGame({role,track});u.activeStation=null;u.feedback='';u.storageWarning=saveGame(storage,state).warning;u.hasSave=true;
    sync();showModal('今天不必一口氣做完。','移動和閱讀不會推進時間。每個選擇都會顯示耗時與影響。選擇下方站點即可工作；也可以用 WASD／方向鍵移動，靠近後按 E。',[['知道了，開始工作']]);
  },
  onResume(){state=loaded.state;u.activeStation=null;u.feedback='歡迎回來。進度停在你離開的地方。';sync();},
  onStation(id){if(!state||state.status!=='playing'||u.paused)return;const previous=u.activeStation;u.activeStation=id;u.feedback='';sync();if(!id&&previous)document.querySelector(`[data-station="${previous}"]`)?.focus({preventScroll:true});else document.querySelector('#panel').focus({preventScroll:true});if(innerWidth<761)document.querySelector('#panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});},
  onPause(){if(state)showModal('先把時間留在這裡。','休息一下。遊戲不會在背景替你做任何決定。',[['繼續工作']]);},
  onSound(){u.soundEnabled=!u.soundEnabled;audio?.setEnabled(u.soundEnabled);sync();},
  onRestart(){showModal('重新開始這一天？','目前的進度將被新的工作日取代。',[['保留目前進度'],['確定重新開始',()=>{u.storageWarning=clearGame(storage).warning;state=null;loaded={state:null};u.hasSave=false;u.activeStation=null;u.feedback='';sync();}]]);},
  onCommand:command
});
modal.addEventListener('cancel',e=>{e.preventDefault();closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.open&&state){e.preventDefault();if(u.activeStation){const previous=u.activeStation;u.activeStation=null;sync();document.querySelector(`[data-station="${previous}"]`)?.focus({preventScroll:true});}else document.querySelector('#pause')?.click();}});
sync();
// 繪圖載入失敗時，工作日誌仍可獨立完成遊戲。
async function initScene(){
  try{
    const module=await import('./scene.js');
    scene=module.createScene(document.querySelector('#scene'),{onStation:id=>document.querySelector(`[data-station="${id}"]`)?.click(),onUnavailable:reason=>{
      const warning=document.querySelector('#scene-warning');warning.hidden=false;warning.textContent=reason;
    },reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});sync();
  }catch{
    const warning=document.querySelector('#scene-warning');warning.hidden=false;warning.textContent='立體場景暫時無法載入。你仍可使用下方站點完成今天的工作。';
  }
}
initScene();
import('./audio.js').then(m=>{audio=m.createAudio();audio.setEnabled(u.soundEnabled);}).catch(()=>{});
