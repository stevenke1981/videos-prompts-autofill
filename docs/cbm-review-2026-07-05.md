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

## 架構結果

- `src/utils/discoveryFeed.js` 將兩種資料來源正規化為 presentation-only model。
- 社群 1,000 筆資料不寫入 LocalStorage；使用者選中後才轉成可編輯模板。
- 首次只渲染 24 張卡片，以「載入更多」擴充，避免一次建立 1,015 個 DOM card。
- 搜尋涵蓋雙語標題、prompt、來源、平台、分類、標籤與作者。
- 社群卡片使用穩定 hash 對應平台封面，同一筆資料每次得到相同圖片。

## 驗證證據

| 指令 | 結果 |
|---|---|
| `npm test` | 9 files，60 tests，全數通過 |
| `npm run lint` | 通過，0 error / 0 warning |
| `npm run build` | 通過；JS 874.18 kB，gzip 202.90 kB |
| `npm run test:e2e` | 4/4 通過 |

## 後續優化建議

1. **拆分社群資料 chunk**：目前 1,000 筆靜態資料仍進入單一 874.18 kB JS chunk。可按平台改成動態 import，選到平台或進入首頁時才載入。
2. **縮小 `App.jsx`**：檔案約 100 KB，包含儲存、分享、匯入匯出、編輯與 UI orchestration。建議先抽出 export/import 與 File System Access service，再恢復嚴格 `no-unused-vars`、`react-hooks/exhaustive-deps`。
3. **更新 Browserslist 資料**：建置提示 `caniuse-lite` 已約 7 個月未更新；應在獨立維護提交中執行，避免本次功能 commit 混入 lockfile 噪音。
4. **補無障礙元件測試**：目前 E2E 已覆蓋主要鍵盤可達按鈕，但尚未加入 axe 或完整鍵盤巡覽測試。

## 未做的事項

- 未新增 production dependency。
- 未改變 npm package manager。
- 未改動 `_ref` 參考 repository。
- 未宣稱已消除 bundle-size 警告；它仍是明確記錄的後續工作。
