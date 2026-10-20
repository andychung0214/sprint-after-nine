import {ROLES,TRACKS,TASKS,EVENTS,MEETINGS} from './content.js';
import {EVENT_TIMES} from './game-state.js';
const KEY='sprint-after-nine:v1';
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const text=v=>typeof v==='string'&&v.length<1000;
const unique=a=>new Set(a).size===a.length;
export function validateSave(s){
  try{
    if(!s||s.version!==1||!Object.hasOwn(ROLES,s.role)||!Object.hasOwn(TRACKS,s.track))return false;
    if(!integer(s.minute,540,1080)||s.minute%15!==0||!integer(s.revision,0,1000)||!integer(s.seed,0,4294967295))return false;
    if(!['playing','ended'].includes(s.status)||typeof s.lunchTaken!=='boolean')return false;
    if(!s.stats||!['progress','quality','trust','energy'].every(k=>integer(s.stats[k],0,100)))return false;
    if(!Array.isArray(s.completedTasks)||!unique(s.completedTasks))return false;
    const tasks=TASKS[s.role];
    if(!s.completedTasks.every((id,i)=>tasks[i]?.id===id))return false;
    if(!Array.isArray(s.eventDeck)||s.eventDeck.length!==3||!unique(s.eventDeck)||!s.eventDeck.every(id=>EVENTS.some(e=>e.id===id)))return false;
    if(!integer(s.eventIndex,0,3))return false;
    if(s.pendingEvent!==null&&(s.eventIndex===0||s.pendingEvent!==s.eventDeck[s.eventIndex-1]))return false;
    if(!s.meetings||typeof s.meetings!=='object'||Array.isArray(s.meetings))return false;
    if(!Object.entries(s.meetings).every(([id,v])=>MEETINGS.some(m=>m.id===id&&s.minute>=m.at)&&['attended','skipped'].includes(v)))return false;
    if(MEETINGS.some(m=>m.at<s.minute&&!s.meetings[m.id]))return false;
    if(s.lunchTaken&&s.minute<750)return false;
    if(s.status==='ended'&&s.pendingEvent!==null)return false;
    if(s.status==='playing'&&(s.minute===1080||s.stats.energy===0))return false;
    if(!Array.isArray(s.history)||s.history.length!==s.revision||s.history.length>1000)return false;
    if(!s.history.every(h=>integer(h.minute,540,s.minute)&&text(h.title)&&text(h.choice)&&text(h.result)&&h.effects&&['progress','quality','trust','energy'].every(k=>integer(h.effects[k],-100,100))))return false;
    const eligible=EVENT_TIMES.filter(t=>s.minute>=t).length;
    if(s.eventIndex>eligible||(s.status==='playing'&&s.eventIndex!==eligible))return false;
    const resolved=s.history.filter(h=>EVENTS.some(e=>e.title===h.title));
    if(!resolved.every((h,i)=>EVENTS.find(e=>e.id===s.eventDeck[i])?.title===h.title&&h.minute>=EVENT_TIMES[i]+15))return false;
    const unhandled=s.eventIndex-resolved.length;
    if(s.status==='playing'&&unhandled!==(s.pendingEvent?1:0))return false;
    if(s.status==='ended'&&(unhandled<0||unhandled>1||eligible-s.eventIndex>1))return false;
    return true;
  }catch{return false;}
}
export function loadGame(storage){
  try{
    const raw=storage.getItem(KEY);
    if(!raw)return {state:null,warning:''};
    const state=JSON.parse(raw);
    return validateSave(state)?{state,warning:''}:{state:null,warning:'這份存檔無法使用。請開始新的一天。'};
  }catch{return {state:null,warning:'無法讀取存檔。仍可開始遊戲，本次可能無法保存進度。'};}
}
export function saveGame(storage,state){
  try{
    if(!validateSave(state))return {ok:false,warning:'進度格式異常，這次沒有覆寫存檔。'};
    storage.setItem(KEY,JSON.stringify(state));return {ok:true,warning:''};
  }catch{return {ok:false,warning:'瀏覽器無法儲存進度；你仍可繼續遊玩，但關閉頁面後進度可能遺失。'};}
}
export function clearGame(storage){
  try{storage.removeItem(KEY);return {ok:true,warning:''};}
  catch{return {ok:false,warning:'無法清除舊存檔；新局仍可在本頁進行。'};}
}
