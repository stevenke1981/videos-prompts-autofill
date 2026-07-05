# Video Prompts Autofill — 交付摘要

> 狀態：**全部完成**  
> 最後更新：2026-07-05

---

## 1. 專案概述

**videos-prompts-autofill v1.0.0** — 參考 [prompt-autofill](https://github.com/stevenke1981/prompt-autofill) 與 [agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)，專為 AI 影片生成（Seedance 2.0、Kling、Grok Imagine、Runway、Sora 等）設計的結構化提示詞填空器。

---

## 2. 驗證結果

| 檢查項 | 結果 |
|--------|------|
| `npm run build` | ✅ 通過 |
| `npm test`（Vitest） | ✅ 43/43 |
| `npm run test:e2e`（Playwright） | ✅ 4/4 |
| 開發伺服器 | ✅ http://localhost:1420 |

### E2E 覆蓋流程

1. 發現頁 → 選「Seedance 2.0 通用公式」→ 複製 Prompt（含 Subject/主體）
2. 社群 Tab → 搜尋 "cinematic" → 結果可見
3. 詞庫搜尋 `camera_movement`
4. 設定 → 深色模式切換

---

## 3. 影片領域交付物

| 項目 | 數量 | 狀態 |
|------|------|------|
| 內建影片模板 | 15 | ✅ |
| 詞庫組 | 40 | ✅ |
| 分類 | 7（主體/動作/場景/鏡頭/音效/風格/技術） | ✅ |
| Video Specs 區段 | 影片版 | ✅ |
| 社群提示詞 | 35 | ✅ |
| 社群搜尋 UI | CommunitySearchPanel | ✅ |

### 內建模板一覽

- Seedance 2.0 通用公式
- Seedance 多模態參考
- Seedance 影片編輯
- Seedance 對話字幕
- Kling 電影感場景
- Kling 產品廣告
- Kling 動作參考
- Grok Imagine 創意短片
- Runway Gen-3 敘事
- Sora 風格敘事
- 動漫打鬥場景
- 商業廣告 15s
- 風景縮時攝影
- 圖生影片動態化
- 鏡頭運動編排

### 社群來源

- [Seedance 2.0 Prompt Guide](https://seedance2.ai/guide)
- [Kling AI Prompt Guide](https://kling.ai/blog/kling-ai-prompt-guide)
- [awesome-seedance-2-prompts](https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts)
- Runway / Sora / Grok 社群精選

---

## 4. 使用方式

```bash
npm install
npm run dev          # http://localhost:1420
npm run build
npm test             # 43 案例
npm run test:e2e     # 4 smoke 案例
```

---

## 5. 文件索引

- [plan.md](./plan.md)
- [spec.md](./spec.md)
- [test.md](./test.md)
- [todos.md](./todos.md)
- [README.md](./README.md)

---

## 6. 致謝

- [stevenke1981/prompt-autofill](https://github.com/stevenke1981/prompt-autofill)
- [stevenke1981/agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)
- [Seedance 2.0 Prompt Guide](https://seedance2.ai/guide)
- [Kling AI Prompt Guide](https://kling.ai/blog/kling-ai-prompt-guide)