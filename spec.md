# Video Prompts Autofill — 功能規格書

> 版本：1.0.0-alpha  
> 基準：agent-prompt-fill v1.0.0 + AI 影片生成領域適配

---

## 1. 名詞定義

| 名詞 | 定義 |
|------|------|
| **影片模板** | 含 `{{variable}}` 的影片生成提示詞，面向特定平台 |
| **詞庫 (Bank)** | 變數名 → 候選值（主體、動作、鏡頭、音效等） |
| **平台標籤** | seedance、kling、grok、runway、sora、cinematic、product… |
| **Video Specs** | 模板末尾標準化技術參數區段 |
| **社群提示詞** | 來自 GitHub/官方指南的精選範例，可搜尋與匯入 |

---

## 2. 資料模型

### 2.1 Template

```typescript
interface Template {
  id: string;
  name: string | LocalizedString;
  content: string | LocalizedString;
  imageUrl?: string;
  selections?: Record<string, string | LocalizedString>;
  tags?: string[];             // seedance | kling | grok | cinematic | product …
  language?: 'zh-tw' | 'en' | ('zh-tw' | 'en')[];
  platform?: string;           // 主要目標平台
}
```

### 2.2 Category（影片分類）

| id | label zh-tw | 用途 |
|----|-------------|------|
| subject | 主體 | 角色、產品、物件 |
| motion | 動作 | 動態描述、速度、軌跡 |
| scene | 場景 | 環境、光線、氛圍 |
| camera | 鏡頭 | 運鏡、景別、鏡頭語言 |
| audio | 音效 | 配樂、旁白、環境音 |
| style | 風格 | 寫實、動漫、賽博龐克… |
| technical | 技術 | 時長、畫幅、FPS、負向提示 |

### 2.3 CommunityPrompt（新增）

```typescript
interface CommunityPrompt {
  id: string;
  title: string | LocalizedString;
  prompt: string | LocalizedString;
  platform: string;            // seedance | kling | grok | runway | sora | general
  tags: string[];
  source: string;              // 來源名稱
  sourceUrl: string;           // 原始連結
  author?: string;
  likes?: number;              // 社群熱度（靜態索引）
}
```

### 2.4 持久化 Keys

LocalStorage 前綴：`videos-prompts-autofill`

| Key | 內容 |
|-----|------|
| `templates` | Template[] |
| `banks` | Banks |
| `defaults` | 預設選項 |
| `categories` | Category map |
| `app_language` | zh-tw \| en |
| `system_data_version` | 種子資料版本 |
| `community_data_version` | 社群資料版本 |

### 2.5 IndexedDB

- Database：`videos-prompts-autofill`
- Store：`images`

---

## 3. 內建影片模板清單（≥15）

| ID | 名稱 | 平台/標籤 |
|----|------|-----------|
| tpl_seedance_general | Seedance 2.0 通用公式 | seedance |
| tpl_seedance_multimodal | Seedance 多模態參考 | seedance |
| tpl_seedance_video_edit | Seedance 影片編輯 | seedance |
| tpl_seedance_dialogue | Seedance 對話字幕 | seedance |
| tpl_kling_cinematic | Kling 電影感場景 | kling |
| tpl_kling_product | Kling 產品廣告 | kling |
| tpl_kling_action | Kling 動作參考 | kling |
| tpl_grok_imagine | Grok Imagine 創意短片 | grok |
| tpl_runway_gen3 | Runway Gen-3 敘事 | runway |
| tpl_sora_narrative | Sora 風格敘事 | sora |
| tpl_anime_action | 動漫打鬥場景 | anime |
| tpl_commercial_ad | 商業廣告 15s | commercial |
| tpl_landscape_timelapse | 風景縮時攝影 | landscape |
| tpl_i2v_animate | 圖生影片動態化 | i2v |
| tpl_camera_choreography | 鏡頭運動編排 | cinematic |

每模板含 `selections` 預設值，content 使用 **Subject / Motion / Scene / Camera / Audio** 結構（依平台調整）。

---

## 4. 內建詞庫（≥40 組）

核心詞庫 key 範例：

- `subject`、`subject_action`、`subject_emotion`
- `motion_type`、`motion_speed`、`motion_direction`
- `environment`、`lighting`、`time_of_day`、`weather`
- `camera_shot`、`camera_movement`、`lens_type`、`depth_of_field`
- `visual_style`、`color_palette`、`film_grain`
- `audio_music`、`audio_ambient`、`dialogue_line`
- `duration`、`aspect_ratio`、`fps`、`resolution`
- `negative_prompt`、`platform_hint`
- `reference_image`、`reference_video`、`reference_instruction`

---

## 5. 社群搜尋規格（新增）

### 5.1 communitySearch API

```js
searchCommunityPrompts(query, filters?): CommunityPrompt[]
  // query: 全文搜尋 title、prompt、tags、platform、source
  // filters: { platform?, tag? }

getCommunityPlatforms(): string[]
getCommunityTags(): string[]

communityPromptToTemplate(prompt, language): Template
  // 將社群提示詞轉為可編輯模板
```

### 5.2 CommunitySearchPanel UI

- 搜尋框（即時過濾，< 50ms）
- 平台篩選列：全部 / Seedance / Kling / Grok / Runway / Sora / 通用
- 結果卡片：標題、平台徽章、摘要、來源連結、複製、匯入模板
- 空狀態：建議關鍵字（cinematic、product、anime…）

### 5.3 發現頁整合

發現頁頂部新增 Tab：**模板** | **社群**

---

## 6. Video Specs 區段

自動附加至無 Specs 的模板：

- **時長**：{{duration}}
- **畫幅**：{{aspect_ratio}}
- **幀率**：{{fps}}
- **負向提示**：{{negative_prompt}}
- **平台建議**：{{platform_hint}}

---

## 7. 匯出

| 動作 | 行為 |
|------|------|
| 複製結果 | `resolveAndCleanPrompt` 純文字 |
| Ctrl+Shift+C | 同上 |
| 長圖匯出 | html2canvas JPG |
| JSON 匯出/匯入 | 含自動備份 |
| 社群匯入 | 建立新模板並切換至編輯器 |

---

## 8. 國際化

- UI：zh-tw / en
- 模板、詞庫、社群提示詞支援雙語物件

---

## 9. 效能與瀏覽器

與 prompt-autofill 相同：Chrome/Edge/Firefox/Safari 現代版本。

---

## 10. 授權

MIT，致謝 prompt-autofill / agent-prompt-fill / PromptFill 原作者。