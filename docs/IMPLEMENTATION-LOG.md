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

## Task 5（發布前）
- 建構 RED: build.mjs 尚未建立。GREEN: 26/26 單元測試、13/13 瀏覽器測試、dist 子路徑 2/2 測試通過。
- 已保存桌機與手機截圖；重要文字對比介於 5.04:1 至 11.32:1。
- Pages workflow 依官方文件使用 configure-pages v5、upload-pages-artifact v4、deploy-pages v4。
- 尚未推送，下一步獨立審查與發布。

## 獨立審查修正

- 獨立審查者檢查 bc5c72d..db32d96；沒有 Critical，四項 Important 已重現並修正。
- Final: fixed 事件存檔時序 — skipped future events / premature event RED→GREEN。
- Final: fixed 職級數值完全相同 — role tradeoffs RED→GREEN；Senior 加入 45 分鐘整合及較高精力負荷，Manager 著重信任取捨。
- Final: fixed 過勞不可達 — legal burnout RED→GREEN，保留三職級穩定交付路徑。
- Final: fixed resize 後重複 keydown 恢復移動 — resize clears held keys RED→GREEN。
- Final: Ruling: 站點 Esc 焦點遺失由 Minor 升為 Important 並修正 — 規格明訂焦點回復，鍵盤玩家會失去操作位置 — 代價為新增焦點管理；closing a station RED→GREEN。
- 計畫核取方塊隨交付更新，無延後的程式碼審查 Minor。
- Final: Ruling: 真實手機、Safari／Firefox、不同 GPU 與螢幕閱讀器維持未驗證標記 — 本機無對應實機環境 — 代價為這些環境仍有相容性不確定性。
- Final: Ruling: 10–15 分鐘視為設計目標，不當成真人實測結果 — 自動操作速度不代表閱讀速度 — 代價為實際節奏仍需玩家回饋。
- 公開 Pages 結果由發布階段繼續驗證，不將其列為免驗證項目。
- 最終本機完整套件：npm test 30/30、npm run test:browser 15/15 通過；npm test 亦執行發布產物建構。

## 發布完成

- 依使用者明確要求直接推送 main 並部署；推送前已顯示 origin、分支與 d02468933b10f824960eedc27a1aa0097ecbc601。
- GitHub Pages Source 已設為 GitHub Actions；執行 39517878994 的 build / deploy 均 success。
- 公開網址 HTTP 200；公開版三項瀏覽器驗證通過，包括 Junior 全工作日、場景失效降級、觸控操作。
- 截圖 docs/images/live.png 取自公開網址；使用者 Chrome 分頁已開啟。
- 無延後的程式碼審查 Minor。實機跨瀏覽器及真人遊玩時間仍依測試文件標記為未驗證。

## 2026-10-31 辦公室擴建

- 使用者明確授權依建議直接實作，保留 Vanilla JavaScript、three.js 與原紙本日誌風格。
- 計畫：superpowers/plans/2026-10-31-office-expansion.md；於 feature/office-expansion 實作。
- Task 1: 9 設施、24 事件、12 結局；5 項新增規則測試 RED→GREEN，完整單元套件 35/35。
- 決策：每天維持 3 次事件，避免擠壓工作時程；6 項設施工作每天各一次。新分支從 history 推導，v1 存檔不需遷移。
- Task 2: 22×14 場景、鏡頭、骨架步態、設備動畫與工作手勢。轉身測試 RED→GREEN，設施與鏡頭瀏覽器測試通過。
- 效能：初次軟體繪圖取樣 RAF 中位數 116.6ms / p95 133.4ms；經 Lambert、靜態幾何批次與自適應解析度後 33.3ms / 50ms。取樣可能受同時測試負載影響，不能視為一般 GPU 或所有手機 FPS。
- 第一次完整瀏覽器套件 15/16；Senior 因繪圖負載超過 60 秒。優化後重跑，不將失敗當成通過。
- 獨立審查：無 Critical，1 Important 桌後通道尋路死角；重現 RED 後將格網由 0.4 改為 0.2 並限制邊界座標，加入回歸測試。38/38 單元通過。
- 審查另指出動態陰影凍結；在收到最終報告前已自行辨識並停用玩家靜態陰影投射，使用腳底圓環。無延後審查項目。
- 九站點實際瀏覽器點標牌繞路驗證通過；修正桌後格網後再執行全套確認。

- 最終完整瀏覽器回歸 17/17 通過。建構產物的子路徑測試另發現鏡頭按鈕早於場景載入的競爭條件；實際失敗為預期 zoom 1.25、收到 1.00。加入初始化 disabled 與延遲載入測試後，子路徑鏡頭／設施／降級／觸控 4/4 通過，九標牌路徑亦於子路徑通過。
- 最終單元／建構 38/38；git diff --check 無格式錯誤。
