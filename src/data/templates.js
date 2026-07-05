/**
 * 影片生成模板種子資料 — videos-prompts-autofill
 */
import { withDeliverables } from '../constants/deliverables';

export const SYSTEM_DATA_VERSION = '1.0.0';

export const TEMPLATE_TAGS = [
  'seedance',
  'kling',
  'grok',
  'runway',
  'sora',
  'cinematic',
  'product',
  'anime',
  'commercial',
  'landscape',
  'i2v',
  'dialogue',
];

export const DEFAULT_TEMPLATE_CONTENT = {
  'zh-tw': `### Subject (主體)
{{subject}}，{{subject_emotion}}。

### Motion (動作)
{{subject_action}}，動態為 {{motion_type}}，速度 {{motion_speed}}。

### Scene (場景)
{{environment}}，{{lighting}}，{{time_of_day}}，{{weather}}。

### Camera (鏡頭)
{{camera_shot}}，{{camera_movement}}，{{lens_type}}，{{depth_of_field}}。

### Style (風格)
{{visual_style}}，色調 {{color_palette}}，{{film_grain}}。

### Audio (音效)
配樂：{{audio_music}}；環境音：{{audio_ambient}}。`,
  en: `### Subject
{{subject}}, {{subject_emotion}}.

### Motion
{{subject_action}}, motion: {{motion_type}}, speed: {{motion_speed}}.

### Scene
{{environment}}, {{lighting}}, {{time_of_day}}, {{weather}}.

### Camera
{{camera_shot}}, {{camera_movement}}, {{lens_type}}, {{depth_of_field}}.

### Style
{{visual_style}}, palette: {{color_palette}}, {{film_grain}}.

### Audio
Music: {{audio_music}}; Ambient: {{audio_ambient}}.`,
};

const RAW_TEMPLATES_CONFIG = [
  {
    id: 'tpl_seedance_general',
    name: { 'zh-tw': 'Seedance 2.0 通用公式', en: 'Seedance 2.0 General Formula' },
    tags: ['seedance', 'cinematic'],
    platform: 'seedance',
    imageUrl: './template-covers/agent-system.jpg',
    language: ['zh-tw', 'en'],
    content: DEFAULT_TEMPLATE_CONTENT,
    selections: {
      'platform_hint-0': { 'zh-tw': 'Seedance 2.0 — 自然語言 + 多模態參考', en: 'Seedance 2.0 — natural language + multimodal refs' },
    },
  },
  {
    id: 'tpl_seedance_multimodal',
    name: { 'zh-tw': 'Seedance 多模態參考', en: 'Seedance Multimodal Reference' },
    tags: ['seedance', 'i2v'],
    platform: 'seedance',
    imageUrl: './template-covers/feature-implementation.jpg',
    content: {
      'zh-tw': `{{reference_image}}，{{reference_instruction}}。

主體 {{subject}} 在 {{environment}} 中 {{subject_action}}。
鏡頭：{{camera_shot}}，{{camera_movement}}。
風格 {{visual_style}}，光線 {{lighting}}。
保持參考元素特徵一致，自然語言描述動態細節。`,
      en: `{{reference_image}}, {{reference_instruction}}.

Subject {{subject}} in {{environment}} {{subject_action}}.
Camera: {{camera_shot}}, {{camera_movement}}.
Style {{visual_style}}, lighting {{lighting}}.
Maintain consistent reference features with natural language motion details.`,
    },
  },
  {
    id: 'tpl_seedance_video_edit',
    name: { 'zh-tw': 'Seedance 影片編輯', en: 'Seedance Video Editing' },
    tags: ['seedance'],
    platform: 'seedance',
    imageUrl: './template-covers/safe-refactor.jpg',
    content: {
      'zh-tw': `### 編輯指令
{{edit_operation}}：{{edit_target}}。

### 保留
運鏡與節奏保持不變，僅修改指定元素。

### 場景基調
{{environment}}，{{visual_style}}，{{lighting}}。

### 參考
{{reference_video}}，{{reference_instruction}}`,
      en: `### Edit Instruction
{{edit_operation}}: {{edit_target}}.

### Preserve
Keep camera movement and pacing unchanged; only modify specified elements.

### Scene Tone
{{environment}}, {{visual_style}}, {{lighting}}.

### Reference
{{reference_video}}, {{reference_instruction}}`,
    },
  },
  {
    id: 'tpl_seedance_dialogue',
    name: { 'zh-tw': 'Seedance 對話字幕', en: 'Seedance Dialogue & Subtitles' },
    tags: ['seedance', 'dialogue'],
    platform: 'seedance',
    imageUrl: './template-covers/novelist-crew.jpg',
    content: {
      'zh-tw': `{{subject}} 在 {{environment}} 中與他人交談。
{{subject}} 說：{{dialogue_line}}。
字幕樣式：{{subtitle_style}}。
鏡頭 {{camera_shot}}，{{camera_movement}}。
氛圍 {{narrative_tone}}，光線 {{lighting}}。
{{text_overlay}}`,
      en: `{{subject}} converses with others in {{environment}}.
{{subject}} says: {{dialogue_line}}.
Subtitles: {{subtitle_style}}.
Camera {{camera_shot}}, {{camera_movement}}.
Tone {{narrative_tone}}, lighting {{lighting}}.
{{text_overlay}}`,
    },
  },
  {
    id: 'tpl_kling_cinematic',
    name: { 'zh-tw': 'Kling 電影感場景', en: 'Kling Cinematic Scene' },
    tags: ['kling', 'cinematic'],
    platform: 'kling',
    imageUrl: './template-covers/deep-research-team.jpg',
    content: {
      'zh-tw': `【主體】{{subject}}，{{subject_emotion}}
【動作】{{subject_action}}，{{motion_type}}
【場景】{{environment}}，{{time_of_day}}，{{weather}}
【鏡頭】{{camera_shot}} + {{camera_movement}}，{{depth_of_field}}
【風格】{{visual_style}}，{{color_palette}}，{{film_grain}}
【音效】{{audio_music}}，{{audio_ambient}}`,
      en: `[Subject] {{subject}}, {{subject_emotion}}
[Action] {{subject_action}}, {{motion_type}}
[Scene] {{environment}}, {{time_of_day}}, {{weather}}
[Camera] {{camera_shot}} + {{camera_movement}}, {{depth_of_field}}
[Style] {{visual_style}}, {{color_palette}}, {{film_grain}}
[Audio] {{audio_music}}, {{audio_ambient}}`,
    },
    selections: {
      'platform_hint-0': { 'zh-tw': 'Kling 3 — 主體+動作+鏡頭三段式', en: 'Kling 3 — subject + action + camera three-part' },
    },
  },
  {
    id: 'tpl_kling_product',
    name: { 'zh-tw': 'Kling 產品廣告', en: 'Kling Product Ad' },
    tags: ['kling', 'product', 'commercial'],
    platform: 'kling',
    imageUrl: './template-covers/creative-studio.jpg',
    content: {
      'zh-tw': `{{product_focus}}：{{subject}} 置於 {{environment}}。
{{camera_movement}} 展示產品細節，{{lighting}} 突顯質感。
風格 {{visual_style}}，{{commercial_cta}}。
背景音 {{audio_music}}。`,
      en: `{{product_focus}}: {{subject}} placed in {{environment}}.
{{camera_movement}} showcases product details, {{lighting}} highlights texture.
Style {{visual_style}}, {{commercial_cta}}.
Background music: {{audio_music}}.`,
    },
  },
  {
    id: 'tpl_kling_action',
    name: { 'zh-tw': 'Kling 動作參考', en: 'Kling Action Reference' },
    tags: ['kling', 'cinematic'],
    platform: 'kling',
    imageUrl: './template-covers/react-tools.jpg',
    content: {
      'zh-tw': `{{reference_video}}，生成 {{action_intensity}} 場景。
{{subject}} 在 {{environment}} 中 {{subject_action}}。
鏡頭語言參考 Video 1：{{camera_movement}}。
{{audio_music}}，{{visual_style}}。`,
      en: `{{reference_video}}, generate {{action_intensity}} scene.
{{subject}} {{subject_action}} in {{environment}}.
Camera language from Video 1: {{camera_movement}}.
{{audio_music}}, {{visual_style}}.`,
    },
  },
  {
    id: 'tpl_grok_imagine',
    name: { 'zh-tw': 'Grok Imagine 創意短片', en: 'Grok Imagine Creative Short' },
    tags: ['grok', 'cinematic'],
    platform: 'grok',
    imageUrl: './template-covers/creative-studio.jpg',
    content: {
      'zh-tw': `{{grok_style}} 風格的 {{duration}} 短片。
{{subject}} {{subject_action}} 於 {{environment}}。
色調 {{color_palette}}，基調 {{narrative_tone}}。
簡潔有力的視覺隱喻，{{camera_shot}}。`,
      en: `A {{duration}} short in {{grok_style}} style.
{{subject}} {{subject_action}} in {{environment}}.
Palette {{color_palette}}, tone {{narrative_tone}}.
Concise visual metaphor, {{camera_shot}}.`,
    },
    selections: {
      'platform_hint-0': { 'zh-tw': 'Grok Imagine — 簡潔創意描述', en: 'Grok Imagine — concise creative description' },
    },
  },
  {
    id: 'tpl_runway_gen3',
    name: { 'zh-tw': 'Runway Gen-3 敘事', en: 'Runway Gen-3 Narrative' },
    tags: ['runway', 'cinematic'],
    platform: 'runway',
    imageUrl: './template-covers/task-plan.jpg',
    content: {
      'zh-tw': `Cinematic {{duration}} sequence.
{{camera_movement}} through {{environment}} at {{time_of_day}}.
{{subject}} {{subject_action}}, mood: {{narrative_tone}}.
{{visual_style}}, {{lighting}}, {{film_grain}}.
Sound design: {{audio_ambient}}.`,
      en: `Cinematic {{duration}} sequence.
{{camera_movement}} through {{environment}} at {{time_of_day}}.
{{subject}} {{subject_action}}, mood: {{narrative_tone}}.
{{visual_style}}, {{lighting}}, {{film_grain}}.
Sound design: {{audio_ambient}}.`,
    },
  },
  {
    id: 'tpl_sora_narrative',
    name: { 'zh-tw': 'Sora 風格敘事', en: 'Sora-Style Narrative' },
    tags: ['sora', 'cinematic'],
    platform: 'sora',
    imageUrl: './template-covers/hierarchical-team.jpg',
    content: {
      'zh-tw': `物理真實的 {{duration}} 長鏡頭。
{{environment}}，{{weather}}，{{time_of_day}}。
{{subject}} {{subject_action}}，{{motion_speed}}。
一鏡到底 {{camera_movement}}，{{depth_of_field}}。
{{audio_ambient}}，{{narrative_tone}} 基調。`,
      en: `Physically realistic {{duration}} long take.
{{environment}}, {{weather}}, {{time_of_day}}.
{{subject}} {{subject_action}}, {{motion_speed}}.
One-shot {{camera_movement}}, {{depth_of_field}}.
{{audio_ambient}}, {{narrative_tone}} tone.`,
    },
  },
  {
    id: 'tpl_anime_action',
    name: { 'zh-tw': '動漫打鬥場景', en: 'Anime Action Scene' },
    tags: ['anime', 'kling'],
    platform: 'kling',
    imageUrl: './template-covers/react-tools.jpg',
    content: {
      'zh-tw': `{{visual_style}} 打鬥場景，{{action_intensity}}。
{{subject}} 在 {{environment}} 施展招式。
{{camera_movement}}，速度線與衝擊特效。
{{audio_music}}，{{color_palette}} 高飽和。`,
      en: `{{visual_style}} fight scene, {{action_intensity}}.
{{subject}} performs moves in {{environment}}.
{{camera_movement}}, speed lines and impact effects.
{{audio_music}}, high-saturation {{color_palette}}.`,
    },
  },
  {
    id: 'tpl_commercial_ad',
    name: { 'zh-tw': '商業廣告 15s', en: 'Commercial Ad 15s' },
    tags: ['commercial', 'product'],
    platform: 'seedance',
    imageUrl: './template-covers/feature-implementation.jpg',
    content: {
      'zh-tw': `15 秒商業廣告，{{visual_style}}。
開場 {{camera_shot}} 展示 {{subject}}。
中段 {{product_focus}}，{{camera_movement}}。
結尾 {{commercial_cta}}，{{text_overlay}}。
配樂 {{audio_music}}，畫幅 {{aspect_ratio}}。`,
      en: `15-second commercial, {{visual_style}}.
Opening {{camera_shot}} showcases {{subject}}.
Mid-section {{product_focus}}, {{camera_movement}}.
Ending {{commercial_cta}}, {{text_overlay}}.
Music {{audio_music}}, aspect {{aspect_ratio}}.`,
    },
  },
  {
    id: 'tpl_landscape_timelapse',
    name: { 'zh-tw': '風景縮時攝影', en: 'Landscape Timelapse' },
    tags: ['landscape', 'cinematic'],
    platform: 'kling',
    imageUrl: './template-covers/technical-docs.jpg',
    content: {
      'zh-tw': `{{environment}} 縮時攝影，{{time_of_day}} 光線變化。
{{weather}}，{{motion_speed}} 雲層與光影流動。
{{camera_movement}}，{{visual_style}}。
旁白：{{dialogue_line}}，{{subtitle_style}}。
{{audio_ambient}}。`,
      en: `Timelapse of {{environment}}, {{time_of_day}} light shifts.
{{weather}}, {{motion_speed}} cloud and light movement.
{{camera_movement}}, {{visual_style}}.
Voiceover: {{dialogue_line}}, {{subtitle_style}}.
{{audio_ambient}}.`,
    },
  },
  {
    id: 'tpl_i2v_animate',
    name: { 'zh-tw': '圖生影片動態化', en: 'Image-to-Video Animation' },
    tags: ['i2v', 'seedance'],
    platform: 'seedance',
    imageUrl: './template-covers/single-agent-design.jpg',
    content: {
      'zh-tw': `{{reference_image}}，將靜態圖片動態化。
{{i2v_motion}}，保持原圖構圖與風格。
場景微調：{{lighting}}，{{weather}}。
鏡頭 {{camera_shot}}，極微 {{camera_movement}}。`,
      en: `{{reference_image}}, animate the static image.
{{i2v_motion}}, preserve original composition and style.
Scene tweak: {{lighting}}, {{weather}}.
Camera {{camera_shot}}, subtle {{camera_movement}}.`,
    },
  },
  {
    id: 'tpl_camera_choreography',
    name: { 'zh-tw': '鏡頭運動編排', en: 'Camera Choreography' },
    tags: ['cinematic', 'seedance'],
    platform: 'seedance',
    imageUrl: './template-covers/code-review.jpg',
    content: {
      'zh-tw': `{{reference_video}}，生成 {{environment}} 概念影片。
以 {{subject}} 為視覺中心，{{camera_movement}}。
{{lens_type}}，{{depth_of_field}}，{{visual_style}}。
{{transition_effect}} 連接場景。
{{audio_music}}。`,
      en: `{{reference_video}}, generate concept video for {{environment}}.
Visual center: {{subject}}, {{camera_movement}}.
{{lens_type}}, {{depth_of_field}}, {{visual_style}}.
{{transition_effect}} between scenes.
{{audio_music}}.`,
    },
  },
];

export const INITIAL_TEMPLATES_CONFIG = RAW_TEMPLATES_CONFIG.map((tpl) => ({
  ...tpl,
  content: withDeliverables(tpl.content),
}));