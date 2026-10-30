import {ROLES,TRACKS,STATIONS,TASKS,MEETINGS,EVENTS,FACILITY_ACTIONS} from './content.js';
import {getAvailableActions,getEnding} from './game-state.js';
export const time=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={progress:'交付進度',quality:'程式碼品質',trust:'團隊信任',energy:'精力'};
const effects=e=>Object.entries(e).map(([k,v])=>`${labels[k]} ${v>0?'+':''}${v}`).join(' · ');
export function mountUI(root,callbacks){
  const panel=document.querySelector('#panel'),hud=document.querySelector('#hud'),stations=document.querySelector('#stations'),toolbar=document.querySelector('#toolbar');
  let role='junior',track='frontend';
  function render(s,u){
    const oldFocus=document.activeElement?.id;
    toolbar.innerHTML=`<button id="sound" data-control="sound" aria-pressed="${u.soundEnabled}">聲音 ${u.soundEnabled?'開':'關'}</button>${s?'<button id="pause" data-control="pause">暫停</button><button data-control="restart">重新開始</button>':''}`;
    const playing=s?.status==='playing';
    hud.innerHTML=s?`<div class="clock"><small>${ROLES[s.role].name.toUpperCase()} / ${TRACKS[s.track].name}</small><span>${time(s.minute)}</span></div><div class="stats">${Object.entries(s.stats).map(([k,v])=>`<div><div class="stat-top"><span>${labels[k]}</span><strong>${v}<small> /100</small></strong></div><div class="meter ${v<30?'low':''}" role="meter" aria-label="${labels[k]}" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><span style="width:${v}%"></span></div></div>`).join('')}</div>`:'';
    stations.innerHTML=STATIONS.map(st=>`<button class="station ${u.activeStation===st.id?'active':''} ${playing&&getAvailableActions(s,st.id).length?'has-task':''}" data-station="${st.id}" ${!playing?'disabled':''}><span class="number">${st.number}</span><span><b>${st.name}</b><small>${st.short}</small></span></button>`).join('');
    if(!s){
      panel.innerHTML=`<span class="eyebrow">A SMALL GAME ABOUT A LONG DAY</span><h1 class="hero-title">九點<br><em>以後。</em></h1><p class="lead">寫程式，開會，接住突然來的事。<br>今天，你會怎麼下班？</p><div class="role-options">${Object.entries(ROLES).map(([id,r])=>`<button class="role ${role===id?'selected':''}" data-role="${id}" aria-pressed="${role===id}"><b>${r.name}</b><small>${r.zh}</small></button>`).join('')}</div><p class="lead" id="role-note">${ROLES[role].note}</p><label class="field" for="track">今天的開發方向<select id="track">${Object.entries(TRACKS).map(([id,t])=>`<option value="${id}" ${id===track?'selected':''}>${t.name}</option>`).join('')}</select></label><button class="primary" data-control="start">打卡，開始今天</button>${u.hasSave?'<button class="secondary" data-control="resume">接著上次的進度</button>':''}<p class="tiny-note">一局約 10–15 分鐘 · 不需登入 · 隨時可以休息</p>${u.storageWarning?`<p class="notice">${esc(u.storageWarning)}</p>`:''}`;
    }else if(s.status==='ended'){
      const end=getEnding(s);
      panel.innerHTML=`<div class="ticket-top"><span class="eyebrow">END OF DAY / ${time(s.minute)}</span><span class="badge">工作日報告</span></div><span class="stamp">今日已打卡</span><h2>${end.title}</h2><p class="lead">${end.summary}</p><div class="result-stat">${Object.entries(s.stats).map(([k,v])=>`<div>${labels[k]}<b>${v}</b></div>`).join('')}</div><h3>帶走的成果</h3><ul class="checklist">${TASKS[s.role].map(t=>`<li>${s.completedTasks.includes(t.id)?'✓':'○'} ${t.title}</li>`).join('')}</ul><details><summary>回看今天的選擇（${s.history.length}）</summary><ol class="history">${s.history.map(h=>`<li><b>${time(h.minute)} ${esc(h.title)}</b><br>${esc(h.choice)}<br>${esc(effects(h.effects))}</li>`).join('')}</ol></details><button class="primary" data-control="restart">再過一天</button><p class="tiny-note">這是一段虛構日常，不是真實工作能力評量。</p>`;
    }else{
      const due=MEETINGS.find(m=>!s.meetings[m.id]&&m.at===s.minute);
      const event=EVENTS.find(e=>e.id===s.pendingEvent);
      const st=STATIONS.find(t=>t.id===u.activeStation);
      let body='';
      if(due){
        body=`<span class="eyebrow">ON THE CALENDAR</span><h2>${due.title}</h2><p class="lead">${due.body}</p><button class="choice" data-meeting-attend="${due.id}"><b>參加會議</b><small>${due.minutes} 分鐘 · 品質 +3 · 信任 +5 · 精力 -4</small></button><button class="choice" data-meeting-skip="${due.id}"><b>這次先不參加</b><small>0 分鐘 · 信任 -9</small></button>`;
      }else if(event){
        body=`<span class="eyebrow">SOMETHING CAME UP / 突發事件</span><h2>${event.title}</h2><p class="lead">${event.body}</p>${event.choices.map(c=>`<button class="choice" data-event="${c.id}" ${c.id==='careful'?'data-event-careful':''}><b>${c.label}</b><small>${c.minutes} 分鐘 · ${effects(c.effects)}</small></button>`).join('')}`;
      }else if(st){
        const tasks=getAvailableActions(s,st.id);
        body=`<span class="eyebrow">STATION ${st.number} / ${st.name}</span><h2>${tasks[0]?.title||st.description}</h2>`;
        if(tasks.length)body+=tasks.map(t=>`<p class="lead">${t.body}</p><p class="brief">${TRACKS[s.track].brief}<br><small>${TRACKS[s.track].detail}</small></p>${t.choices.map(c=>`<button class="choice" data-task="${t.id}" data-choice="${c.id}"><b>${c.label}</b><small>${c.minutes} 分鐘 · ${effects(c.effects)}</small></button>`).join('')}`).join('');
        else if(st.id==='pantry')body+=`<p class="lead">從螢幕抬起頭。進度不會因為一杯水消失，注意力卻會回來。</p><button class="choice" data-control="rest" aria-label="休息 15 分鐘"><b>休息 15 分鐘</b><small>精力 +18 · 時間 +15 分鐘</small></button>${s.minute>=720&&!s.lunchTaken?'<button class="choice" data-control="lunch"><b>好好吃午餐</b><small>30 分鐘 · 精力 +35 · 信任 +2</small></button>':''}`;
        else body+=`<p class="lead">${FACILITY_ACTIONS.some(a=>a.stationId===st.id)?'這些額外工作會花時間，也會為今天留下不同的成果。':'這裡暫時沒有可執行的任務。看看今天的清單，紅點標出了下一站。'}</p>`;
        const facilities=FACILITY_ACTIONS.filter(a=>a.stationId===st.id);
        if(facilities.length)body+=`<div class="facility-actions"><h3>設施工作 · 每日一次</h3>${facilities.map(a=>{const done=s.history.some(h=>h.title===a.title);return `<button class="choice" data-facility="${a.id}" ${done?'disabled':''}><b>${done?'✓ ':''}${a.label}</b><small>${done?'今日已完成':`${a.minutes} 分鐘 · ${effects(a.effects)}`}</small></button>`;}).join('')}</div>`;
        body+='<button class="secondary" data-control="overview">回到今日清單</button>';
      }else{
        body=`<span class="eyebrow">TODAY'S FIELD NOTES</span><h2>今天，先從這裡開始。</h2><p class="lead">${ROLES[s.role].note}</p><p class="brief">${TRACKS[s.track].brief}</p><ul class="checklist">${TASKS[s.role].map(t=>`<li class="${s.completedTasks.includes(t.id)?'checked':''}">${s.completedTasks.includes(t.id)?'✓':'○'} ${t.title}</li>`).join('')}</ul><p class="lead">選擇下方有紅點的站點，或在辦公室走近後按 E。</p>`;
      }
      panel.innerHTML=`<div class="ticket-top"><span class="eyebrow">DAY 01 / 工作日誌</span><span class="badge">${ROLES[s.role].name}</span></div>${u.feedback?`<p class="feedback" role="status">${esc(u.feedback)}</p>`:''}${u.storageWarning?`<p class="notice">${esc(u.storageWarning)}</p>`:''}${body}<div class="schedule"><span class="eyebrow">TODAY'S MEETINGS</span>${MEETINGS.map(m=>`<div class="schedule-row ${s.meetings[m.id]?'done':''} ${s.minute===m.at?'due':''}"><time>${time(m.at)}</time><span>${m.title}</span><span>${s.meetings[m.id]==='attended'?'✓':s.meetings[m.id]==='skipped'?'略過':''}</span></div>`).join('')}</div><button class="secondary" data-control="finish">整理成果，提早下班</button>`;
    }
    const revision=s?.revision;
    root.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>callbacks.onStation(b.dataset.station));
    panel.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{role=b.dataset.role;render(s,u);panel.querySelector(`[data-role="${role}"]`).focus();});
    panel.querySelector('#track')?.addEventListener('change',e=>track=e.target.value);
    document.querySelectorAll('[data-control]').forEach(b=>b.onclick=()=>{
      const c=b.dataset.control;
      if(c==='start')callbacks.onNewGame(role,track);
      else if(c==='resume')callbacks.onResume();
      else if(c==='pause')callbacks.onPause();
      else if(c==='sound')callbacks.onSound();
      else if(c==='overview')callbacks.onStation(null);
      else if(c==='restart')callbacks.onRestart();
      else callbacks.onCommand({type:c,expectedRevision:revision});
    });
    panel.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>callbacks.onCommand({type:'task',actionId:b.dataset.task,choiceId:b.dataset.choice,expectedRevision:revision}));
    panel.querySelectorAll('[data-event]').forEach(b=>b.onclick=()=>callbacks.onCommand({type:'event',choiceId:b.dataset.event,expectedRevision:revision}));
    panel.querySelectorAll('[data-facility]').forEach(b=>b.onclick=()=>callbacks.onCommand({type:'facility',actionId:b.dataset.facility,expectedRevision:revision}));
    panel.querySelectorAll('[data-meeting-attend],[data-meeting-skip]').forEach(b=>b.onclick=()=>callbacks.onCommand({type:'meeting',meetingId:b.dataset.meetingAttend||b.dataset.meetingSkip,choiceId:b.hasAttribute('data-meeting-attend')?'attend':'skip',expectedRevision:revision}));
    if(oldFocus)document.getElementById(oldFocus)?.focus({preventScroll:true});
  }
  return {render,announce(text){document.querySelector('#announcement').textContent=text;},destroy(){panel.replaceChildren();}};
}
