/**
 * Minimax 影片提示詞庫 — 10 條
 * @see https://www.minimax.io/
 */

const cp = (id, title, prompt, tags, likes) => ({
  id, title, prompt, platform: 'minimax', tags,
  source: 'Minimax Video Community', sourceUrl: 'https://www.minimax.io/', author: 'Minimax', likes,
});

export const MINIMAX_PROMPTS = [
  cp('minimax_01', { 'zh-tw': '中文古風仙子', en: 'Chinese ancient fairy' },
    { 'zh-tw': '古風仙子衣袂飄飄，雲端漫步，水墨山水背景，Minimax 中文語境優化。', en: 'Ancient Chinese fairy robes flutter, walks on clouds, ink-wash landscape background, Minimax Chinese context optimized.' },
    ["minimax","guofeng"], 350),
  cp('minimax_02', { 'zh-tw': '國風武俠輕功', en: 'Guofeng martial arts leap' },
    { 'zh-tw': '武俠少年輕功躍過竹林，衣袍飛揚，國風電影質感，動作流暢。', en: 'Wuxia youth leaps over bamboo forest with qinggong, robes billow, guofeng cinematic feel, fluid action.' },
    ["minimax","guofeng"], 351),
  cp('minimax_03', { 'zh-tw': '現代都市職場', en: 'Modern urban workplace' },
    { 'zh-tw': '都市白領會議室簡報，自然手勢，商務場景，中文職場敘事。', en: 'Urban office worker presents in meeting room, natural gestures, business setting, Chinese workplace narrative.' },
    ["minimax","guofeng"], 352),
  cp('minimax_04', { 'zh-tw': '美食烹飪特寫', en: 'Food cooking close-up' },
    { 'zh-tw': '廚師鍋中翻炒，火焰躍起，食材特寫，中式美食短片。', en: 'Chef stir-fries in wok, flames leap, ingredient close-ups, Chinese cuisine short film.' },
    ["minimax","guofeng"], 353),
  cp('minimax_05', { 'zh-tw': '寵物日常萌系', en: 'Cute pet daily life' },
    { 'zh-tw': '柴犬搖尾迎接主人回家，客廳溫馨，萌系寵物日常。', en: 'Shiba Inu wags tail greeting owner home, cozy living room, cute pet daily life.' },
    ["minimax","guofeng"], 354),
  cp('minimax_06', { 'zh-tw': '科幻機甲啟動', en: 'Sci-fi mecha activation' },
    { 'zh-tw': '巨型機甲眼部亮起啟動，火花四濺，賽博機甲風格。', en: 'Giant mecha eyes light up and activate, sparks fly, cyber mecha style.' },
    ["minimax","guofeng"], 355),
  cp('minimax_07', { 'zh-tw': '兒童繪本動畫', en: 'Children picture book animation' },
    { 'zh-tw': '繪本風格小兔探險森林，柔和色彩，兒童故事動畫。', en: 'Picture book style bunny explores forest, soft colors, children story animation.' },
    ["minimax","guofeng"], 356),
  cp('minimax_08', { 'zh-tw': '夜景城市航拍', en: 'Night city aerial' },
    { 'zh-tw': '夜景城市航拍，車燈流光，摩天大樓燈火，中文都市氛圍。', en: 'Night city aerial view, car light trails, skyscraper lights, Chinese urban atmosphere.' },
    ["minimax","guofeng"], 357),
  cp('minimax_09', { 'zh-tw': '傳統節慶舞龍', en: 'Traditional festival dragon dance' },
    { 'zh-tw': '春節舞龍表演，鑼鼓喧天，人群圍觀，傳統節慶紀實。', en: 'Spring Festival dragon dance, drums and gongs, crowd watches, traditional festival documentary.' },
    ["minimax","guofeng"], 358),
  cp('minimax_10', { 'zh-tw': '時尚模特走秀', en: 'Fashion model catwalk' },
    { 'zh-tw': '時尚模特 T 台走秀，聚光燈跟隨，國際時裝週氛圍。', en: 'Fashion model catwalk, spotlight follows, international fashion week atmosphere.' },
    ["minimax","guofeng"], 359),
];

export const MINIMAX_COUNT = MINIMAX_PROMPTS.length;