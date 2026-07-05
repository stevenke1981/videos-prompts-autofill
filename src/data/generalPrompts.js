const communityPrompt = (
  id,
  title,
  prompt,
  platform,
  tags,
  source,
  sourceUrl,
  author,
  likes = 0
) => ({
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

export const GENERAL_CATEGORIES = [];

export const GENERAL_PROMPTS = [
  communityPrompt(
    'cp_general_drone_coast',
    { 'zh-tw': '無人機海岸線', en: 'Drone Coastal Line' },
    {
      'zh-tw': '無人機航拍沿海岸線飛行，碧藍海浪拍打礁石，夕陽金色光芒，慢速平移，電影級調色。',
      en: 'Drone aerial flight along coastline, turquoise waves crash on rocks, golden sunset light, slow pan, cinematic color grading.',
    },
    'general',
    ['landscape', 'cinematic'],
    'AI Video Community',
    'https://www.truefan.ai/blogs/ai-video-prompt-engineering-2026-guide',
    'TrueFan',
    356
  ),
  communityPrompt(
    'cp_general_portrait_i2v',
    { 'zh-tw': '人像微動態 I2V', en: 'Portrait Subtle I2V' },
    {
      'zh-tw': '將人像照片動態化：微風吹動髮絲，眼神緩緩轉向鏡頭，嘴角浮現微笑，保持原圖構圖，極微推進。',
      en: 'Animate portrait photo: breeze moves hair, eyes slowly turn to camera, slight smile appears, preserve original composition, subtle push-in.',
    },
    'general',
    ['i2v'],
    'AI Video Community',
    'https://www.truefan.ai/blogs/ai-video-prompt-engineering-2026-guide',
    'TrueFan',
    423
  ),
  communityPrompt(
    'cp_general_vintage_film',
    { 'zh-tw': '復古膠片旅行', en: 'Vintage Film Travel' },
    {
      'zh-tw': '復古 16mm 膠片質感，火車窗外田野掠過，車內乘客翻閱地圖微笑，暖色顆粒，懷舊氛圍。',
      en: 'Vintage 16mm film texture, fields pass outside train window, passenger inside flips map and smiles, warm grain, nostalgic atmosphere.',
    },
    'general',
    ['landscape', 'cinematic'],
    'AI Video Community',
    'https://invideo.io/blog/hidden-secrets-of-kling-ai/',
    'InVideo',
    334
  ),
];

export const GENERAL_COUNT = GENERAL_PROMPTS.length;
