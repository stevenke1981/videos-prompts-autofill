/**
 * 海螺 AI 影片提示詞庫 — 7 條
 * @see https://hailuoai.com/
 */

const cp = (id, title, prompt, tags, likes) => ({
  id, title, prompt, platform: 'hailuo', tags,
  source: 'Hailuo AI Community', sourceUrl: 'https://hailuoai.com/', author: 'Hailuo', likes,
});

export const HAILUO_PROMPTS = [
  cp('hailuo_01', { 'zh-tw': '海螺 AI 人像動態', en: 'Hailuo AI portrait motion' },
    { 'zh-tw': '將人像照片動態化：微風吹動髮絲，眼神緩緩轉向鏡頭，嘴角微笑，保持原圖構圖。', en: 'Animate portrait photo: breeze moves hair, eyes slowly turn to camera, slight smile, preserve original composition.' },
    ["hailuo","i2v"], 350),
  cp('hailuo_02', { 'zh-tw': '圖生影片產品展示', en: 'Image-to-video product showcase' },
    { 'zh-tw': '參考產品圖，白底桌面緩慢環繞旋轉，光影流動，電商展示短片。', en: 'Reference product image, slow orbit on white table, moving light, e-commerce showcase short.' },
    ["hailuo","i2v"], 351),
  cp('hailuo_03', { 'zh-tw': '古風人物動態化', en: 'Guofeng character animation' },
    { 'zh-tw': '古風人物插畫動態化，衣袂飄揚，背景雲霧流動，海螺中文優化。', en: 'Animate guofeng character illustration, robes flutter, background mist flows, Hailuo Chinese optimized.' },
    ["hailuo","i2v"], 352),
  cp('hailuo_04', { 'zh-tw': '風景照片微動態', en: 'Landscape photo subtle motion' },
    { 'zh-tw': '風景照片微動態：雲層緩移，樹葉輕搖，水面漣漪，保持寫實。', en: 'Subtle landscape photo motion: clouds drift slowly, leaves sway gently, water ripples, stay photorealistic.' },
    ["hailuo","i2v"], 353),
  cp('hailuo_05', { 'zh-tw': '寵物照片活起來', en: 'Pet photo comes alive' },
    { 'zh-tw': '寵物照片動態化：尾巴搖擺，耳朵抖動，眨眼表情，萌系 I2V。', en: 'Animate pet photo: tail wags, ears twitch, blinks expression, cute I2V.' },
    ["hailuo","i2v"], 354),
  cp('hailuo_06', { 'zh-tw': '建築外觀光影變化', en: 'Building facade light change' },
    { 'zh-tw': '建築外觀從日落到夜景，燈光漸亮，天空色彩過渡，縮時感。', en: 'Building facade from sunset to night, lights gradually turn on, sky color transition, timelapse feel.' },
    ["hailuo","i2v"], 355),
  cp('hailuo_07', { 'zh-tw': '美食照片蒸汽動態', en: 'Food photo steam motion' },
    { 'zh-tw': '美食照片動態化：熱氣蒸汽上升，湯汁微動，食慾感 I2V。', en: 'Animate food photo: hot steam rises, soup ripples slightly, appetizing I2V.' },
    ["hailuo","i2v"], 356),
];

export const HAILUO_COUNT = HAILUO_PROMPTS.length;