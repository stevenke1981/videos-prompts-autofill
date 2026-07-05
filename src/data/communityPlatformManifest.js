export const COMMUNITY_PLATFORM_MANIFEST = [
  {
    id: 'general',
    count: 3,
    promptsExport: 'GENERAL_PROMPTS',
    categoriesExport: 'GENERAL_CATEGORIES',
    load: () => import('./generalPrompts'),
  },
  {
    id: 'seedance',
    count: 300,
    promptsExport: 'SEEDANCE_PROMPTS',
    categoriesExport: 'SEEDANCE_CATEGORIES',
    load: () => import('./seedancePrompts'),
  },
  {
    id: 'kling',
    count: 300,
    promptsExport: 'KLING_PROMPTS',
    categoriesExport: 'KLING_CATEGORIES',
    load: () => import('./klingPrompts'),
  },
  {
    id: 'grok',
    count: 300,
    promptsExport: 'GROK_IMAGINE_PROMPTS',
    categoriesExport: 'GROK_IMAGINE_CATEGORIES',
    load: () => import('./grokImaginePrompts'),
  },
  {
    id: 'runway',
    count: 30,
    promptsExport: 'RUNWAY_PROMPTS',
    categoriesExport: 'RUNWAY_CATEGORIES',
    load: () => import('./runwayPrompts'),
  },
  {
    id: 'sora',
    count: 30,
    promptsExport: 'SORA_PROMPTS',
    categoriesExport: 'SORA_CATEGORIES',
    load: () => import('./soraPrompts'),
  },
  {
    id: 'pika',
    count: 10,
    promptsExport: 'PIKA_PROMPTS',
    categoriesExport: null,
    load: () => import('./pikaPrompts'),
  },
  {
    id: 'minimax',
    count: 10,
    promptsExport: 'MINIMAX_PROMPTS',
    categoriesExport: null,
    load: () => import('./minimaxPrompts'),
  },
  {
    id: 'luma',
    count: 10,
    promptsExport: 'LUMA_PROMPTS',
    categoriesExport: null,
    load: () => import('./lumaPrompts'),
  },
  {
    id: 'hailuo',
    count: 7,
    promptsExport: 'HAILUO_PROMPTS',
    categoriesExport: null,
    load: () => import('./hailuoPrompts'),
  },
];

export const COMMUNITY_PLATFORM_COUNT = COMMUNITY_PLATFORM_MANIFEST.length;
export const COMMUNITY_PROMPT_COUNT = COMMUNITY_PLATFORM_MANIFEST.reduce(
  (total, platform) => total + platform.count,
  0
);
