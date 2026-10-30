export const ROLES = {
  junior: {name:'Junior', zh:'初階工程師', note:'第一次獨立交付，問題比答案多一點。', badge:'從一張規格開始'},
  senior: {name:'Senior', zh:'資深工程師', note:'寫自己的程式，也接住別人的問題。', badge:'讓整個團隊前進'},
  manager: {name:'Lead', zh:'管理階層', note:'今天最難的技術，是說清楚「不」。', badge:'在承諾之間取捨'}
};
export const TRACKS = {
  frontend:{name:'前端', brief:'設計稿裡的結帳頁少了錯誤狀態。手機版欄位該怎麼排？', detail:'驗收：390px 不溢出、鍵盤可操作、載入與錯誤狀態清楚。'},
  backend:{name:'後端', brief:'訂單 API 要接新欄位，但 SA 文件沒有寫重複請求怎麼辦。', detail:'驗收：輸入驗證、冪等處理、權限檢查與一致的錯誤回應。'},
  fullstack:{name:'全端', brief:'畫面說「已完成」，API 卻還在處理。兩邊對狀態的理解不一樣。', detail:'驗收：契約一致、整合測試、錯誤復原與完整使用者路徑。'}
};
export const STATIONS = [
  {id:'desk',name:'我的座位',short:'開發',number:'01',x:-3.8,z:1.6,description:'把需求變成能用的東西。'},
  {id:'whiteboard',name:'協作白板',short:'釐清',number:'02',x:0,z:-2.8,description:'先把問題問對，再開始解。'},
  {id:'meeting',name:'會議室',short:'對齊',number:'03',x:4,z:-1.8,description:'說進度，也說卡住的地方。'},
  {id:'test',name:'測試工作站',short:'驗證',number:'04',x:3.5,z:2,description:'「在我電腦可以」還不算完成。'},
  {id:'pantry',name:'茶水間',short:'喘口氣',number:'05',x:-4,z:-2.6,description:'咖啡不會修好錯誤，休息可能會。'},
  {id:'reception',name:'接待區',short:'交接',number:'06',x:-8,z:3,description:'讓資訊有去處，讓交接有接手的人。'},
  {id:'server',name:'機房',short:'可靠性',number:'07',x:8,z:-3,description:'備份不是有檔案就好，還要真的還原得回來。'},
  {id:'lounge',name:'休息區',short:'交流',number:'08',x:-7.8,z:-3.7,description:'有些問題，離開座位才能想清楚。'},
  {id:'manager',name:'主管室',short:'取捨',number:'09',x:8,z:3,description:'把不能同時完成的事，說清楚。'}
];
// 每項一天一次，避免反覆使用設施刷取品質與信任。
export const FACILITY_ACTIONS = [
  {id:'recovery',stationId:'server',title:'驗證備份還原',label:'在隔離環境演練還原',minutes:15,effects:{quality:8,energy:-6},result:'還原成功，復原步驟與耗時都已記錄。'},
  {id:'experiment',stationId:'server',title:'隔離環境實驗',label:'用小型原型驗證技術假設',minutes:30,effects:{quality:10,energy:-10},result:'原型回答了問題，正式環境沒有被當成實驗室。'},
  {id:'handover',stationId:'reception',title:'跨組交接',label:'核對窗口、操作文件與聯絡方式',minutes:15,effects:{trust:8,energy:-4},result:'下一個接手的人，不必從猜測開始。'},
  {id:'pairing',stationId:'lounge',title:'陪同事拆解難題',label:'一起畫出問題與最小重現步驟',minutes:15,effects:{trust:9,quality:3,energy:-6},result:'你沒有代寫答案，對方已能自己繼續往下走。'},
  {id:'unplug',stationId:'lounge',title:'離線伸展',label:'放下手機，伸展與看窗外',minutes:15,effects:{energy:22},result:'不是每個空檔都需要填滿。注意力回來了。'},
  {id:'scope-plan',stationId:'manager',title:'重整交付範圍',label:'寫下必做、延後與風險負責人',minutes:30,effects:{trust:10,quality:4,energy:-6},result:'取捨留下了紀錄，團隊知道哪些承諾是真的。'}
];
const workloads = {
  junior:{minutes:[30,30,30,30],quality:8,trust:4,energy:15,quickQuality:-13,quickTrust:-4},
  senior:{minutes:[30,45,30,30],quality:9,trust:7,energy:19,quickQuality:-16,quickTrust:-5},
  manager:{minutes:[30,30,45,30],quality:4,trust:9,energy:16,quickQuality:-9,quickTrust:-12}
};
const chain = (role, rows) => rows.map(([title,stationId,body,careful,quick],i)=>({
  id:`${role}-${i}`, title, stationId, body, requires:i?[`${role}-${i-1}`]:[],
  choices:[
    {id:'careful',label:careful,minutes:workloads[role].minutes[i],effects:{progress:25,quality:workloads[role].quality,trust:workloads[role].trust,energy:-workloads[role].energy},result:'多花一點時間，把明天可能踩的坑先填好。'},
    {id:'quick',label:quick,minutes:15,effects:{progress:25,quality:workloads[role].quickQuality,trust:workloads[role].quickTrust,energy:-9},result:'進度向前了。那些沒有確認的事，也跟著留下來。'}
  ]
}));
export const TASKS = {
  junior:chain('junior',[
    ['讀懂 SA 規格','whiteboard','規格寫著「依照原有邏輯」。你找了三份文件，每份原有邏輯都不同。','找 SA 與同事確認驗收條件','依自己的理解先做'],
    ['把設計稿做成畫面','desk','Figma 裡的畫面很完整，但載入中、錯誤與空白狀態需要你補上。','依契約實作並補齊邊界狀態','先做最順利的那條路'],
    ['讓測試說話','test','功能看起來能動。下一步，是證明它在不順利的時候也能動。','補上邊界與失敗情境測試','只跑一次正常流程'],
    ['回覆程式碼審查','desk','同事留言：「這裡如果是空值呢？」你看著那一行，慢慢放下咖啡。','修正問題並寫下原因','先合併，之後再補']
  ]),
  senior:chain('senior',[
    ['兼任半天 SA','whiteboard','產品說要「即時」，但每個人心中的即時差了五分鐘。','畫出契約與狀態轉換','沿用上次需求的假設'],
    ['接起前後端','desk','兩端都回報完成，接在一起卻成了新的問題。','驗證契約並處理失敗復原','加一個特殊判斷先過關'],
    ['審查，也帶新人','test','新人需要答案，也需要理解為什麼。你自己的工作還沒結束。','一起檢查並補回歸測試','直接重寫對方的程式碼'],
    ['準備可回復的發布','desk','發布不是按下按鈕就結束。監控、回復與交接，都還在清單上。','核對發布與回復清單','相信這次應該沒問題']
  ]),
  manager:chain('manager',[
    ['排出真正的優先級','whiteboard','每個需求都標著最高優先級。團隊只有同一雙手。','對齊價值與可交付範圍','全部答應，之後再想'],
    ['協商這次交付','meeting','客戶說只是多一個欄位。那個欄位牽動四個地方。','提出分階段交付與取捨','把期限寫回原來那一天'],
    ['移開團隊的阻礙','desk','一張權限申請卡了兩天。工程師已經把催辦信寫成模板。','協調窗口並保護專注時間','請大家先自行繞過'],
    ['確認交付證據','test','簡報全是綠燈。你想看看測試結果和真正跑完的流程。','檢查驗收、風險及交接','用完成百分比當驗收']
  ])
};
export const MEETINGS = [
  {id:'standup',title:'Sprint 站會',at:570,minutes:15,body:'昨天做了什麼、今天要做什麼，還有需要誰幫忙。站會不是比誰看起來最忙。'},
  {id:'requirements',title:'需求會議',at:660,minutes:30,body:'把「很簡單的小修改」拆開來看。這次可以釐清驗收條件，也可以把疑問留到開發時。'},
  {id:'training',title:'教育訓練',at:900,minutes:30,body:'今天的主題：如何寫出能保護人的測試。眼前的進度，和之後的效率，都有價值。'}
];
export const EVENTS = [
  ['scope','臨時插單','產品帶來一個「今天一定要」的小需求。原本的工作不會因此消失。','談清楚交換掉哪個範圍','直接塞進今天的清單'],
  ['qa','測試退件','QA 找到一個空值讓整頁停止。這不是挑毛病，是攔下了一次事故。','重現並補上回歸測試','加個預設值，先關單'],
  ['merge','合併衝突','你與同事都動到同一段邏輯。選擇保留自己的版本很快，但未必正確。','一起確認兩邊的意圖','全部採用自己的版本'],
  ['incident','正式環境警報','監控突然亮起。訊息一條接一條，而根因還不明確。','先止血、同步資訊再排查','直接改正式環境碰碰運氣'],
  ['help','同事正在卡關','隔壁的同事已經盯著同一個錯誤半小時。你也有自己的期限。','一起看最小重現範例','丟一個搜尋連結就離開'],
  ['spec','規格的空白處','SA 文件沒有提到取消流程。畫面與 API 正朝兩個方向前進。','補上流程與共同驗收','各自做完再說'],
  ['pipeline','建構管線紅燈','隔離測試通過，整合階段卻失敗了。','檢查相依與環境差異','停用失敗測試'],
  ['access','權限突然失效','測試帳號無法進入需要驗收的環境。','找窗口申請最小權限','先借同事帳號'],
  ['design','設計稿更新','設計師補上空白狀態，舊畫面還沒完成。','確認版本並更新驗收','忽略這次修改'],
  ['slow','回應變慢了','列表頁載入時間從一秒變成五秒。','量測瓶頸並建立基準','先加載入動畫'],
  ['dependency','套件更新通知','共用套件發布修正，但升級會改變介面。','查看差異並跑相容測試','不看變更直接升級'],
  ['keyboard','鍵盤走不出去','QA 只用鍵盤操作，焦點被卡在選單。','修正焦點順序與離開方式','請使用者改用滑鼠'],
  ['restore','備份演練通知','維運想確認昨晚的備份能不能還原。','在隔離環境驗證復原','看到檔案存在就簽名'],
  ['network','公司網路斷線','套件下載與遠端會議一起中斷。','轉做離線文件並回報','一直重按重新整理'],
  ['demo','臨時展示邀請','業務希望立刻展示還沒驗收的功能。','說明限制並用測試資料','直接打開正式資料'],
  ['estimate','估時被打了折','會議紀錄中的三天變成一天。','拆解工作與驗收重新確認','默默接受期限'],
  ['review','第一份審查回覆','審查留言比程式碼還長，你有點不知所措。','整理問題請同事說明原因','全部照改不問原因'],
  ['architecture','架構分歧','兩組團隊想用不同的狀態格式。','寫決策紀錄與遷移路徑','讓各組自行決定'],
  ['capacity','團隊容量不足','同事臨時請假，原定承諾不可能全部完成。','協商減少範圍並保護團隊','把工作平均塞回其他人'],
  ['timezone','日期少了一天','海外測試帳號看見錯誤的訂單日期。','補時區測試並確認契約','畫面手動加一天'],
  ['onboarding','新人找不到環境文件','新人安裝三次都卡在同一個步驟。','一起修正初始化文件','傳一份自己的壓縮檔'],
  ['printer','列印室的小事故','需求討論前，印表機吃掉最後一張流程圖。','改用共享白板核對版本','拿上週的紙本直接開會'],
  ['incident-followup','事故再度響起','剛才的快速修改讓另一條路徑失效。這次需要可回復的處理。','回復版本並補事故紀錄','再疊一個臨時修補'],
  ['scope-followup','承諾的回音','早上的插單沒有移除任何範圍，兩邊都在追進度。','公開風險並重新協商','繼續承諾全部交付']
].map(([id,title,body,careful,quick])=>({id,title,body,choices:[
  {id:'careful',label:careful,minutes:15,effects:{quality:4,trust:6,energy:-7},result:'問題有了主人，也有了下一步。'},
  {id:'quick',label:quick,minutes:15,effects:{quality:-12,trust:-9,energy:-4},result:'現在安靜了，事情卻還沒有真正結束。'}
]}));
for(const event of EVENTS){
  if(event.id==='review')event.roles=['junior'];
  if(event.id==='architecture')event.roles=['senior'];
  if(event.id==='capacity')event.roles=['manager'];
  if(event.id.endsWith('-followup'))event.followupOnly=true;
  if(['incident','scope'].includes(event.id))event.choices[1].followup=`${event.id}-followup`;
  // 延續事件具有不同代價；其餘類別也有各自的資源取捨。
  if(event.followupOnly){event.choices[0].effects={quality:6,trust:3,energy:-10};event.choices[1].effects={quality:-16,trust:-12,energy:-6};}
  else if(['help','onboarding','capacity','estimate'].includes(event.id))event.choices[0].effects={quality:2,trust:9,energy:-7};
  else if(['restore','pipeline','keyboard','timezone','slow'].includes(event.id))event.choices[0].effects={quality:7,trust:3,energy:-7};
}
