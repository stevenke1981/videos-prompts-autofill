# CBM 專案檢視與改善報告

> 日期：2026-07-05
> 索引：`cbm+videos-prompts-autofill`
> 範圍：主程式、社群資料流、模板封面、測試、建置與文件

## 已確認並修正

| 優先級 | 發現 | 影響 | 修正 |
|---|---|---|---|
| P0 | `App.jsx` 的匯出流程呼叫 4 次不存在的 `showToastMessage` | 行動分享或 JSON 匯出成功後可能拋出 `ReferenceError` | 全部改用現有 `addToast` context |
| P1 | 社群模板位於獨立 Tab | 搜尋、篩選與選用流程割裂 | 建立統一 feed model，內建與社群模板共用原始瀑布流 |
| P1 | 切換平台時可能保留上一平台的 category | 產生無結果的錯誤篩選狀態 | 新增 `normalizeCommunityCategory` 與回歸測試 |
| P1 | `npm run lint` 沒有 ESLint 設定 | lint 指令固定失敗，無法作為品質閘門 | 新增 `.eslintrc.cjs`，修正 runtime、case scope、storage 與連結安全問題 |
| P1 | 15 個影片模板沿用軟體代理題材 JPG，且多個模板共用封面 | 視覺語意錯誤，模板辨識度低 | 使用 Codex 內建生圖產生 15 張專屬封面 |
| P1 | 原始生成 PNG 合計約 35 MB | 首頁載入成本過高 | 轉為 768px WebP，15 張合計 1,674,558 bytes（約 1.60 MiB） |
| P1 | 舊 LocalStorage 會保留已刪除的內建 JPG 路徑 | 舊使用者升級後可能看到破圖 | `SYSTEM_DATA_VERSION` 升至 1.1.0，merge 僅遷移舊 bundled cover，保留真正自訂圖片 |
| P2 | 兩個 `target="_blank"` 連結的 `rel` 值不是安全 token | 舊瀏覽器可能暴露 opener | 改為 `noopener noreferrer` |
| P2 | 統一頁首版少了返回編輯器入口 | 詞庫流程無法從首頁進入 | E2E 重現後補回雙語入口 |
| P1 | 社群 1,000 筆資料同步進入主 bundle | 首頁必須先下載完整 catalog，production JS 達 874,180 bytes | 以 10 個平台 dynamic import、Promise cache 與背景漸進載入拆分 |
| P1 | 切換到已載入平台時分類標籤呼叫已移除函式 | React 在平台分類列渲染時崩潰 | 改用 payload 衍生的 category label map，並由平台 E2E 覆蓋 |
| P2 | 建置只有 Vite 警告，沒有可執行的 bundle 上限 | 後續改動可能讓入口重新膨脹而未阻擋 | 新增 `npm run build:check`，任何 JS chunk 超過 500 KiB 即失敗 |
| P2 | 發現頁主要互動控制缺少元件層無障礙回歸測試 | UI 改版時可能退化搜尋、篩選、排序或載入狀態的可辨識性 | 補 `aria-label`、`role="group"`、`role="status"`，並新增 `DiscoveryView` accessibility test |
| P1 | 社群提示詞匯入時把雙語內容壓成單一字串，且未套用 Video Specs | 切換語言仍顯示匯入時的語言；1,000 筆社群模板缺少時長、畫幅、幀率、負向提示與平台建議 | 匯入時保留雙語 prompt、套用 `withDeliverables`，並依平台填入雙語生成建議 |
| P1 | Runway 內建模板與一筆社群提示的繁中欄位實際存放英文 | 繁中介面出現整段英文，既有測試只驗數量而未攔截 | 補上繁中內容，新增模板雙語文案與變數集合一致性測試及 Runway 回歸測試 |
| P1 | legacy `INITIAL_DEFAULTS` 為繁中字串，英文解析會混入中文 | 既有使用者的英文模板輸出不完整且中英混雜 | `resolvePrompt` 與 `TemplatePreview` 依詞庫中英文雙向映射；無法辨識的自訂值保持原樣 |

## 架構結果

- `src/utils/discoveryFeed.js` 將兩種資料來源正規化為 presentation-only model。
- 社群 1,000 筆資料不寫入 LocalStorage；使用者選中後才轉成可編輯模板。
- 首次只渲染 24 張卡片，以「載入更多」擴充，避免一次建立 1,015 個 DOM card。
- 搜尋涵蓋雙語標題、prompt、來源、平台、分類、標籤與作者。
- 社群卡片使用穩定 hash 對應平台封面，同一筆資料每次得到相同圖片。
- `communityPlatformManifest.js` 保留固定平台順序與預期數量；`communityCatalogLoader.js` 共用 in-flight Promise、快取成功結果並允許失敗平台重試。
- `DiscoveryView` 先渲染內建模板，再按 manifest 順序合併社群平台；切換平台會優先載入該平台。
- 主入口從 874,180 bytes 降為 202,829 bytes（約縮小 76.8%）；10 個平台資料 chunk 為 1,668–141,310 bytes。

## 驗證證據

| 指令 | 結果 |
|---|---|
| `npm test` | 10 files，66 tests，全數通過 |
| `npm run lint` | 通過，0 error / 0 warning |
| `npm run build:check` | 通過；14 個 JS chunks，入口 202,829 bytes，全部低於 500 KiB |
| `npm run test:e2e` | 4/4 通過 |

### 2026-07-09 追加驗證

| 指令 | 結果 |
|---|---|
| `npm test -- src/__tests__/discoveryViewAccessibility.test.jsx` | 1 file，1 test，通過 |
| `npm test` | 11 files，67 tests，全數通過 |
| `npm run lint` | 通過，0 error / 0 warning |
| `npm run build:check` | 通過；14 個 JS chunks，入口 203,850 bytes，全部低於 500 KiB |
| `npm run test:e2e` | 4/4 通過 |

### 2026-07-12 追加驗證

| 指令 | 結果 |
|---|---|
| `npm test -- src/__tests__/communitySearch.test.js src/__tests__/deliverables.test.js src/__tests__/seedData.test.js` | 3 files，30 tests，全數通過 |
| `npm test` | 11 files，73 tests，全數通過 |
| `npm run lint` | 通過，0 error / 0 warning |
| `npm run build:check` | 通過；14 個 JavaScript chunks，入口 206,058 bytes，全部低於 500 KiB |
| `npm run test:e2e` | 4/4 通過 |

## 後續優化建議

1. **資料形狀遷移**：目前以執行期映射保留舊 LocalStorage 字串格式；若未來要將 defaults/selections 正規化為雙語物件，需補上匯入、分享與資料夾載入的相容 migration。
2. **縮小 `App.jsx`**：檔案約 100 KB，包含儲存、分享、匯入匯出、編輯與 UI orchestration。建議先抽出 export/import 與 File System Access service，再恢復嚴格 `no-unused-vars`、`react-hooks/exhaustive-deps`。
3. **更新 Browserslist 資料**：建置提示 `caniuse-lite` 已約 7 個月未更新；應在獨立維護提交中執行，避免本次功能 commit 混入 lockfile 噪音。
4. **更完整鍵盤巡覽 / axe 掃描**：目前已補元件層 accessible name 與 live status 回歸測試；若要進一步提高信心，可於獨立提交加入 axe 或完整 Tab order E2E。

## 未做的事項

- 未新增 production dependency。
- 未改變 npm package manager。
- 未改動 `_ref` 參考 repository。
- 未更新 Browserslist 或 lockfile；該維護工作留給獨立提交。
