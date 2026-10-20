import {test,expect} from '@playwright/test';
import {TASKS,MEETINGS} from '../src/content.js';
async function start(page,role='junior',track='frontend'){
  await page.goto('./');await page.locator(`[data-role="${role}"]`).click();
  await page.locator('#track').selectOption(track);
  await page.getByRole('button',{name:'打卡，開始今天'}).click();
  await page.getByRole('button',{name:'知道了，開始工作'}).click();
}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('sprint-after-nine:v1')));
for(const [role,track] of [['junior','frontend'],['senior','backend'],['manager','fullstack']]){
  test(`${role} complete day`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await start(page,role,track);
    for(let i=0;i<80;i++){
      const s=await saved(page);if(s.status==='ended')break;
      const due=MEETINGS.find(m=>!s.meetings[m.id]&&m.at===s.minute);
      if(due){await page.locator('[data-meeting-attend]').click();continue;}
      if(s.pendingEvent){await page.locator('[data-event-careful]').click();continue;}
      const task=TASKS[role].find(t=>!s.completedTasks.includes(t.id));
      const next=MEETINGS.find(m=>!s.meetings[m.id]&&m.at>s.minute);
      if(task&&(!next||s.minute+task.choices.find(c=>c.id==='careful').minutes<=next.at)){
        await page.locator(`[data-station="${task.stationId}"]`).click();
        await page.locator(`[data-task="${task.id}"][data-choice="careful"]`).click();
      }else{
        await page.locator('[data-station="pantry"]').click();
        await page.getByRole('button',{name:'休息 15 分鐘',exact:true}).click();
      }
    }
    await expect(page.getByRole('heading',{name:'穩定交付',exact:true})).toBeVisible();
    expect((await saved(page)).minute).toBe(1080);
    expect(errors).toEqual([]);
  });
}
test('pause, reload, keyboard and restart',async({page})=>{
  await start(page);
  await page.getByRole('button',{name:'暫停',exact:true}).click();
  await expect(page.getByRole('heading',{name:'先把時間留在這裡。'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'暫停',exact:true})).toBeFocused();
  await page.reload();await page.getByRole('button',{name:'接著上次的進度'}).click();
  expect((await saved(page)).minute).toBe(540);
  await page.getByRole('button',{name:'重新開始',exact:true}).click();
  await page.getByRole('button',{name:'確定重新開始'}).click();
  await expect(page.getByRole('button',{name:'打卡，開始今天'})).toBeVisible();
});
for(const [width,height] of [[390,844],[768,1024],[1440,900],[844,390]]){
  test(`layout ${width}x${height}`,async({page})=>{
    await page.setViewportSize({width,height});await start(page);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/layout-${width}.png`,fullPage:true});
    await page.locator('[data-station="whiteboard"]').click();
    await expect(page.locator('[data-task="junior-0"][data-choice="careful"]')).toBeVisible();
  });
}
test('3D scene and context loss preserve the playable journal',async({page})=>{
  await start(page);
  await expect(page.locator('#scene canvas')).toBeVisible();
  await page.locator('#scene canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await expect(page.locator('#scene-warning')).toBeVisible();
  await page.getByRole('button',{name:'整理成果，提早下班'}).click();
  await page.getByRole('button',{name:'確定下班',exact:true}).click();
  await expect(page.getByRole('heading',{name:'帶著未完清單下班'})).toBeVisible();
});
test('tutorial focus, movement, blur and panel input isolation',async({page})=>{
  await start(page);
  await expect(page.locator('#panel')).toBeFocused();
  await expect(page.locator('#scene')).toHaveAttribute('data-position',/.+/);
  const initial=await page.locator('#scene').getAttribute('data-position');
  await page.keyboard.down('d');
  await expect.poll(()=>page.locator('#scene').getAttribute('data-position')).not.toBe(initial);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  const stopped=await page.locator('#scene').getAttribute('data-position');
  await page.waitForTimeout(150);
  expect(await page.locator('#scene').getAttribute('data-position')).toBe(stopped);
  await page.keyboard.up('d');
  await page.locator('[data-station="whiteboard"]').click();
  const opened=await page.locator('#scene').getAttribute('data-position');
  await page.keyboard.down('d');await page.waitForTimeout(150);await page.keyboard.up('d');
  expect(await page.locator('#scene').getAttribute('data-position')).toBe(opened);
});
test('duplicate click and pending event survive reload',async({page})=>{
  await start(page);
  await page.locator('[data-station="whiteboard"]').click();
  await page.locator('[data-task="junior-0"][data-choice="careful"]').evaluate(b=>{b.click();b.click();});
  expect((await saved(page)).revision).toBe(1);
  await page.locator('[data-meeting-attend]').click();
  while(!(await saved(page)).pendingEvent){
    await page.locator('[data-station="pantry"]').click();
    await page.getByRole('button',{name:'休息 15 分鐘',exact:true}).click();
  }
  const before=await saved(page);
  await page.reload();await page.getByRole('button',{name:'接著上次的進度'}).click();
  expect((await saved(page)).pendingEvent).toBe(before.pendingEvent);
  await page.locator('[data-event-careful]').click();
  expect((await saved(page)).revision).toBe(before.revision+1);
});
test('WebGL unavailable and storage denied still allow a complete ending',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};
    Storage.prototype.setItem=function(){throw new DOMException('Denied','QuotaExceededError');};
  });
  await start(page);
  await expect(page.locator('#scene-warning')).toBeVisible();
  await expect(page.locator('#panel')).toContainText('無法儲存進度');
  await page.getByRole('button',{name:'整理成果，提早下班'}).click();
  await page.getByRole('button',{name:'確定下班',exact:true}).click();
  await expect(page.getByRole('heading',{name:'帶著未完清單下班'})).toBeVisible();
});
test('touch stations and reduced motion',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(process.env.PLAY_URL||'http://127.0.0.1:4173/');
  await page.getByRole('button',{name:'打卡，開始今天'}).tap();
  await page.getByRole('button',{name:'知道了，開始工作'}).tap();
  await page.locator('[data-station="whiteboard"]').tap();
  await page.locator('[data-task="junior-0"][data-choice="careful"]').tap();
  expect((await saved(page)).completedTasks).toEqual(['junior-0']);
  await page.setViewportSize({width:844,height:390});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await context.close();
});
test('resize clears held keys until a fresh keydown',async({page})=>{
  await start(page);await expect(page.locator('#scene')).toHaveAttribute('data-position',/.+/);
  await page.keyboard.down('d');
  await expect.poll(()=>page.locator('#scene').getAttribute('data-position')).not.toBe('0.000,0.100');
  await page.setViewportSize({width:1400,height:900});
  await page.waitForTimeout(150);
  const stopped=await page.locator('#scene').getAttribute('data-position');
  await page.evaluate(()=>document.querySelector('#panel').dispatchEvent(new KeyboardEvent('keydown',{key:'d',repeat:true,bubbles:true})));
  await page.waitForTimeout(150);
  expect(await page.locator('#scene').getAttribute('data-position')).toBe(stopped);
  await page.keyboard.up('d');
});
test('closing a station returns focus to its trigger',async({page})=>{
  await start(page);await page.locator('[data-station="whiteboard"]').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-station="whiteboard"]')).toBeFocused();
});
