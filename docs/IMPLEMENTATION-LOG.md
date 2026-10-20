# 執行紀錄 — plan: docs/PLAN.md

## 執行前

- 規格與計畫已由使用者確認；最後要求為「開始實作」。
- Task 1 → 2/3：GameState、transition、內容常數相同；Task 2 → 3：儲存結果一致；Task 3 → 4：場景只呼叫 onStation；Task 5 包裝前四項，無介面衝突。
- Ruling: 在使用者指定且本次新建的獨立專案及 feature/initial-game 分支原地工作，不再建立第二份工作目錄 — 無既有產品程式碼需要隔離，保留交付位置 — 代價為未提供額外 worktree 複本。
- Ruling: 以本文件記錄任務與測試，取代技能的 shell 專用 ledger 腳本 — 本機為 PowerShell，保留等價證據與提交 — 代價為無技能腳本自動彙整。
- 已確認 Node.js v20.19.0、npm 9.7.2，origin 為使用者提供的儲存庫。

## Task 1
- RED: 核心與內容模組不存在，2 個測試檔失敗。
- GREEN: node --test tests/game-state.test.js tests/content.test.js，10/10 通過，含三角色完整工作日。

## Task 2
- RED: storage 模組缺失。GREEN: 13/13 存檔測試通過；含 pendingEvent、非法資料、拒絕儲存與容量例外。

## Task 3
- RED: 空頁缺少角色按鈕，瀏覽器流程失敗。GREEN: 8/8 Chromium 流程通過，含三職級 18:00 結算及四尺寸。
- Ruling: 先安裝固定版本 three.js 與 Playwright，場景於 Task 4 實作 — 依賴安裝合併減少等待 — 無產品行為影響。

## Task 4
- RED: 移動模組與 3D canvas 缺失。GREEN: 移動測試、WebGL context loss 及鍵盤移動／失焦測試通過。
- 發現教學關閉後焦點落到 body，新增瀏覽器失敗測試後改回工作日誌，RED→GREEN。
- 檢視 1440 與 390 截圖，修正手機指標換行。場景改為狀態變動時繪製，降低閒置 GPU 負擔。
- Ruling: Node 20 Windows 不展開測試 glob，改用 scripts/test.mjs 列舉檔案 — 保留 npm test 介面 — 代價為新增一個小型啟動腳本。
