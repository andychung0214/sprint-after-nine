# 九點以後｜Sprint After Nine

一間辦公室。很多種選擇。

扮演 Junior、Senior 或管理階層，在 09:00–18:00 之間完成開發、會議、協作與突發事件。每次決定都在交付進度、程式碼品質、團隊信任與精力之間留下痕跡。

## 特色

- 原創低多邊形 3D 辦公室與紙本工作日誌，three.js 繪製，無大型遊戲引擎。
- 三職級四步工作鏈，前端／後端／全端情境分支。
- 固定站會、需求會議與教育訓練；六種事件池，每局三種不重複事件。
- 行動推進時間，閱讀、走路與暫停不耗時；六種結局與選擇紀錄。
- 自動儲存、續玩、鍵盤及觸控操作；WebGL 失效仍可透過站點清單遊玩。

一局設計目標約 10–15 分鐘，實際時間依閱讀速度而異。本作呈現虛構職場情境，不是工作能力評量。

## 操作

1. 選擇職級與開發方向，按「打卡，開始今天」。
2. 選擇下方有紅點的站點，閱讀任務並確認時間與影響。
3. 也可用 WASD／方向鍵移動，靠近站點按 E，或點擊場景編號讓人物前往。
4. 手機可用方向按鈕及站點清單。Esc 關閉對話、返回清單或暫停。
5. 會議到點會要求參加或略過；跨過會議時間的行動會先確認。
6. 到茶水間休息，12:00 後可午休一次。18:00、精力歸零或提前下班時結算。

聲音預設關閉，可手動開啟。存檔只留在目前瀏覽器，不會跨裝置同步。

## 安裝與執行

需要 Node.js 20.19 以上與 npm；發布後遊戲不需要 Node.js 或後端。

```sh
npm ci
npm run dev
```

開啟 http://127.0.0.1:4173/ 。使用原生 ES Modules，請透過 HTTP 開啟；不支援直接雙擊 `index.html` 的 file:// 方式。

```sh
npm run build
node scripts/serve.mjs --dist
```

`dist/` 是可託管的完整靜態網站，包含 three.js 與授權，不依賴線上 CDN。也可開啟 http://127.0.0.1:4173/sprint-after-nine/ 驗證專案子路徑。

## 專案結構

```text
index.html / styles.css    版面與美術
src/content.js            角色、任務、事件及站點
src/game-state.js         純遊戲規則與結局
src/storage.js            版本化存檔
src/ui.js / main.js        介面及應用協調
src/scene.js / movement.js 3D 辦公室與移動
src/audio.js              Web Audio 音效
scripts/                  測試、靜態服務及建構
tests/                    單元與瀏覽器測試
docs/                     設計、計畫、美術、測試紀錄
```

## 測試

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

單元測試使用 Node.js 內建執行器。Playwright 驗證三角色完整工作日、介面與尺寸，截圖在忽略的 `test-results/`。實際證據與未驗證項目見 [測試計畫](docs/TEST-PLAN.md)。

## GitHub Pages

遠端：https://github.com/andychung0214/sprint-after-nine

1. 在儲存庫 Settings → Pages → Build and deployment 選 GitHub Actions。
2. 將已測試的程式碼推送 main；`.github/workflows/pages.yml` 安裝固定依賴、測試、建構及部署。
3. 工作流程成功後，以 GitHub 回報的 Pages URL 開啟並驗證。

預定網址：https://andychung0214.github.io/sprint-after-nine/ 。是否已上線以工作流程與公開網址實測為準，不以此文字推定。

## 已知限制與授權

- 首版為一個工作日，沒有自由輸入程式碼、多人、帳號或真實 Figma／GitHub 工作資料串接。
- 行動裝置尺寸有模擬驗證，實機與不同 GPU 表現須依測試紀錄判讀。
- Blender 可用於後續製作模型；首版採 three.js 原創幾何，不含 .blend。Unreal Engine 與「不得使用大型遊戲引擎」衝突，未使用。
- 低階裝置或 WebGL 不可用時，使用 HTML 站點清單；音效與 3D 不是完成遊戲的必要條件。
- 自有內容採 [MIT](LICENSE)，第三方依 [授權清單](THIRD-PARTY-NOTICES.md)。

其他文件：[實作計畫](docs/PLAN.md)、[美術方向](docs/ART-DIRECTION.md)、[貢獻方式](CONTRIBUTING.md)。
