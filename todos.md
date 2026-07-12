# Video Prompts Autofill — 實作待辦清單

> 狀態：⬜ 待辦 | 🔄 進行中 | ✅ 完成

---

## Phase 0 — 文件

| ID | 任務 | 狀態 |
|----|------|------|
| P0-1 | plan.md | ✅ |
| P0-2 | spec.md | ✅ |
| P0-3 | todos.md | ✅ |
| P0-4 | test.md | ✅ |
| P0-5 | final.md | ✅ |

---

## Phase 1 — 骨架與種子資料

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P1-1 | 複製 agent-prompt-fill 源碼 | ✅ | |
| P1-2 | 更新 package.json 名稱/版本 | ✅ | videos-prompts-autofill |
| P1-3 | 建立影片 templates.js | ✅ | 15 模板 |
| P1-4 | 建立影片 banks.js | ✅ | 40 詞庫 |
| P1-5 | 更新 deliverables.js → Video Specs | ✅ | |
| P1-6 | 更新 translations.js | ✅ | 品牌與文案 |
| P1-7 | 更新 styles/TEMPLATE_TAGS | ✅ | 影片標籤色 |
| P1-8 | 更新 storage.js DB 名稱 | ✅ | videos-prompts-autofill |
| P1-9 | 更新 index.html / version.json | ✅ | |
| P1-10 | 建立 communityPrompts.js | ✅ | 35 條 |
| P1-11 | 建立 communitySearch.js | ✅ | 搜尋 + 匯入 |

---

## Phase 2 — 社群搜尋 UI

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P2-1 | CommunitySearchPanel 元件（歷史實作） | ✅ | 已於 P4 由統一瀑布流取代 |
| P2-2 | 發現頁 Tab 整合（歷史實作） | ✅ | 已於 P4 移除獨立 Tab |
| P2-3 | 匯入社群提示詞為模板 | ✅ | 一鍵建立 |
| P2-4 | npm run dev smoke | ✅ | 發現頁載入 |

---

## Phase 3 — 測試交付

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P3-1 | seedData.test.js 更新 | ✅ | 影片種子驗證 |
| P3-2 | communitySearch.test.js | ✅ | 搜尋單元測試 |
| P3-3 | npm test | ✅ | 67/67 |
| P3-4 | npm run build | ✅ | 零錯誤 |
| P3-5 | npm run test:e2e | ✅ | 4/4 |
| P3-6 | 更新 final.md | ✅ | |
| P3-7 | README.md | ✅ | |
| P3-8 | npm run lint | ✅ | 0 error / 0 warning |

---

## Phase 4 — CBM 檢視、統一瀑布流與生成封面

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P4-1 | CBM 全量索引與呼叫路徑檢視 | ✅ | 222 files / 298 symbols / 1123 edges |
| P4-2 | 建立 unified discovery feed model | ✅ | 內建 + 社群 presentation model |
| P4-3 | 社群模板整合原始瀑布流 | ✅ | 無獨立社群 Tab |
| P4-4 | 搜尋、來源、平台、分類與分頁 | ✅ | 首頁 24 筆 + 載入更多 |
| P4-5 | 社群模板按需匯入 | ✅ | 選中後才寫入 templates |
| P4-6 | 修復跨平台 category 殘留 | ✅ | regression test |
| P4-7 | 恢復 ESLint 與修復 runtime/security 錯誤 | ✅ | lint 零錯誤 |
| P4-8 | Codex 內建生圖產生 15 張封面 | ✅ | 一模板一封面、無文字／品牌 |
| P4-9 | WebP 最佳化與舊封面遷移 | ✅ | 15 張共約 1.60 MiB |
| P4-10 | CBM 報告、測試與文件更新 | ✅ | `docs/cbm-review-2026-07-05.md` |

---

## Phase 5 — 社群資料按平台分割載入

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P5-1 | 抽離 general prompts 與 catalog-independent conversion | ✅ | runtime 不同步匯入 aggregate catalog |
| P5-2 | 建立 10 平台 manifest | ✅ | 固定順序與總數 1,000 |
| P5-3 | Promise cache、重試與平台 slice merge | ✅ | 5 個 loader 回歸測試 |
| P5-4 | DiscoveryView 漸進載入、進度與局部錯誤 UI | ✅ | 內建先顯示、平台可優先載入 |
| P5-5 | 修復平台分類渲染崩潰 | ✅ | Seedance 平台 E2E 通過 |
| P5-6 | 建立 bundle 大小閘門 | ✅ | 14 chunks，全部低於 500 KiB |
| P5-7 | 文件、CBM 與完整驗證 | ✅ | 67 unit / 4 E2E |

---

## Phase 6 — 無障礙回歸補強

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P6-1 | 補強發現頁可存取名稱與 live status | ✅ | 搜尋、來源/平台/分類、排序、頁首按鈕與社群載入狀態皆有可測試 accessible name |
| P6-2 | 新增 DiscoveryView accessibility 單元測試 | ✅ | `discoveryViewAccessibility.test.jsx` |

---

## Phase 7 — 社群提示詞完整化

| ID | 任務 | 狀態 | 驗收 |
|----|------|------|------|
| P7-1 | 社群匯入保留中英文提示詞 | ✅ | 切換模板語言仍顯示對應原始內容 |
| P7-2 | 社群模板補齊 Video Specs 與平台建議 | ✅ | 1,000 筆匯入後皆含時長、畫幅、幀率、負向提示與平台專屬建議 |
| P7-3 | 新增提示詞完整化回歸測試 | ✅ | 雙語內容、5 個技術欄位與平台建議皆受測 |
| P7-4 | 修正 Runway 內建與社群提示詞繁中缺漏 | ✅ | Runway template 與 `runway_cinematic_01` 均有正確繁中內容 |
| P7-5 | 新增內建模板雙語資料品質閘門 | ✅ | 每個模板雙語非空、文案不同且變數集合一致 |
| P7-6 | 修正英文模式的 legacy 預設值解析 | ✅ | 舊繁中字串 defaults/selections 依詞庫映射為英文；自訂值保持原樣 |

---

## 進度追蹤

| Phase | 完成 | 總數 | 進度 |
|-------|------|------|------|
| Phase 0 | 5 | 5 | 100% |
| Phase 1 | 11 | 11 | 100% |
| Phase 2 | 4 | 4 | 100% |
| Phase 3 | 8 | 8 | 100% |
| Phase 4 | 10 | 10 | 100% |
| Phase 5 | 7 | 7 | 100% |
| Phase 6 | 2 | 2 | 100% |
| Phase 7 | 6 | 6 | 100% |
| **合計** | **53** | **53** | **100%** |

*最後更新：2026-07-12*
