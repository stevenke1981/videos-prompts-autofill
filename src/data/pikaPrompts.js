/**
 * Pika 影片提示詞庫 — 10 條
 * @see https://pika.art/
 */

const cp = (id, title, prompt, tags, likes) => ({
  id, title, prompt, platform: 'pika', tags,
  source: 'Pika Labs Community', sourceUrl: 'https://pika.art/', author: 'Pika', likes,
});

export const PIKA_PROMPTS = [
  cp('pika_01', { 'zh-tw': '卡通貓追蝴蝶', en: 'Cartoon cat chasing butterfly' },
    { 'zh-tw': '可愛卡通風格，橘貓追逐蝴蝶在花園跳躍，明亮色彩，3 秒循環動畫感。', en: 'Cute cartoon style, orange cat chases butterfly jumping in garden, bright colors, 3s loop animation feel.' },
    ["pika","stylized"], 350),
  cp('pika_02', { 'zh-tw': '像素遊戲角色奔跑', en: 'Pixel game character running' },
    { 'zh-tw': '復古像素風，8-bit 角色橫向奔跑，背景捲軸，遊戲動畫質感。', en: 'Retro pixel style, 8-bit character runs sideways, scrolling background, game animation feel.' },
    ["pika","stylized"], 351),
  cp('pika_03', { 'zh-tw': '黏土動畫小鳥', en: 'Claymation bird' },
    { 'zh-tw': '黏土定格風格，小鳥展翅飛起，手工質感，溫暖色調。', en: 'Claymation stop-motion style, clay bird spreads wings and flies, handmade texture, warm tones.' },
    ["pika","stylized"], 352),
  cp('pika_04', { 'zh-tw': '水彩花朵綻放', en: 'Watercolor flower bloom' },
    { 'zh-tw': '水彩插畫風，花朵逐瓣綻放，顏料暈染流動，藝術動畫。', en: 'Watercolor illustration style, flower blooms petal by petal, paint bleeds and flows, art animation.' },
    ["pika","stylized"], 353),
  cp('pika_05', { 'zh-tw': '賽博朋克貓耳少女', en: 'Cyberpunk cat-ear girl' },
    { 'zh-tw': '動漫賽博風，貓耳少女霓虹街道回眸，髮絲飄動，Pika 風格化。', en: 'Anime cyberpunk style, cat-ear girl glances back on neon street, hair flows, Pika stylized.' },
    ["pika","stylized"], 354),
  cp('pika_06', { 'zh-tw': '蒸汽朋克齒輪運轉', en: 'Steampunk gears turning' },
    { 'zh-tw': '蒸汽朋克風，黃銅齒輪組運轉，蒸汽噴出，復古機械動畫。', en: 'Steampunk style, brass gear assembly turns, steam puffs out, vintage mechanical animation.' },
    ["pika","stylized"], 355),
  cp('pika_07', { 'zh-tw': '紙雕城市日出', en: 'Paper-cut city sunrise' },
    { 'zh-tw': '紙雕藝術風，多層紙張城市剪影，太陽升起，光影層次。', en: 'Paper-cut art style, layered paper city silhouette, sun rises, depth through shadows.' },
    ["pika","stylized"], 356),
  cp('pika_08', { 'zh-tw': '霓虹塗鴉動畫', en: 'Neon graffiti animation' },
    { 'zh-tw': '街頭塗鴉風，牆面圖案動態變形，霓虹輪廓發光，潮流動畫。', en: 'Street graffiti style, wall art morphs dynamically, neon outlines glow, trendy animation.' },
    ["pika","stylized"], 357),
  cp('pika_09', { 'zh-tw': '絨毛玩偶跳舞', en: 'Plush toy dancing' },
    { 'zh-tw': '毛絨玩偶風格，泰迪熊可愛跳舞，柔軟材質，兒童動畫感。', en: 'Plush toy style, teddy bear dances cutely, soft material feel, children animation vibe.' },
    ["pika","stylized"], 358),
  cp('pika_10', { 'zh-tw': '水墨武俠對決', en: 'Ink wash martial arts duel' },
    { 'zh-tw': '水墨武俠風，兩俠客剪影對招，墨跡飛濺，東方動態藝術。', en: 'Ink wash wuxia style, two silhouetted warriors duel, ink splashes fly, Eastern motion art.' },
    ["pika","stylized"], 359),
];

export const PIKA_COUNT = PIKA_PROMPTS.length;