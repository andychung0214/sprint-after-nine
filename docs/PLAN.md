# Sprint After Nine｜九點以後 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 完成可在 GitHub Pages 遊玩的三職級 3D 辦公室工作日遊戲。

**Architecture:** 原生 ES Modules 將純遊戲規則、內容、DOM 介面、three.js 場景及儲存分離。所有操作送進同一個狀態轉移函式，場景只負責呈現及提出互動請求。靜態建構產物包含繪圖函式庫，不需要線上後端。

**Tech Stack:** HTML、CSS、Vanilla JavaScript、three.js、Web Audio、localStorage；Node.js 內建測試執行器及 Playwright 作為開發驗證工具。

**Spec:** [已確認設計規格](superpowers/specs/2026-10-21-sprint-after-nine-design.md)

## Global Constraints

- 模擬 09:00–18:00；確認行動消耗 15、30 或 45 分鐘，閱讀及移動不消耗時間。
- 起始值：進度 0、品質 65、信任 60、精力 85；四個指標限制在 0–100。
- 固定會議：09:30 站會 15 分鐘、11:00 需求會議 30 分鐘、15:00 教育訓練 30 分鐘。
- 三種職級各至少四項依賴任務；前端／後端／全端提供內容分支。
- 至少六種事件，每局安排三次不重複事件；提前下班可不經歷全部事件。
- 桌機及觸控操作；觸控目標至少 44 × 44 CSS 像素；WebGL 失敗仍可完成遊戲。
- 驗證尺寸：390 × 844、768 × 1024、1440 × 900，另測 844 × 390 橫向。
- 不使用 React、Angular、Vue、TypeScript、後端或大型遊戲引擎。
- Blender 為選用資產製作工具；首版以原創幾何模型呈現，不宣稱有未驗證的 Blender 或 Unreal 產物。
- 臺灣繁體中文文案及 Conventional Commits 中文描述；不讀取、輸出或提交機密。
- 遠端為 https://github.com/andychung0214/sprint-after-nine.git；推送前顯示 remote、branch、commit。

## Review Focus

1. 舊面板事件或快速雙擊：只能提交一次，不得重複扣時間。Task 1 revision 測試及 Task 3 瀏覽器連點測試。
2. 存檔語法合法但狀態不可能：拒絕非法角色、重複事件、錯誤任務依賴與非有限數值。Task 2 資料驗證測試。
3. 持續按鍵時失焦、開啟面板或旋轉畫面：停止移動、不誤觸遊戲。Task 4 瀏覽器測試。
4. 最後一個行動同時跨事件門檻並觸發下班：結算優先，不留下不可處理的事件。Task 1 終止邊界測試。
5. 專案子路徑、WebGL 初始化或 context lost 失敗：資產相對載入，替代操作仍可完成遊戲。Task 4 與 Task 5 驗證。

## 範圍、架構與檔案

首版包含選角、教學、探索、工作鏈、排程會議、事件、休息、結算、存檔及靜態部署。不含帳號、多人、真實工作工具連線、金流或九套獨立劇情。

| 檔案 | 責任 |
|---|---|
| index.html、styles.css | 語意化頁面、紙本工作日誌視覺、響應式排版 |
| src/content.js | 角色、任務、事件、站點與排程資料 |
| src/game-state.js | 純狀態轉移、亂數排程與結局 |
| src/storage.js | 存檔驗證、序列化與錯誤處理 |
| src/ui.js、src/main.js | DOM 呈現、焦點與應用協調 |
| src/scene.js、src/movement.js | three.js 場景及可測試的移動邏輯 |
| src/audio.js | 預設關閉的音效 |
| scripts/serve.mjs、scripts/build.mjs | 本機靜態服務與白名單發布檔案複製 |
| tests/*.test.js、tests/browser.spec.js | 邏輯測試與瀏覽器驗證 |
| package.json、package-lock.json、playwright.config.js | 固定依賴及可重現指令 |
| docs/ART-DIRECTION.md、docs/TEST-PLAN.md | 美術規範及測試證據 |
| README.md、LICENSE、THIRD-PARTY-NOTICES.md、CONTRIBUTING.md | 使用、來源、授權及貢獻方式 |
| .github/workflows/pages.yml | GitHub Pages 發布工作流程 |

執行方式沿用使用者指定的 executing-plans：由目前助理逐項實作，最後進行獨立程式碼審查。計畫審閱後連續執行，不逐里程碑重新要求許可；每個里程碑回報實際證據。

## 共用資料契約

純 JavaScript 物件，不引入 TypeScript：

- `GameState`：`version: 1`、`revision`、`role`、`track`、`minute`、`stats`、`completedTasks`、`meetings`、`eventDeck`、`eventIndex`、`pendingEvent`、`lunchTaken`、`seed`、`status`、`history`。
- `stats`：`progress`、`quality`、`trust`、`energy`。
- `role`：`junior | senior | manager`；`track`：`frontend | backend | fullstack`。
- `status`：`playing | ended`；暫停為應用層狀態，阻止送出指令，重載後不自動推進時間。
- `Command`：`type`、相關 `actionId/choiceId/meetingId`、`expectedRevision`；跨會議確認另含明確 `skipMeetingIds`。
- `TransitionResult`：`{ state, accepted, reason, conflicts }`，拒絕時保留原始狀態；不直接修改傳入物件。
- `Action`：`id`、`stationId`、`minutes`、`requires`、`choices`；選項包含文案與數值效果。
- `history` 記錄完成時間、行動識別碼、選項及指標差值，支援結算解釋。

## Task 1: 可測試的工作日核心與完整任務資料

**Files:** 建立 `package.json`、`src/content.js`、`src/game-state.js`、`tests/game-state.test.js`、`tests/content.test.js`。

**Interfaces:**
- 產出 `createGame({role, track, seed}) -> GameState`。
- 產出 `getAvailableActions(state, stationId) -> Action[]`。
- 產出 `transition(state, command) -> TransitionResult`、`getEnding(state) -> {id, title, summary}`。
- 產出 `ROLES`、`TRACKS`、`STATIONS`、`TASKS`、`EVENTS`、`MEETINGS` 內容常數供 UI 共用。

- [x] 寫核心失敗測試：起始時間 540、指標 `{progress:0, quality:65, trust:60, energy:85}`；資源上下限；18:00 後不可開新行動；相同 revision 再提交遭拒；原狀態不變。
- [x] 執行 `node --test tests/game-state.test.js`，預期因尚未建立核心模組而失敗，保存失敗原因。
- [x] 建立純狀態核心，指令包含 task、rest、lunch、meeting、event、finish；午休 720 分鐘後一次性提供，休息不增加進度。
- [x] 補上會議測試：09:15 開始 30 分鐘行動回傳衝突且不改狀態；09:30 阻止一般工作直到處理站會；略過確認只扣分一次；參加消耗規格時長。
- [x] 實作排程與六種互斥結局，按規格順序判定，精力歸零優先。
- [x] 寫事件與內容測試：相同 seed 的事件順序一致，六選三不重複；事件在行動結束後出現；結算後不再開啟事件。
- [x] 建立三職級四步工作鏈、三方向文案與六事件；固定事件門檻為 10:30、13:30、16:30，於首次越過門檻的行動結束後排入。pendingEvent 未回覆前阻止普通工作；若會議同時到點先處理會議，再回覆事件。
- [x] 為每個角色寫一條可達「穩定交付」的固定種子路徑，驗證最終進度 ≥80、品質 ≥65、信任 ≥50、精力 >0 且時間 ≤1080；不直接修改測試中的遊戲狀態跳過工作。
- [x] 執行 `node --test tests/game-state.test.js tests/content.test.js`，預期全部通過；提交 `feat: 建立工作日規則與角色任務`。

## Task 2: 可靠存檔與復原

**Files:** 建立 `src/storage.js`、`tests/storage.test.js`。

**Interfaces:**
- 使用 Task 1 的 `GameState` 與內容識別碼。
- 產出 `validateSave(value) -> boolean`、`loadGame(storage) -> {state, warning}`、`saveGame(storage, state) -> {ok, warning}`、`clearGame(storage) -> {ok, warning}`；storage 由呼叫者注入。

- [x] 寫失敗測試：有效狀態含 pendingEvent 完整往返；非法 JSON、錯誤版本、非有限數值、未知角色、重複事件、違反依賴的 completedTasks 均拒絕。
- [x] 執行 `node --test tests/storage.test.js`，預期模組缺失失敗。
- [x] 實作版本化存檔及合法狀態檢查，固定儲存鍵 `sprint-after-nine:v1`；儲存例外回傳提示，不向呼叫者拋出。
- [x] 測試 getItem/setItem/removeItem 拋錯及容量不足，確認記憶體中的 GameState 不被改動；讀取失敗不自動覆寫原資料。
- [x] 執行 `node --test tests/storage.test.js`，預期全部通過；提交 `feat: 加入存檔驗證與異常復原`。

## Task 3: 可完整遊玩的 HTML 介面

**Files:** 建立 `index.html`、`styles.css`、`src/ui.js`、`src/main.js`、`scripts/serve.mjs`、`playwright.config.js`、`tests/browser.spec.js`、`docs/ART-DIRECTION.md`；更新套件指令與鎖定檔。

**Interfaces:**
- 使用 Task 1、2 的狀態及儲存介面。
- `mountUI(root, {onCommand,onStation,onNewGame,onResume,onPause,onSound}) -> {render(state, uiState), announce(text), destroy()}`。
- `main.js` 持有唯一遊戲狀態；以 `expectedRevision` 提交，accepted 後保存，再重繪。
- `uiState` 包含 `paused`、`activeStation`、`soundEnabled`、`storageWarning`、`sceneWarning`；暫停時不轉送工作指令。

- [x] 寫瀏覽器失敗測試：首頁選角進入遊戲、透過站點清單完成四步任務、看到可解釋的結算。安裝固定版本開發依賴後執行 `npx playwright test`，預期因介面未實作失敗。
- [x] 建立靜態伺服器及頁面：首頁、教學、工作日 HUD、站點、任務選項、會議衝突、事件、暫停與結算；所有選項提交前顯示時間與效果。
- [x] 套用美術規格：暖白 #F2EDE3、墨色 #25332D、森林綠 #385747、木色 #B98C62、磚紅 #AD5142；系統繁體字體、紙張邊線與印章；記錄文字對比檢查。
- [x] 加入鍵盤焦點回復、aria-live、原生按鈕與對話框、減少動態效果、44 像素觸控目標；手機面板以自然捲動避免遮擋操作。
- [x] 加入續玩、重新開始確認、提前下班、暫停與儲存失敗提示；重新開始清除舊局 UI 狀態，不清除其他網站資料。
- [x] 擴充瀏覽器測試：三角色、三方向、連點、Esc、Tab 焦點、重載 pendingEvent、暫停阻止操作；未完成結局不可宣稱驗證成功。
- [x] 執行 `npm test` 及 `npx playwright test`，預期全部通過；檢視四個指定尺寸截圖，記錄實際測試結果；提交 `feat: 建立可操作的工作日介面`。

## Task 4: 3D 辦公室、移動與音效

**Files:** 建立 `src/scene.js`、`src/movement.js`、`src/audio.js`、`tests/movement.test.js`；修改 `src/main.js`、`styles.css`、`tests/browser.spec.js`、美術文件及套件依賴。

**Interfaces:**
- `createScene(container, {onStation,onUnavailable,reducedMotion}) -> {setInputEnabled(boolean), resize(), dispose()}`。
- `stepMovement(position, input, delta, bounds, obstacles) -> position` 為純函式。
- `createAudio() -> {setEnabled(boolean), play(cue), dispose()}`；聲音啟用必須源自使用者操作。
- 場景使用 Task 1 的 STATIONS；點選或靠近按 E 只送出站點識別碼，不改變 GameState。

- [x] 寫移動失敗測試：相同時間下斜向與直向速度一致、不能穿牆、delta 上限避免失焦後跳躍、停用輸入位置不變。
- [x] 執行 `node --test tests/movement.test.js`，預期模組缺失失敗。
- [x] 安裝並鎖定 three.js；以幾何模型建立桌椅、螢幕、白板、植物、人物及五站點，固定等角鏡頭，像素比例上限 1.5。
- [x] 實作 WASD、方向鍵、E、點站點前往與觸控方向按鈕；對話／暫停／失焦清空輸入；相機尺寸跟隨容器。
- [x] 補瀏覽器測試：移動後互動、開啟面板停止移動、失焦／旋轉、WebGL 初始化失敗及 context lost。預期顯示降級提示且站點清單仍能結算。
- [x] 實作預設關閉的短音效，Web Audio 不可用時靜音繼續；不依賴遠端音效檔案。
- [x] 執行 `npm test` 與 `npx playwright test`；實際檢視 3D 截圖、觸控與主控台，預期無未處理錯誤；提交 `feat: 加入立體辦公室與多裝置操作`。

## Task 5: 文件、發布產物、審查與 GitHub Pages

**Files:** 建立 `scripts/build.mjs`、`tests/build.test.js`、`README.md`、`LICENSE`、`THIRD-PARTY-NOTICES.md`、`CONTRIBUTING.md`、`docs/TEST-PLAN.md`、`.github/workflows/pages.yml`；更新 `.gitignore`、套件指令、測試與本計畫進度。

**Interfaces:**
- `npm test` 執行內建測試；`npm run dev` 啟動靜態開發服務；`npm run build` 產生 dist；`npm run test:browser` 執行 Playwright。
- build 只複製 index.html、styles.css、src 與所需 three.js ES 模組及授權到 dist；three.js 模組以相對路徑載入。
- Pages workflow 使用 repository 的既有認證機制；不讀取或輸出憑證。執行時核對官方 Pages 文件選定受支援的 Actions 版本。

- [x] 寫建構失敗測試：產物入口與模組齊全；沒有 node_modules、.git、測試檔或機密；以 `/sprint-after-nine/` 子路徑服務可載入。
- [x] 執行 `node --test tests/build.test.js`，預期因未建立建構腳本而失敗。
- [x] 實作白名單建構與 Pages 工作流程；預定由 main 發布及支援手動觸發，只有測試及建構通過才部署。
- [x] 完成全部必要文件；MIT 只涵蓋自有內容，保留 three.js 授權；記錄未使用 Blender 與 Unreal 的界線，以及雙擊 file:// 不屬於支援啟動方式。
- [x] 執行 `npm test`、`npm run build`、`npm run test:browser` 與子路徑測試；記錄命令、結果、截圖、日期、瀏覽器及未驗證項目，不把尺寸模擬寫成實機驗證。
- [x] 依 requesting-code-review 進行全分支獨立審查，修正重要問題並加入重現測試，重新執行相關測試及完整套件。
- [x] 依 finishing-a-development-branch 完成提交。重新檢查遠端 refs；若遠端有新內容先整合，不使用 force push。
- [x] 確認 main 發布分支後，在執行 git push 前顯示 origin URL、實際 branch／refspec 與完整 commit SHA；依使用者已給授權推送。
- [x] 透過可用 GitHub 工具啟用 Pages 的 Actions 發布來源並觸發部署；等待結果，開啟公開網址檢查 HTTP、資產及一條完整遊戲流程。
- [x] 若權限不足或部署失敗，保留已完成成果，回報精確阻礙；不得將預定網址當成已上線成果。

## 驗收與風險

完成條件：必要文件齊全、三職級能完成工作日、規則測試通過、瀏覽器操作及降級流程驗證、Git 推送成功、Pages 公開網址實測通過。各項依證據獨立記錄。

主要風險：三職級內容量以共用系統限制；會議衝突用確認與一次性紀錄處理；效能以簡化幾何及像素比例控制；存檔不可信以嚴格驗證處理；發布權限於實際 API 回應確認。

## 計畫自查

- 規格第 1–5 節：Task 1；第 6 節：Task 3–4；第 7 節：Task 3–4。
- 規格第 8–9 節：Task 1–4；第 10–12 節：Task 5 與全程證據紀錄。
- 五項 Review Focus 均已指定測試；模組函式名稱及資料欄位保持一致。
- Task 1–5 已完成；獨立審查重要問題已修正，GitHub Pages 部署及公開網址驗證通過。
