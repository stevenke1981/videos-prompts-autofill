# Video Prompts Autofill — 測試計畫

---

## 1. 測試策略

| 層級 | 工具 | 範圍 |
|------|------|------|
| 單元 | Vitest | promptEngine、merge、helpers、storage、deliverables、seedData、communitySearch、discoveryFeed、communityCatalogLoader、DiscoveryView accessibility |
| 靜態檢查 | ESLint | JavaScript / JSX runtime 與 React 規則 |
| 建置 | vite build + bundle gate | 生產打包、平台 chunk 與 500 KiB 上限 |
| E2E | Playwright | 統一瀑布流、填空、複製、社群匯入、詞庫、深色模式 |
| 手動 | 瀏覽器 | 各平台模板內容正確性 |

---

## 2. 指令

```bash
npm test              # Vitest
npm run lint          # ESLint
npm run build:check   # 建置 + 每個 JS chunk 500 KiB 上限
npm run test:e2e      # Playwright（需 install chromium）
npm run dev           # 開發伺服器 :1420
```

---

## 3. 單元測試

### 3.1 promptEngine.js — 沿用（PE-01 ~ PE-10）

### 3.2 deliverables.js — Video Specs 版

| ID | 案例 | 預期 |
|----|------|------|
| VS-01 | withDeliverables 字串 | 附加 Video Specs |
| VS-02 | 已有 Video Specs | 不重複附加 |
| VS-03 | 雙語物件 | zh-tw / en 各自附加 |

### 3.3 templates 種子資料

| ID | 案例 | 預期 |
|----|------|------|
| SD-01 | INITIAL_TEMPLATES_CONFIG.length | ≥15 |
| SD-02 | 每模板 extractVariableKeys | 所有 key 在 banks 或 defaults |
| SD-03 | SYSTEM_DATA_VERSION | 1.1.0，觸發舊封面遷移 |
| SD-04 | 每個系統模板封面 | 唯一的本機 WebP 且檔案存在 |
| SD-05 | 每個系統模板雙語內容 | 兩語非空、文案不同且變數集合一致 |

### 3.4 communitySearch.js（新增）

| ID | 案例 | 預期 |
|----|------|------|
| CS-01 | 空查詢回傳全部 | length ≥30 |
| CS-02 | 搜尋 "kling" | 結果 platform 或內容含 kling |
| CS-03 | 平台篩選 seedance | 全部 platform=seedance |
| CS-04 | communityPromptToTemplate | 產生有效 Template 含 id/name/content |
| CS-05 | COMMUNITY_DATA_VERSION | 非空字串 |
| CS-06 | 社群提示詞匯入 | 保留 zh-tw / en 原始內容並補齊 5 個 Video Specs 欄位 |
| CS-07 | 平台建議 | 依匯入項目的平台解析對應雙語建議 |
| CS-08 | Runway 繁中提示詞 | 不得與英文內容相同 |

### 3.5 discoveryFeed.js（新增）

| ID | 案例 | 預期 |
|----|------|------|
| DF-01 | 正規化內建與社群資料 | 保留來源物件，不寫入持久層 |
| DF-02 | 社群封面映射 | 同一 item 穩定對應本機 WebP |
| DF-03 | 搜尋與來源/平台/分類篩選 | 只回傳符合項目 |
| DF-04 | 首頁分頁 | 首頁最多 24 筆並正確回報 hasMore |

### 3.6 merge 封面遷移

| ID | 案例 | 預期 |
|----|------|------|
| MG-07 | 使用者自訂封面 | data URL / 外部 URL 保留 |
| MG-08 | 舊 bundled JPG | 升級為目前生成封面 |

### 3.7 communityCatalogLoader.js

| ID | 案例 | 預期 |
|----|------|------|
| CL-01 | production manifest | 10 個唯一平台、總數 1,000、順序固定 |
| CL-02 | 同平台並行載入 | 共用同一個 in-flight Promise |
| CL-03 | 平台載入失敗後重試 | 移除失敗快取，下一次可成功 |
| CL-04 | 背景載入部分失敗 | 其他平台繼續載入，錯誤限於單一平台 |
| CL-05 | 合併同平台 payload | 取代該平台 slice，不重複提示詞 |

### 3.8 DiscoveryView accessibility

| ID | 案例 | 預期 |
|----|------|------|
| DV-A11Y-01 | 發現頁主要互動控制 | 搜尋、來源/平台/分類篩選、排序、頁首按鈕與社群載入狀態皆有 accessible name 或 live status |

### 3.9 其餘（helpers、storage、useKeyboardShortcuts）— 沿用

---

## 4. E2E 驗收（e2e/smoke.spec.js）

1. 首頁標題含「Video」
2. 發現頁 → 選 Seedance 模板 → 複製 Prompt（剪貼簿非空，含 Subject/主體）
3. 等待漸進載入狀態 → 切換 Seedance 平台 → 搜尋 "cinematic" → 同一瀑布流顯示社群卡片 → 選中後進入編輯器
4. 返回編輯器 → 詞庫搜尋過濾
5. 設定 → 深色模式 `html.dark`

---

## 5. 手動驗收清單

### 5.1 啟動
- [ ] `npm run dev` 開啟 http://localhost:1420
- [ ] 發現頁顯示影片模板（非 Agent/繪圖主題）

### 5.2 填空
- [ ] 選「Seedance 2.0 通用公式」模板
- [ ] 下拉變更 `subject`、`camera_movement`
- [ ] 統計列顯示字元/token
- [ ] 複製結果含主體/動作段落

### 5.3 統一瀑布流
- [x] 首頁同時顯示內建與社群來源
- [x] 搜尋 "cinematic" 有社群結果
- [x] 來源、平台與分類篩選可組合
- [x] 點社群卡片後才建立本機模板
- [x] 「載入更多」以 24 筆為增量
- [x] 社群 catalog 依平台分割並顯示 10 平台載入進度
- [x] 選定平台優先載入，單一平台失敗可重試

### 5.4 編輯
- [ ] 切換編輯模式
- [ ] 拖曳詞庫插入 `{{camera_shot}}`
- [ ] Undo/Redo

### 5.5 持久化
- [ ] 重整後 selections 保留
- [ ] JSON 匯出含 templates+banks
- [ ] 匯入前產生 backup key

### 5.6 雙語
- [ ] 切換 en 後 UI 與模板內容為英文

---

## 6. 通過標準

- `npm test` 0 failure
- `npm run lint` 0 error / 0 warning
- `npm run build:check` exit 0，任何 JS chunk 均不超過 500 KiB
- E2E smoke 全過
- 生成封面路徑與檔案存在性測試全過

---

## 7. 2026-07-06 實際驗證結果

| 指令 | 結果 |
|------|------|
| `npm test` | ✅ 10 files / 66 tests |
| `npm run lint` | ✅ 0 error / 0 warning |
| `npm run build:check` | ✅ 14 個 JS chunks；入口 202,829 bytes；全部低於 500 KiB |
| `npm run test:e2e` | ✅ 4/4 |

改善前 production JS 入口為 874,180 bytes；改善後為 202,829 bytes，縮小約 76.8%。非阻斷提示：`caniuse-lite` 約 7 個月未更新。

---

## 8. 2026-07-09 實際驗證結果

| 指令 | 結果 |
|------|------|
| `npm test -- src/__tests__/discoveryViewAccessibility.test.jsx` | ✅ 1 file / 1 test |
| `npm test` | ✅ 11 files / 67 tests |
| `npm run lint` | ✅ 0 error / 0 warning |
| `npm run build:check` | ✅ 14 個 JS chunks；入口 203,850 bytes；全部低於 500 KiB |
| `npm run test:e2e` | ✅ 4/4 |

本輪補上前次 CBM 報告列出的無障礙元件測試缺口；release build 仍只有既有 `caniuse-lite` 過期提示，未阻斷建置。

---

## 9. 2026-07-12 實際驗證結果

| 指令 | 結果 |
|------|------|
| `npm test -- src/__tests__/communitySearch.test.js src/__tests__/deliverables.test.js src/__tests__/seedData.test.js` | ✅ 3 files / 30 tests |
| `npm test` | ✅ 11 files / 70 tests |
| `npm run lint` | ✅ 0 error / 0 warning |
| `npm run build:check` | ✅ 14 個 JS chunks；入口 205,809 bytes；全部低於 500 KiB |
| `npm run test:e2e` | ✅ 4/4 |

本輪修正社群匯入只保留單一語言且缺少影片技術規格的問題；1,000 筆社群提示詞現在會保留雙語內容、補上 Video Specs，並依平台帶入雙語提示建議。同時修正 Runway 內建模板與一筆社群提示誤用英文作為繁中內容，並加入雙語資料品質閘門。
