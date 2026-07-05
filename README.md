# Video Prompts Autofill

結構化 **AI 影片生成**提示詞填空器 — 參考 [prompt-autofill](https://github.com/stevenke1981/prompt-autofill) 與 [agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)，支援 Seedance 2.0、Kling、Grok Imagine、Runway、Sora 等平台。

## 功能特色

- **模板引擎**：`{{variable}}` 語法、多實例索引、雙語 zh-tw / en
- **影片詞庫**：主體、動作、場景、鏡頭、音效、風格、技術參數
- **平台模板**：15+ 內建模板（Seedance / Kling / Grok / Runway / Sora…）
- **統一瀑布流**：15 個內建模板與 1,000 筆社群提示詞共用搜尋、來源、平台與分類篩選
- **平台分割載入**：社群資料依 10 個平台動態載入；內建模板先顯示，失敗平台可單獨重試
- **按需匯入**：社群模板選中後才加入本機編輯資料，不污染 LocalStorage
- **專屬生成封面**：15 張 Codex 內建生圖製作、WebP 最佳化的影片題材封面
- **Video Specs**：時長、畫幅、FPS、負向提示標準區段
- **本機優先**：LocalStorage + IndexedDB，無需登入

## 快速開始

```bash
npm install
npm run dev
```

開啟 [http://localhost:1420](http://localhost:1420)

Windows 可雙擊 `start.bat` 一鍵啟動。

## 測試

```bash
npm test
npm run lint
npm run build:check
npm run test:e2e
```

`build:check` 會在建置後檢查每個 JavaScript chunk 不得超過 500 KiB。

## 文件

- [plan.md](./plan.md) — 專案計畫
- [spec.md](./spec.md) — 功能規格
- [test.md](./test.md) — 測試計畫
- [todos.md](./todos.md) — 實作進度
- [final.md](./final.md) — 交付摘要
- [docs/cbm-review-2026-07-05.md](./docs/cbm-review-2026-07-05.md) — CBM 檢視與改善報告

## 致謝

- [stevenke1981/prompt-autofill](https://github.com/stevenke1981/prompt-autofill)
- [stevenke1981/agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)
- [Seedance 2.0 Prompt Guide](https://seedance2.ai/guide)
- [Kling AI Prompt Guide](https://kling.ai/blog/kling-ai-prompt-guide)

## 授權

MIT
