# Video Prompts Autofill

結構化 **AI 影片生成**提示詞填空器 — 參考 [prompt-autofill](https://github.com/stevenke1981/prompt-autofill) 與 [agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)，支援 Seedance 2.0、Kling、Grok Imagine、Runway、Sora 等平台。

## 功能特色

- **模板引擎**：`{{variable}}` 語法、多實例索引、雙語 zh-tw / en
- **影片詞庫**：主體、動作、場景、鏡頭、音效、風格、技術參數
- **平台模板**：15+ 內建模板（Seedance / Kling / Grok / Runway / Sora…）
- **社群搜尋**：30+ 精選社群提示詞，可搜尋、複製、一鍵匯入模板
- **發現頁**：瀑布流模板瀏覽、平台標籤篩選
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
npm run build
npm run test:e2e
```

## 文件

- [plan.md](./plan.md) — 專案計畫
- [spec.md](./spec.md) — 功能規格
- [test.md](./test.md) — 測試計畫
- [todos.md](./todos.md) — 實作進度
- [final.md](./final.md) — 交付摘要

## 致謝

- [stevenke1981/prompt-autofill](https://github.com/stevenke1981/prompt-autofill)
- [stevenke1981/agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)
- [Seedance 2.0 Prompt Guide](https://seedance2.ai/guide)
- [Kling AI Prompt Guide](https://kling.ai/blog/kling-ai-prompt-guide)

## 授權

MIT