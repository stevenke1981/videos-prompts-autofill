/**
 * 社群精選影片提示詞 — 來源：官方指南、GitHub 社群、創作者分享
 */
import { GROK_IMAGINE_PROMPTS } from './grokImaginePrompts';
import { SEEDANCE_PROMPTS } from './seedancePrompts';
import { KLING_PROMPTS } from './klingPrompts';
import { RUNWAY_PROMPTS } from './runwayPrompts';
import { SORA_PROMPTS } from './soraPrompts';
import { PIKA_PROMPTS } from './pikaPrompts';
import { MINIMAX_PROMPTS } from './minimaxPrompts';
import { LUMA_PROMPTS } from './lumaPrompts';
import { HAILUO_PROMPTS } from './hailuoPrompts';

export { GROK_IMAGINE_CATEGORIES, GROK_IMAGINE_COUNT } from './grokImaginePrompts';
export { SEEDANCE_CATEGORIES, SEEDANCE_COUNT } from './seedancePrompts';
export { KLING_CATEGORIES, KLING_COUNT } from './klingPrompts';
export { RUNWAY_CATEGORIES, RUNWAY_COUNT } from './runwayPrompts';
export { SORA_CATEGORIES, SORA_COUNT } from './soraPrompts';
export { PIKA_COUNT } from './pikaPrompts';
export { MINIMAX_COUNT } from './minimaxPrompts';
export { LUMA_COUNT } from './lumaPrompts';
export { HAILUO_COUNT } from './hailuoPrompts';

export const COMMUNITY_DATA_VERSION = '1.3.0';

const cp = (id, title, prompt, platform, tags, source, sourceUrl, author, likes = 0) => ({
  id,
  title,
  prompt,
  platform,
  tags,
  source,
  sourceUrl,
  author,
  likes,
});

/** 通用平台精選（各專屬平台已移至獨立庫） */
const BASE_COMMUNITY_PROMPTS = [
  cp('cp_general_drone_coast', { 'zh-tw': '無人機海岸線', en: 'Drone Coastal Line' },
    { 'zh-tw': '無人機航拍沿海岸線飛行，碧藍海浪拍打礁石，夕陽金色光芒，慢速平移，電影級調色。', en: 'Drone aerial flight along coastline, turquoise waves crash on rocks, golden sunset light, slow pan, cinematic color grading.' },
    'general', ['landscape', 'cinematic'], 'AI Video Community', 'https://www.truefan.ai/blogs/ai-video-prompt-engineering-2026-guide', 'TrueFan', 356),
  cp('cp_general_portrait_i2v', { 'zh-tw': '人像微動態 I2V', en: 'Portrait Subtle I2V' },
    { 'zh-tw': '將人像照片動態化：微風吹動髮絲，眼神緩緩轉向鏡頭，嘴角浮現微笑，保持原圖構圖，極微推進。', en: 'Animate portrait photo: breeze moves hair, eyes slowly turn to camera, slight smile appears, preserve original composition, subtle push-in.' },
    'general', ['i2v'], 'AI Video Community', 'https://www.truefan.ai/blogs/ai-video-prompt-engineering-2026-guide', 'TrueFan', 423),
  cp('cp_general_vintage_film', { 'zh-tw': '復古膠片旅行', en: 'Vintage Film Travel' },
    { 'zh-tw': '復古 16mm 膠片質感，火車窗外田野掠過，車內乘客翻閱地圖微笑，暖色顆粒，懷舊氛圍。', en: 'Vintage 16mm film texture, fields pass outside train window, passenger inside flips map and smiles, warm grain, nostalgic atmosphere.' },
    'general', ['landscape', 'cinematic'], 'AI Video Community', 'https://invideo.io/blog/hidden-secrets-of-kling-ai/', 'InVideo', 334),
];

/** 合併各平台社群提示詞 — 總計 1000 條 */
export const COMMUNITY_PROMPTS = [
  ...BASE_COMMUNITY_PROMPTS,
  ...SEEDANCE_PROMPTS,
  ...KLING_PROMPTS,
  ...GROK_IMAGINE_PROMPTS,
  ...RUNWAY_PROMPTS,
  ...SORA_PROMPTS,
  ...PIKA_PROMPTS,
  ...MINIMAX_PROMPTS,
  ...LUMA_PROMPTS,
  ...HAILUO_PROMPTS,
];

export const COMMUNITY_PROMPTS_COUNT = COMMUNITY_PROMPTS.length;