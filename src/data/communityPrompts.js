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
import { GENERAL_PROMPTS } from './generalPrompts';

export { GROK_IMAGINE_CATEGORIES, GROK_IMAGINE_COUNT } from './grokImaginePrompts';
export { SEEDANCE_CATEGORIES, SEEDANCE_COUNT } from './seedancePrompts';
export { KLING_CATEGORIES, KLING_COUNT } from './klingPrompts';
export { RUNWAY_CATEGORIES, RUNWAY_COUNT } from './runwayPrompts';
export { SORA_CATEGORIES, SORA_COUNT } from './soraPrompts';
export { PIKA_COUNT } from './pikaPrompts';
export { MINIMAX_COUNT } from './minimaxPrompts';
export { LUMA_COUNT } from './lumaPrompts';
export { HAILUO_COUNT } from './hailuoPrompts';
export { GENERAL_CATEGORIES, GENERAL_COUNT } from './generalPrompts';

export const COMMUNITY_DATA_VERSION = '1.3.0';

/** 合併各平台社群提示詞 — 總計 1000 條 */
export const COMMUNITY_PROMPTS = [
  ...GENERAL_PROMPTS,
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
