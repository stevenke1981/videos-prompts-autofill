# Video Prompts Autofill — 交付摘要

> 狀態：**全部完成**  
> 最後更新：2026-07-12

---

## 1. 專案概述

**videos-prompts-autofill v1.0.0** — 參考 [prompt-autofill](https://github.com/stevenke1981/prompt-autofill) 與 [agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)，專為 AI 影片生成（Seedance 2.0、Kling、Grok Imagine、Runway、Sora 等）設計的結構化提示詞填空器。

---

## 2. 驗證結果

| 檢查項 | 結果 |
|--------|------|
| `npm run build:check` | ✅ 14 個 JS chunks，入口 206,058 bytes，全部低於 500 KiB |
| `npm test`（Vitest） | ✅ 73/73（11 files） |
| `npm run lint`（ESLint） | ✅ 0 error / 0 warning |
| `npm run test:e2e`（Playwright） | ✅ 4/4 |
| 開發伺服器 | ✅ http://localhost:1420 |

### E2E 覆蓋流程

1. 發現頁 → 選「Seedance 2.0 通用公式」→ 複製 Prompt（含 Subject/主體）
2. 原始發現頁搜尋 "cinematic" → 同一瀑布流顯示社群模板 → 選中後進入編輯器
3. 返回編輯器 → 詞庫搜尋 `camera_movement`
4. 設定 → 深色模式切換

---

## 3. 影片領域交付物

| 項目 | 數量 | 狀態 |
|------|------|------|
| 內建影片模板 | 15 | ✅ |
| 詞庫組 | 40 | ✅ |
| 分類 | 7（主體/動作/場景/鏡頭/音效/風格/技術） | ✅ |
| Video Specs 區段 | 影片版 | ✅ |
| 社群提示詞 | 1,000 | ✅ |
| 統一瀑布流 | 內建 + 社群 | ✅ |
| 新生成模板封面 | 15 | ✅ |
| 封面總大小 | 約 1.60 MiB WebP | ✅ |
| 首次卡片渲染 | 24 筆 | ✅ |
| 社群平台動態 chunks | 10 | ✅ |
| 主入口 JavaScript | 206,058 bytes（改善前 874,180） | ✅ |

### 本次 CBM 改善

- 移除獨立社群 Tab 與已無 runtime 使用者的 `CommunitySearchPanel`。
- 新增 `discoveryFeed` 純函式層，統一搜尋、來源、平台與分類篩選。
- 社群資料不預先寫入 LocalStorage，選中後才轉成可編輯模板。
- 修復切換平台時 category 殘留造成的空結果。
- 修復 4 個匯出流程呼叫未定義 `showToastMessage` 的 runtime 錯誤。
- 新增 ESLint 設定並修復 case scope、LocalStorage prototype 與外部連結安全問題。
- 使用 Codex 內建生圖生成 15 張影片主題封面；原始約 35 MB PNG 最佳化為合計 1,674,558 bytes 的 WebP。
- `SYSTEM_DATA_VERSION` 升至 1.1.0；舊 bundled JPG 自動遷移，使用者自訂圖片保留。
- 社群 catalog 依 general、Seedance、Kling、Grok、Runway、Sora、Pika、MiniMax、Luma、Hailuo 分割載入。
- 新增共用 in-flight Promise、成功快取、平台局部錯誤與重試；切換平台會優先載入該平台。
- 新增 `build:check`，每個 production JavaScript chunk 上限為 500 KiB。
- 入口 chunk 從 874,180 降至 206,058 bytes，縮小約 76.5%。
- 補強發現頁可存取性：搜尋框、篩選群組、排序、頁首 icon-only 控制與社群載入狀態皆有 accessible name / live status。
- 新增 `DiscoveryView` accessibility 單元測試，覆蓋平台切換後的分類篩選可辨識性。
- 社群提示詞匯入不再壓成單一語言字串；中英文原始內容會完整保留。
- 1,000 筆社群提示詞匯入時統一補上時長、畫幅、幀率、負向提示與平台建議，並依 10 種平台帶入雙語生成要點。
- 修正 Runway 內建模板與社群提示的繁中內容缺漏，並新增全體內建模板雙語文案與變數一致性測試。
- 英文模式會將既有繁中字串 defaults/selections 映射到對應詞庫英文值；使用者自訂值則維持原樣，避免破壞舊資料。

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
npm run build:check
npm test             # 73 案例
npm run lint
npm run test:e2e     # 4 smoke 案例
```

---

## 5. 文件索引

- [plan.md](./plan.md)
- [spec.md](./spec.md)
- [test.md](./test.md)
- [todos.md](./todos.md)
- [README.md](./README.md)
- [CBM 檢視與改善報告](./docs/cbm-review-2026-07-05.md)
- [統一瀑布流設計](./docs/superpowers/specs/2026-07-05-unified-template-waterfall-design.md)
- [統一瀑布流實作計畫](./docs/superpowers/plans/2026-07-05-unified-template-waterfall.md)
- [平台分割載入設計](./docs/superpowers/specs/2026-07-06-platform-lazy-community-catalog-design.md)
- [平台分割載入實作計畫](./docs/superpowers/plans/2026-07-06-platform-lazy-community-catalog.md)

---

## 6. 已知後續工作

- 無法對應詞庫的自訂繁中字串，在英文模式仍會保留原文；這是刻意的資料保真行為，可由使用者重新選取雙語詞庫值改善。
- `caniuse-lite` 約 7 個月未更新，應於獨立 dependency-maintenance commit 更新。
- `App.jsx` 約 100 KB；建議先抽離匯入匯出與 File System Access service，再逐步恢復嚴格 unused / Hook dependency lint 規則。

---

## 7. 致謝

- [stevenke1981/prompt-autofill](https://github.com/stevenke1981/prompt-autofill)
- [stevenke1981/agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)
- [Seedance 2.0 Prompt Guide](https://seedance2.ai/guide)
- [Kling AI Prompt Guide](https://kling.ai/blog/kling-ai-prompt-guide)
