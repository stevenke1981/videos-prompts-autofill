# Video Prompts Autofill — 專案計畫

> 參考來源：[stevenke1981/prompt-autofill](https://github.com/stevenke1981/prompt-autofill)、[stevenke1981/agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)  
> 目標：打造專為 **AI 影片生成**（Seedance 2.0、Grok Imagine、Kling、Runway、Sora 等）設計的結構化提示詞填空器，並支援社群提示詞搜尋。

---

## 1. 專案背景

`prompt-autofill` 面向 AI 繪圖，`agent-prompt-fill` 面向 Agentic 工作流。本專案 **videos-prompts-autofill** 沿用其核心架構（`{{variable}}` 模板引擎、詞庫、發現頁、本機持久化），但將領域轉向 **AI 影片生成**：

- **平台適配**：Seedance 2.0、Kling 3、Grok Imagine、Runway Gen-3、Sora、Pika 等
- **影片語法**：主體 + 動作 + 場景 + 鏡頭 + 音效 + 技術參數
- **多模態參考**：Image 1/2、Video 1 參考語法（Seedance 2.0 官方指南）
- **社群發現**：內建社群精選提示詞庫，可即時搜尋、一鍵匯入模板

使用者透過可視化填空快速組裝可複製至各影片生成平台的完整 Prompt。

---

## 2. 目標與非目標

### 2.1 目標（Must Have）

| 編號 | 目標 | 驗收標準 |
|------|------|----------|
| G1 | 影片模板引擎 | 支援 `{{var}}`、多實例索引、雙語 zh-tw/en |
| G2 | 影片詞庫 | 主體、動作、場景、鏡頭、音效、風格、技術參數等分類 |
| G3 | 平台模板 | ≥15 內建模板，涵蓋 Seedance / Kling / Grok Imagine 等 |
| G4 | 發現頁 | 瀑布流瀏覽、平台/風格標籤篩選、搜尋 |
| G5 | 社群搜尋 | 內建 ≥30 條社群精選提示詞，可搜尋、複製、匯入為新模板 |
| G6 | 匯出分享 | 複製純文字、長圖匯出、JSON 備份匯入 |
| G7 | 資料持久化 | LocalStorage + IndexedDB |
| G8 | 影片規格區段 | 內建 Video Specs（時長、畫幅、FPS、負向提示） |
| G9 | 行動端 | 響應式、MobileTabBar |
| G10 | 測試交付 | Vitest + Playwright 全綠 |

### 2.2 非目標（Phase 1）

- 直接呼叫影片生成 API
- 即時爬取外部網站（改以內建社群索引 + 外部連結導覽）
- 雲端帳號與協作
- TypeScript 全量遷移

---

## 3. 技術架構

```
videos-prompts-autofill/
├── public/                    # 靜態資源、template-covers、version.json
├── src/
│   ├── App.jsx
│   ├── components/          # 含 CommunitySearchPanel（新增）
│   ├── constants/             # translations、deliverables（Video Specs 版）
│   ├── data/
│   │   ├── templates.js       # 影片平台模板
│   │   ├── banks.js           # 影片詞庫
│   │   └── communityPrompts.js # 社群精選（新增）
│   ├── services/
│   │   ├── storage.js
│   │   └── communitySearch.js # 社群搜尋（新增）
│   ├── utils/
│   └── __tests__/
├── e2e/
├── plan.md spec.md todos.md test.md final.md
└── vite.config.js
```

### 技術棧

| 層級 | 選型 |
|------|------|
| 建置 | Vite 5 |
| UI | React 18 + Tailwind 3 |
| 測試 | Vitest + Playwright |
| 儲存 | LocalStorage + IndexedDB |

---

## 4. 相對 agent-prompt-fill 的差異化

| 編號 | 項目 | 說明 |
|------|------|------|
| V1 | 領域詞庫 | Agent 角色/工具 → 主體/動作/鏡頭/音效/技術參數 |
| V2 | 內建模板 | Agent 工作流 → Seedance/Kling/Grok 等平台模板 |
| V3 | 分類體系 | 角色/流程 → 主體/動作/場景/鏡頭/音效/風格/技術 |
| V4 | Video Specs | Deliverables → 時長、畫幅、FPS、負向提示 |
| V5 | 社群搜尋 | 新增 communityPrompts + CommunitySearchPanel |
| V6 | 標籤 | coding/review → seedance/kling/grok/cinematic/product 等 |
| V7 | 外部資源 | 社群卡片附來源連結（GitHub、官方指南） |

---

## 5. 實作階段

### Phase 0 — 文件（本輪）
- [x] plan.md、spec.md、todos.md、test.md、final.md

### Phase 1 — 骨架與種子資料
- [x] 從 agent-prompt-fill 複製源碼
- [x] 替換 templates.js、banks.js、deliverables.js
- [x] 新增 communityPrompts.js、communitySearch.js
- [x] 更新翻譯、品牌、storage DB 名稱

### Phase 2 — 社群搜尋 UI
- [x] CommunitySearchPanel 元件（後續由統一發現瀑布流取代）
- [x] 發現頁整合「模板 / 社群」切換（後續整合為單一瀑布流）
- [x] 一鍵匯入社群提示詞為新模板

### Phase 3 — 測試交付
- [x] npm test、npm run build、npm run test:e2e
- [x] 更新 final.md、驗收勾選

> Phase 4–7 已在 `todos.md` 追蹤統一瀑布流、平台分割載入、無障礙與提示詞完整化；本文件的早期階段勾選狀態已同步為目前主線結果。

---

## 6. 風險與緩解

| 風險 | 緩解 |
|------|------|
| 各平台 Prompt 語法差異大 | 以平台專用模板 + 通用基礎模板並存 |
| 社群資料需持續更新 | `COMMUNITY_DATA_VERSION` + 可擴充 JSON 結構 |
| 封面圖數量不足 | 複用漸層封面 + 映射既有 JPEG |

---

## 7. 成功指標

1. `npm run dev` 可完成「選 Seedance 模板 → 填空 → 複製」全流程
2. 社群搜尋可找到 Kling/Seedance 相關提示詞並匯入
3. `npm run build` 零錯誤
4. `npm test` 全綠（≥30 案例）
5. E2E smoke 全過

---

## 8. 參考連結

- [stevenke1981/prompt-autofill](https://github.com/stevenke1981/prompt-autofill)
- [stevenke1981/agent-prompt-fill](https://github.com/stevenke1981/agent-prompt-fill)
- [Seedance 2.0 Prompt Guide](https://seedance2.ai/guide)
- [Kling AI Prompt Guide](https://kling.ai/blog/kling-ai-prompt-guide)
- [awesome-seedance-2-prompts](https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts)
