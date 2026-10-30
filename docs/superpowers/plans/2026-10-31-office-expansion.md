# 辦公室擴建 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans，依序實作並記錄驗證。

**Goal:** 擴大辦公室、讓設施有真實用途，增加事件分支與結局，改善移動和設備動畫。
**Architecture:** 保留原生 ES Modules 與 three.js；純函式處理遊戲規則，場景只負責呈現。設施選擇寫入既有歷史，維持 v1 存檔相容。
**Tech Stack:** HTML、CSS、Vanilla JavaScript、three.js、Node test runner、Playwright。
**Spec:** 使用者 2026-10-31 確認：照建議直接做；維持原視覺，約 2–3 倍面積、24 個事件、12 種結局、平滑動畫。

## Global Constraints
- 靜態 GitHub Pages；不引入大型引擎或後端。保留鍵盤、觸控與無 WebGL 的日誌操作。
- 不接觸憑證。推送前顯示 remote、branch、commit。
- 不承諾未測量的裝置效能；減少動態效果設定必須有效。

## Review Focus
- 新設施路徑不能穿越家具或無法抵達。
- 舊存檔、事件後續與重新整理後的進度必須保持有效。
- 連續操作、暫停與視窗失焦不能留下移動輸入。
- 小螢幕九站點可操作且頁面不橫向溢出。
- 新結局必須可由合法操作到達，不能只測試捏造數值。

### Task 1: 設施、事件與結局
Files: src/content.js、src/game-state.js、src/ui.js、tests/expansion.test.js。
Interfaces: FACILITY_ACTIONS；transition 的 facility/actionId；getEnding 保留舊結局並加入歷史條件。
- [x] 先測試 24 事件、角色條件、後續事件、設施耗時與重複限制，再執行確認失敗。
- [x] 增加四設施、六種結局；維持每天三事件讓原有時程可用。
- [x] npm test 全綠；合法流程與儲存往返驗證。

### Task 2: 辦公室與動畫
Files: src/scene.js、src/motion.js、src/main.js、index.html、styles.css、scripts/build.mjs。
Interfaces: scene.playAction(stationId)、setPaused(value)；motion.dampAngle(current,target,delta)。
- [x] 先測試角度跨 ±π、不同更新率一致性及鏡頭按鈕可操作。
- [x] 地板 22×14（原 13×9），增加接待、機房、休息區、主管室；補齊家具細節。
- [x] 骨架步態、平滑轉身、動作回饋、鏡頭縮放跟隨、減少動態效果。
- [x] npm test 與 npm run test:browser；檢查桌機及手機截圖。

### Task 3: 整合驗證與文件
Files: tests/browser.spec.js、README.md、docs/ART-DIRECTION.md、docs/TEST-PLAN.md、docs/IMPLEMENTATION-LOG.md。
- [x] 驗證設施、九站點、縮放、暫停、WebGL 降級、完整工作日。
- [x] build 後以子目錄部署路徑測試；記錄瀏覽器動畫測量與限制。
- [x] 更新文件與截圖；獨立程式碼審查，修正重要問題並重跑測試。

### Task 4: 發布
- [ ] 提交、合併 main；顯示推送資訊後 push。
- [ ] 確認 GitHub Actions 成功，正式網站瀏覽器驗證。

## 決策與進度
- 已獲直接實作與發布授權，省略重複確認。
- 保留每日三次事件，以 24 張事件池和條件後續提高重玩差異；避免事件佔滿工作時間。
- 新玩法從既有 history 推導，不增加存檔必要欄位，舊版存檔仍可繼續。
