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
      if(task&&(!next||s.minute+30<=next.at)){
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
