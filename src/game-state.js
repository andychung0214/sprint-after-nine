import {ROLES,TRACKS,TASKS,EVENTS,MEETINGS,FACILITY_ACTIONS} from './content.js';
export const EVENT_TIMES=[630,810,990];
export function createGame({role='junior',track='frontend',seed=Date.now()>>>0}={}){
  if(!ROLES[role]||!TRACKS[track])throw new Error('不支援的角色或方向');
  let rng=seed>>>0;
  const deck=EVENTS.filter(e=>!e.followupOnly&&(!e.roles||e.roles.includes(role))).map(e=>e.id);
  for(let i=deck.length-1;i>0;i--){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const j=rng%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {version:1,revision:0,role,track,minute:540,stats:{progress:0,quality:65,trust:60,energy:85},
    completedTasks:[],meetings:{},eventDeck:deck.slice(0,3),eventIndex:0,pendingEvent:null,lunchTaken:false,seed:seed>>>0,status:'playing',history:[]};
}
export function getAvailableActions(s,stationId){
  return TASKS[s.role].filter(t=>(!stationId||t.stationId===stationId)&&!s.completedTasks.includes(t.id)&&t.requires.every(id=>s.completedTasks.includes(id)));
}
export function transition(state,c){
  const reject=(reason,conflicts=[])=>({state,accepted:false,reason,conflicts});
  if(state.status!=='playing')return reject('今天已經結束了。');
  if(c.expectedRevision!==state.revision)return reject('這個選項已處理，請重新選擇。');
  const due=MEETINGS.find(m=>!state.meetings[m.id]&&m.at<=state.minute);
  let minutes=0,effects={},title='',result='',task,meeting,choice;
  if(c.type==='finish'){title='下班';}
  else if(c.type==='meeting'){
    meeting=MEETINGS.find(m=>m.id===c.meetingId);
    if(!meeting||state.meetings[meeting.id]||meeting.at!==state.minute||!['attend','skip'].includes(c.choiceId))return reject('現在沒有這場會議。');
    minutes=c.choiceId==='attend'?meeting.minutes:0;
    effects=c.choiceId==='attend'?{trust:5,quality:3,energy:-4}:{trust:-9};
    title=meeting.title+(c.choiceId==='attend'?'・參加':'・略過');
  }else {
    if(due)return reject('先決定是否參加會議。',[due.id]);
    if(state.pendingEvent&&c.type!=='event')return reject('先回覆眼前的突發事件。');
    if(c.type==='task'){
      task=getAvailableActions(state).find(t=>t.id===c.actionId);
      choice=task?.choices.find(o=>o.id===c.choiceId);
      if(!choice)return reject('任務尚未解鎖，或已完成。');
      title=task.title;
    }else if(c.type==='event'){
      const event=EVENTS.find(e=>e.id===state.pendingEvent);
      choice=event?.choices.find(o=>o.id===c.choiceId);
      if(!choice)return reject('沒有待處理事件。');
      title=event.title;
    }else if(c.type==='facility'){
      choice=FACILITY_ACTIONS.find(a=>a.id===c.actionId);
      if(!choice||state.history.some(h=>h.title===choice.title))return reject('這項設施工作已完成，或不存在。');
      title=choice.title;
    }else if(c.type==='rest'){minutes=15;effects={energy:18};title='短暫休息';result='離開螢幕，讓注意力回到自己身上。';}
    else if(c.type==='lunch'){
      if(state.minute<720||state.lunchTaken)return reject('午休還沒開始，或已經休息過了。');
      minutes=30;effects={energy:35,trust:2};title='好好吃午餐';
    }else return reject('不支援的操作。');
    if(choice){minutes=choice.minutes;effects=choice.effects;result=choice.result;}
  }
  if(state.minute+minutes>1080)return reject('剩下的時間不夠，先整理今天的成果吧。');
  const conflicts=c.type==='finish'?[]:MEETINGS.filter(m=>!state.meetings[m.id]&&m.at>state.minute&&m.at<state.minute+minutes).map(m=>m.id);
  if(conflicts.some(id=>!c.skipMeetingIds?.includes(id)))return reject('這項工作會跨過會議時間。',conflicts);
  const s=structuredClone(state);
  for(const id of conflicts){s.meetings[id]='skipped';s.stats.trust=Math.max(0,s.stats.trust-9);}
  for(const [key,value] of Object.entries(effects))s.stats[key]=Math.max(0,Math.min(100,s.stats[key]+value));
  s.minute+=minutes;s.revision++;
  if(task)s.completedTasks.push(task.id);
  if(meeting)s.meetings[meeting.id]=c.choiceId==='attend'?'attended':'skipped';
  if(c.type==='event'){
    s.pendingEvent=null;
    if(choice.followup&&s.eventIndex<s.eventDeck.length&&!s.eventDeck.includes(choice.followup))s.eventDeck[s.eventIndex]=choice.followup;
  }
  if(c.type==='lunch')s.lunchTaken=true;
  s.history.push({minute:s.minute,title,choice:choice?.label||'',result,effects:Object.fromEntries(Object.keys(s.stats).map(k=>[k,s.stats[k]-state.stats[k]]))});
  if(c.type==='finish'||s.minute>=1080||s.stats.energy===0){s.status='ended';s.pendingEvent=null;}
  else if(!s.pendingEvent&&s.eventIndex<3&&s.minute>=EVENT_TIMES[s.eventIndex]){
    s.pendingEvent=s.eventDeck[s.eventIndex++];
  }
  return {state:s,accepted:true,reason:result,conflicts:[]};
}
export function getEnding(s){
  const {progress:p,quality:q,trust:t,energy:e}=s.stats;
  let id=e===0?'burnout':p>=80?(q<65?'debt':t<50?'isolated':'steady'):t>=65?'negotiated':'unfinished';
  // 核心交付與風險先判定；有完成交付才依今日最後一項專長選擇分支。
  if(id==='steady'){
    const specialties={recovery:['guardian',q>=80],pairing:['mentor',t>=75],handover:['bridge',t>=75],
      'scope-plan':['strategist',t>=80],experiment:['inventor',q>=85],unplug:['balanced',e>=60]};
    for(const h of s.history){const a=FACILITY_ACTIONS.find(a=>a.title===h.title);if(a&&specialties[a.id][1])id=specialties[a.id][0];}
  }
  const endings={
    burnout:['過勞收場','工作還在，但你需要先休息。明天的自己也值得被照顧。'],
    steady:['穩定交付','功能交出去了，品質與夥伴也一起帶到了終點。準時下班，是一種專業。'],
    debt:['技術債留到明天','進度完成了。那些略過的驗證，已經在明天的清單上。'],
    isolated:['交付完成，合作失溫','成果到位了。下一次，也留一點時間給一起工作的人。'],
    negotiated:['誠實協商，明天再戰','還有沒做完的事，但團隊知道原因，也知道下一步。'],
    unfinished:['帶著未完清單下班','今天沒有解完每道題。把卡住的地方寫下來，明天從那裡開始。'],
    guardian:['可靠性的守門人','交付完成，復原路徑也經過演練。你為明天可能發生的意外留了一條路。'],
    mentor:['讓同事也能前進','自己的工作完成了，同事也找到了方法。你留下的不只是答案。'],
    bridge:['交接的橋梁','成果與操作知識一起交付，接手的人不再需要猜。'],
    strategist:['有取捨的承諾','團隊知道什麼現在做、什麼稍後做。清楚的範圍成了可靠交付的起點。'],
    inventor:['有證據的探索','原型驗證了假設，測試守住了品質。今天的新點子有了可重現的根據。'],
    balanced:['留有餘裕的下班','工作交出去了，你也有精力走進自己的生活。明天不必靠透支今天開始。']
  };
  return {id,title:endings[id][0],summary:endings[id][1]};
}
