/**
 * Luma Dream Machine 影片提示詞庫 — 10 條
 * @see https://lumalabs.ai/
 */

const cp = (id, title, prompt, tags, likes) => ({
  id, title, prompt, platform: 'luma', tags,
  source: 'Luma AI Community', sourceUrl: 'https://lumalabs.ai/', author: 'Luma', likes,
});

export const LUMA_PROMPTS = [
  cp('luma_01', { 'zh-tw': '夢境漂浮島嶼', en: 'Dream floating islands' },
    { 'zh-tw': '夢幻漂浮島嶼，瀑布坠入雲海，Luma Dream Machine 超現實質感。', en: 'Dreamy floating islands, waterfalls fall into cloud sea, Luma Dream Machine surreal feel.' },
    ["luma","dream-machine"], 350),
  cp('luma_02', { 'zh-tw': '電影級汽車追逐', en: 'Cinematic car chase' },
    { 'zh-tw': '電影級汽車追逐，輪胎煙霧，低角度跟拍，Luma 電影運鏡。', en: 'Cinematic car chase, tire smoke, low-angle tracking, Luma cinematic camera work.' },
    ["luma","dream-machine"], 351),
  cp('luma_03', { 'zh-tw': '3D 產品渲染動畫', en: '3D product render animation' },
    { 'zh-tw': '3D 產品渲染旋轉展示，材質反光精確，商業級動畫。', en: '3D product render rotation showcase, accurate material reflections, commercial-grade animation.' },
    ["luma","dream-machine"], 352),
  cp('luma_04', { 'zh-tw': '超現實門扉穿越', en: 'Surreal doorway portal' },
    { 'zh-tw': '超現實門扉打開，另一世界風景展現，夢境過渡效果。', en: 'Surreal doorway opens, another world landscape revealed, dream transition effect.' },
    ["luma","dream-machine"], 353),
  cp('luma_05', { 'zh-tw': '音樂節人群狂歡', en: 'Music festival crowd rave' },
    { 'zh-tw': '音樂節舞台燈光，人群跳動狂歡，煙火升空，現場氛圍。', en: 'Music festival stage lights, crowd jumps and raves, fireworks launch, live atmosphere.' },
    ["luma","dream-machine"], 354),
  cp('luma_06', { 'zh-tw': '微距花朵綻放', en: 'Macro flower blooming' },
    { 'zh-tw': '微距花朵綻放延時，花瓣舒展，露珠滾動，自然微觀世界。', en: 'Macro flower bloom timelapse, petals unfold, dew drops roll, natural micro world.' },
    ["luma","dream-machine"], 355),
  cp('luma_07', { 'zh-tw': '太空站外太空漫步', en: 'Spacewalk outside station' },
    { 'zh-tw': '太空站外太空漫步，地球弧線背景，無聲真空，科幻紀錄。', en: 'Spacewalk outside space station, Earth arc background, silent vacuum, sci-fi documentary.' },
    ["luma","dream-machine"], 356),
  cp('luma_08', { 'zh-tw': '復古膠片旅行', en: 'Vintage film travel' },
    { 'zh-tw': '復古 Super 8 膠片旅行，火車窗外風景，顆粒懷舊，Luma 膠片質感。', en: 'Vintage Super 8 film travel, scenery outside train window, grainy nostalgia, Luma film texture.' },
    ["luma","dream-machine"], 357),
  cp('luma_09', { 'zh-tw': '抽象流體藝術', en: 'Abstract fluid art' },
    { 'zh-tw': '抽象流體顏料混合，慢動作漩渦，高飽和藝術實驗。', en: 'Abstract fluid paint mixing, slow-motion swirls, high saturation art experiment.' },
    ["luma","dream-machine"], 358),
  cp('luma_10', { 'zh-tw': '極光北極探險', en: 'Aurora Arctic expedition' },
    { 'zh-tw': '北極極光下探險隊前行，雪地反光，史詩自然紀錄。', en: 'Expedition team advances under Arctic aurora, snow reflections, epic nature documentary.' },
    ["luma","dream-machine"], 359),
];

export const LUMA_COUNT = LUMA_PROMPTS.length;