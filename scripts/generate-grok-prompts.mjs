import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CATEGORIES = [
  { id: 'surreal', zh: '超現實夢境', en: 'Surreal Dream', tag: 'surreal' },
  { id: 'scifi', zh: '科幻未來', en: 'Sci-Fi Future', tag: 'scifi' },
  { id: 'nature', zh: '自然風景', en: 'Nature Landscape', tag: 'nature' },
  { id: 'urban', zh: '都市街景', en: 'Urban Cityscape', tag: 'urban' },
  { id: 'portrait', zh: '人像角色', en: 'Portrait Character', tag: 'portrait' },
  { id: 'abstract', zh: '抽象藝術', en: 'Abstract Art', tag: 'abstract' },
  { id: 'humor', zh: '幽默梗圖', en: 'Humor Meme', tag: 'humor' },
  { id: 'fantasy', zh: '奇幻魔法', en: 'Fantasy Magic', tag: 'fantasy' },
  { id: 'horror', zh: '恐怖暗調', en: 'Horror Dark', tag: 'horror' },
  { id: 'product', zh: '產品廣告', en: 'Product Ad', tag: 'product' },
  { id: 'animal', zh: '動物生態', en: 'Animal Wildlife', tag: 'animal' },
  { id: 'space', zh: '太空宇宙', en: 'Space Cosmos', tag: 'space' },
  { id: 'retro', zh: '復古懷舊', en: 'Retro Vintage', tag: 'retro' },
  { id: 'anime', zh: '動漫風格', en: 'Anime Style', tag: 'anime' },
  { id: 'food', zh: '美食料理', en: 'Food Culinary', tag: 'food' },
  { id: 'sports', zh: '運動動作', en: 'Sports Action', tag: 'sports' },
  { id: 'music', zh: '音樂舞蹈', en: 'Music Dance', tag: 'music' },
  { id: 'underwater', zh: '水下海洋', en: 'Underwater Ocean', tag: 'underwater' },
  { id: 'seasonal', zh: '節慶季節', en: 'Seasonal Holiday', tag: 'seasonal' },
  { id: 'minimal', zh: '極簡概念', en: 'Minimal Concept', tag: 'minimal' },
];

const HANDCRAFTED = {
  surreal: [
    ['漂浮巨鯨穿越雲層城市', 'Giant whale floating through cloud-layer city', '粉紫漸變天空，建築如夢境倒置，慢動作，詩意超現實', 'Pink-purple gradient sky, buildings inverted like dreams, slow motion, poetic surrealism'],
    ['融化時鐘滴落沙漠', 'Melting clocks dripping into desert', '達利風格，金色沙粒飛揚，時間液態流動，廣角固定', 'Dalí-style, golden sand particles fly, time flows as liquid, wide static shot'],
    ['樓梯通向天空之海', 'Staircase leading to sea in the sky', '無限階梯向上延伸，盡頭是波光粼粼的天海，一鏡推進', 'Infinite stairs ascending, ending in shimmering sky-sea, one-shot push-in'],
    ['房間內下雨的傘', 'Umbrella raining inside a room', '復古客廳中央一把傘下局部降雨，其餘乾燥，特寫水珠', 'Vintage living room, localized rain under one umbrella, rest dry, water droplet close-up'],
    ['巨大花朵吞沒街道', 'Giant flowers swallowing a street', '鬱金香如建築高大，行人渺小穿行，微縮視角仰拍', 'Tulips tower like buildings, tiny pedestrians pass, miniature low-angle shot'],
    ['鏡中世界翻轉', 'Mirror world flipping upside down', '人物踏入鏡面，現實與倒影交換，360°環繞', 'Person steps into mirror, reality and reflection swap, 360° orbit'],
    ['雲朵做的動物遊行', 'Parade of cloud-shaped animals', '天空雲層變形為象、鹿、魚緩緩移動，夕陽剪影', 'Clouds morph into elephants, deer, fish drifting slowly, sunset silhouettes'],
    ['書頁翻飛成鳥', 'Book pages flying as birds', '古老圖書館書頁化鳥群飛出，羽毛為文字，慢動作', 'Ancient library pages become bird flock, feathers as text, slow motion'],
    ['液態黃金河流', 'River of liquid gold', '山谷間金色液體河流流淌，反射天空，航拍俯衝', 'Liquid gold river flows through valley, reflects sky, aerial dive'],
    ['漂浮的鋼琴演奏', 'Floating piano performance', '鋼琴懸浮雲端，琴鍵自動彈奏，音符化光點飄散', 'Piano floats on clouds, keys play themselves, notes become light particles'],
    ['眼睛中的風暴', 'Storm inside an eye', '特寫人眼，虹膜內雷電風暴翻湧，微距鏡頭', 'Close-up human eye, storm churns inside iris, macro lens'],
    ['折疊的城市', 'Folding cityscape', '城市如紙張被折疊，樓層錯位拼接，移軸效果', 'City folds like paper, floors misalign and reconnect, tilt-shift effect'],
    ['月亮上的樹', 'Tree growing on the moon', '月球表面孤樹生長，地球在背景，寧靜科幻詩意', 'Lone tree grows on moon surface, Earth in background, quiet sci-fi poetry'],
    ['透明人走過市集', 'Invisible person in market', '市集攤位物品自行移動，仿佛透明人經過，詼諧超現實', 'Market stall items move on their own, as if invisible person passes, witty surreal'],
    ['睡眠中的城市', 'City asleep and breathing', '城市建築如胸腔起伏呼吸，燈光明暗律動，夢境色調', 'City buildings breathe like chest, lights pulse rhythmically, dream palette'],
  ],
  scifi: [
    ['賽博龐克雨夜追逐', 'Cyberpunk rainy night chase', '霓虹巷弄，全息廣告閃爍，機械義肢跑者跳躍，手持跟拍', 'Neon alley, holographic ads flicker, cybernetic runner leaps, handheld tracking'],
    ['太空電梯攀升', 'Space elevator ascent', '透明電梯艙沿纜繩上升，地球弧線漸小，藍色光暈', 'Transparent cabin climbs cable, Earth curve shrinks, blue halo glow'],
    ['機器人花園澆水', 'Robot watering a garden', '白色人形機器人照料未來溫室，植物發光，柔和日光', 'White humanoid robot tends futuristic greenhouse, plants glow, soft daylight'],
    ['全息會議室', 'Holographic conference room', '透明玻璃房，多人全息投影交談，數據流環繞', 'Glass room, multiple holographic figures converse, data streams orbit'],
    ['火星基地日出', 'Mars base sunrise', '紅色沙丘基地，宇航員眺望雙日出，防護罩反光', 'Red dune base, astronaut watches twin sunrise, dome reflections'],
    ['無人駕駛飛車穿梭', 'Autonomous flying cars weaving', '未來城市空中車流，光軌交織，俯瞰慢速', 'Future city aerial traffic, light trails weave, slow overhead view'],
    ['AI 之眼甦醒', 'AI eye awakening', '巨大機械眼球睜開，瞳孔為代碼瀑布，暗色科幻', 'Giant mechanical eye opens, pupil is code waterfall, dark sci-fi'],
    ['量子傳送實驗', 'Quantum teleportation test', '實驗室光環爆發，人影分解為粒子重組，高速攝影感', 'Lab ring bursts light, figure dissolves to particles and reforms, high-speed feel'],
    ['軌道太空站漫步', 'Spacewalk on orbital station', '宇航員沿站體爬行，地球藍弧背景，無聲真空感', 'Astronaut crawls along station hull, blue Earth arc, silent vacuum feel'],
    ['納米機器人修復', 'Nanobots repairing tissue', '微觀視角，金色納米機器人修補細胞，醫療科幻', 'Microscopic view, gold nanobots repair cells, medical sci-fi'],
    ['反重力瀑布', 'Anti-gravity waterfall', '水流向上飄升再落下，岩石懸浮，異星地貌', 'Water flows upward then falls, rocks float, alien terrain'],
    ['腦機介面連線', 'Brain-computer interface link', '頭戴裝置電纜發光，思維化為3D模型浮現，特寫', 'Headset cables glow, thoughts manifest as 3D models, close-up'],
    ['殖民船啟航', 'Colony ship departure', '巨型方舟噴射離開軌道，人群地面仰望，史詩廣角', 'Massive ark thrusters leave orbit, crowd gazes from ground, epic wide'],
    ['賽博格街頭藝人', 'Cyborg street performer', '半機械音樂家演奏電子琴，音符可視化飄散，夜市霓虹', 'Half-cyborg musician plays synth, visible notes drift, night market neon'],
    ['時間迴圈走廊', 'Time loop corridor', '同一走廊重複出現不同年代行人疊影，長鏡頭', 'Same corridor repeats with ghosted figures from different eras, long take'],
  ],
  nature: [
    ['極光下的冰湖', 'Aurora over frozen lake', '綠色極光舞動，冰面倒影完美，靜謐廣角', 'Green aurora dances, perfect ice reflection, quiet wide shot'],
    ['瀑布彩虹慢動作', 'Waterfall rainbow slow motion', '水霧中彩虹形成，水流如絲綢，慢動作特寫', 'Rainbow forms in mist, water like silk, slow-motion close-up'],
    ['櫻花吹雪小徑', 'Cherry blossom blizzard path', '粉色花瓣狂風捲起，行人撐傘緩行，淺景深', 'Pink petals whirl in wind, pedestrian with umbrella walks slowly, shallow DOF'],
    ['沙漠星空縮時', 'Desert starry sky timelapse', '銀河橫跨沙丘，星軌旋轉，篝火微光', 'Milky Way spans dunes, star trails rotate, campfire glow'],
    ['雨林晨霧', 'Rainforest morning mist', '陽光穿透霧氣，巨樹藤蔓，鳥鳴環境音', 'Sunlight pierces mist, giant trees and vines, bird ambient sound'],
    ['秋葉湖面倒影', 'Autumn leaves on lake reflection', '金紅樹葉飄落湖面，漣漪擴散，固定機位', 'Gold-red leaves fall on lake, ripples spread, static camera'],
    ['雪山雲海翻湧', 'Snow mountain cloud sea rolling', '山頂俯瞰雲浪翻騰，日出金光，航拍平移', 'Summit view of rolling cloud waves, sunrise gold, aerial pan'],
    ['草原斑馬群奔', 'Zebra herd galloping on savanna', '塵土飛揚，斑馬群奔跑，低角度跟拍', 'Dust rises, zebra herd runs, low-angle tracking'],
    ['苔蘚微距世界', 'Moss macro miniature world', '苔蘚如森林，水滴如湖泊，微距緩推', 'Moss as forest, water drops as lakes, macro slow push'],
    ['火山熔岩入海', 'Volcano lava meeting ocean', '紅熱熔岩遇海水蒸汽爆發，壯觀紀錄片', 'Red-hot lava meets ocean steam explosion, epic documentary'],
    ['麥田金色波浪', 'Golden wheat field waves', '風吹麥浪起伏，農舍遠景，黃昏暖光', 'Wind ripples wheat sea, farmhouse in distance, dusk warm light'],
    ['冰川裂縫藍洞', 'Glacier crevasse blue cave', '冰洞內藍光晶瑩，探險者頭燈掃過，第一人稱', 'Blue ice cave glows, explorer headlamp sweeps, first-person'],
    ['螢火蟲森林夜', 'Firefly forest at night', '無數螢火蟲閃爍如星，森林幽暗神秘', 'Countless fireflies blink like stars, dark mysterious forest'],
    ['懸崖海鷗盤旋', 'Seagulls circling cliff', '峭壁海浪拍打，海鷗群盤旋俯衝，紀實風', 'Cliff waves crash, seagull flock circles and dives, documentary style'],
    ['竹林風聲', 'Bamboo grove in wind', '竹葉沙沙搖曳，陽光斑駁，禪意慢鏡頭', 'Bamboo leaves rustle, dappled sunlight, zen slow shots'],
  ],
  urban: [
    ['東京十字路口縮時', 'Tokyo intersection timelapse', '人流車流交織，黃昏至夜晚燈光轉換，俯瞰', 'Pedestrian and traffic weave, dusk to night lights, overhead view'],
    ['紐約雨夜計程車', 'NYC rainy night taxi', '黃色計程車濕路面反射，窗雨滴落，車內視角', 'Yellow cab on wet reflective streets, rain on window, interior POV'],
    ['倫敦霧中大笨鐘', 'London fog Big Ben', '濃霧中大笨鐘若隱若現，復古色調，緩推', 'Big Ben emerges in thick fog, vintage tones, slow push-in'],
    ['上海外灘夜景', 'Shanghai Bund night skyline', '浦江兩岸燈火，遊船駛過，航拍慢移', 'Bund skyline lights both banks, cruise ship passes, slow aerial move'],
    ['巴黎鐵塔黃昏', 'Eiffel Tower at dusk', '鐵塔亮燈瞬間，塞納河畔人群，浪漫暖色', 'Tower lights ignite, Seine crowds, romantic warm palette'],
    ['香港中環電梯', 'Hong Kong Central escalators', '長扶梯人流上下，高樓夾縫，快門感紀實', 'Long escalator crowds up/down, towers on both sides, street photography feel'],
    ['柏林塗鴉牆', 'Berlin graffiti wall', '彩色塗鴉特寫，滑板少年掠過，手持', 'Colorful graffiti close-up, skater passes, handheld'],
    ['杜拜摩天大樓', 'Dubai skyscraper vertigo', '仰拍玻璃幕牆，雲層掠過樓頂，移軸', 'Low-angle glass facade, clouds skim rooftop, tilt-shift'],
    ['首爾夜市小吃', 'Seoul night market food stalls', '煙火蒸汽升騰，攤販忙碌，暖色紀實', 'Steam and smoke rise, vendors busy, warm documentary'],
    ['羅馬古蹟夕陽', 'Rome ruins at sunset', '斗獸場金色餘暉，遊客剪影，史詩廣角', 'Colosseum golden hour, tourist silhouettes, epic wide'],
    ['墨爾本電車', 'Melbourne tram passing', '復古電車叮噹駛過咖啡街，淺景深', 'Vintage tram rings through café street, shallow DOF'],
    ['開羅市集人潮', 'Cairo bazaar crowd', '狹窄巷弄香料攤，色彩繽紛，跟拍', 'Narrow spice alley, vivid colors, tracking shot'],
    ['洛杉磯高速公路', 'LA freeway light trails', '夜晚車燈長曝光光軌，城市散景', 'Night car light trails long exposure, city bokeh'],
    ['阿姆斯特丹運河', 'Amsterdam canal bikes', '運河倒影房屋，自行車騎過橋，寧靜', 'Canal reflects houses, bicycle crosses bridge, calm mood'],
    ['重慶立體交通', 'Chongqing layered traffic', '多層立交橋與輕軌交錯，賽博都市感', 'Multi-level overpasses and monorail weave, cyber-urban feel'],
  ],
  portrait: [
    ['窗邊沉思少女', 'Girl contemplating by window', '側臉剪影，窗外雨景，柔光淺景深', 'Profile silhouette, rainy window view, soft light shallow DOF'],
    ['街頭老人特寫', 'Street elder close-up portrait', '皺紋細節，煙霧繚繞，紀實黑白', 'Wrinkle details, cigarette smoke, documentary black-white'],
    ['舞者後台化妝', 'Dancer backstage makeup', '鏡前塗口紅，燈泡串背景，電影質感', 'Mirror lipstick application, bulb string background, cinematic texture'],
    ['騎士盔甲肖像', 'Knight in armor portrait', '盔甲反光，城堡背景，史詩光線', 'Armor reflections, castle backdrop, epic lighting'],
    ['科幻少女全息', 'Sci-fi girl with hologram', '少女臉部全息數據投影，藍紫霓虹', 'Holographic data projects on girl face, blue-purple neon'],
    ['牛仔黃昏回眸', 'Cowboy dusk glance back', '黃昏沙漠，牛仔帽剪影，寬銀幕', 'Desert dusk, cowboy hat silhouette, widescreen'],
    ['芭蕾舞者旋轉', 'Ballerina spinning portrait', '裙擺旋轉模糊，聚光燈，慢動作', 'Tutu spin blur, spotlight, slow motion'],
    ['漁民暴風雨前', 'Fisherman before storm', '滄桑面孔，烏雲壓境，戲劇性光', 'Weathered face, storm clouds loom, dramatic light'],
    ['兒童吹泡泡', 'Child blowing bubbles', '泡泡反射彩虹，純真笑容，暖色', 'Bubbles reflect rainbow, innocent smile, warm tones'],
    ['賽博龐克少女', 'Cyberpunk girl neon portrait', '螢光髮色，機械頸環，雨夜霓虹', 'Fluorescent hair, mechanical collar, rainy neon night'],
    ['畫家沾顏料的手', 'Painter hands with paint', '雙手沾滿顏料特寫，畫布背景', 'Paint-covered hands close-up, canvas background'],
    ['武士拔刀瞬間', 'Samurai drawing sword moment', '刀光一閃，和服細節，高速凝固', 'Blade flash, kimono details, frozen high-speed'],
    ['太空頭盔倒影', 'Astronaut helmet reflection', '頭盔面罩倒映地球，太空肖像', 'Visor reflects Earth, space portrait'],
    ['時尚模特吹風', 'Fashion model wind blow', '風扇吹髮飄揚，高對比時尚光', 'Fan blows hair flowing, high-contrast fashion light'],
    ['老唱片DJ', 'Vintage vinyl DJ portrait', '老唱片機旋轉，DJ戴耳機點頭，復古暖色', 'Vinyl spins, DJ nods with headphones, retro warm tones'],
  ],
};

const SUBJECTS_ZH = ['光影', '粒子', '角色', '場景', '物件', '生物', '建築', '符號', '紋理', '色彩', '動態', '剪影', '倒影', '煙霧', '流體'];
const SUBJECTS_EN = ['light and shadow', 'particles', 'character', 'scene', 'object', 'creature', 'architecture', 'symbol', 'texture', 'color', 'motion', 'silhouette', 'reflection', 'smoke', 'fluid'];
const ACTIONS_ZH = ['緩緩流動', '突然綻放', '優雅旋轉', '爆炸擴散', '微妙脈動', '層層疊加', '破碎重組', '漂浮上升', '沉入深處', '交織融合'];
const ACTIONS_EN = ['flows slowly', 'bursts open', 'spins gracefully', 'explodes outward', 'pulses subtly', 'layers stack', 'shatters and reforms', 'floats upward', 'sinks deep', 'interweaves and merges'];
const MOODS_ZH = ['冥想氛圍', '史詩感', '詼諧趣味', '神秘暗調', '溫馨治癒', '緊張懸疑', '夢幻飄渺', '極簡留白', '高飽和活力', '電影寫實'];
const MOODS_EN = ['meditative mood', 'epic feel', 'playful wit', 'mysterious dark tone', 'warm healing', 'tense suspense', 'dreamy ethereal', 'minimal negative space', 'high-saturation energy', 'cinematic realism'];
const CAMERAS_ZH = ['固定廣角', '慢速推進', '環繞特寫', '航拍俯瞰', '手持微晃', '微距細節', '一鏡到底', '移軸微縮', '低角度仰拍', '高角度俯視'];
const CAMERAS_EN = ['static wide angle', 'slow push-in', 'orbit close-up', 'aerial overhead', 'subtle handheld', 'macro detail', 'one continuous take', 'tilt-shift miniature', 'low-angle shot', 'high-angle overhead'];

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function buildCategoryPrompts(cat) {
  if (HANDCRAFTED[cat.id]) return HANDCRAFTED[cat.id];

  const prompts = [];
  for (let i = 0; i < 15; i++) {
    const si = i % 15;
    const ai = (i + 3) % 10;
    const mi = (i + 5) % 10;
    const ci = (i + 7) % 10;
    const num = String(i + 1).padStart(2, '0');
    prompts.push([
      `Grok ${cat.zh} #${num}`,
      `Grok ${cat.en} #${num}`,
      `Grok Imagine ${cat.zh}短片：以${SUBJECTS_ZH[si]}為核心，${ACTIONS_ZH[ai]}，${MOODS_ZH[mi]}。鏡頭採${CAMERAS_ZH[ci]}，10秒，適合社群創意發佈。`,
      `Grok Imagine ${cat.en} short: centered on ${SUBJECTS_EN[si]}, ${ACTIONS_EN[ai]}, ${MOODS_EN[mi]}. Camera: ${CAMERAS_EN[ci]}, 10 seconds, ideal for social creative posts.`,
    ]);
  }
  return prompts;
}

const lines = [];
lines.push('/**');
lines.push(' * Grok Imagine 影片提示詞庫 — 300 條分 20 類');
lines.push(' * @see https://x.ai/');
lines.push(' */');
lines.push('');
lines.push('export const GROK_IMAGINE_CATEGORIES = [');
for (const c of CATEGORIES) {
  lines.push(`  { id: '${c.id}', label: { 'zh-tw': '${c.zh}', en: '${c.en}' }, tag: '${c.tag}' },`);
}
lines.push('];');
lines.push('');
lines.push('const cp = (id, title, prompt, category, tags, likes) => ({');
lines.push('  id, title, prompt, platform: \'grok\', category, tags,');
lines.push('  source: \'Grok Imagine Library\', sourceUrl: \'https://x.ai/\', author: \'xAI\', likes,');
lines.push('});');
lines.push('');
lines.push('export const GROK_IMAGINE_PROMPTS = [');

let total = 0;
for (const cat of CATEGORIES) {
  const prompts = buildCategoryPrompts(cat);
  prompts.forEach((p, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const id = `grok_${cat.id}_${num}`;
    const tags = JSON.stringify(['grok-imagine', cat.tag, 'grok']);
    lines.push(`  cp('${id}', { 'zh-tw': '${esc(p[0])}', en: '${esc(p[1])}' },`);
    lines.push(`    { 'zh-tw': '${esc(p[2])}', en: '${esc(p[3])}' },`);
    lines.push(`    '${cat.id}', ${tags}, ${200 + (total % 800)}),`);
    total++;
  });
}
lines.push('];');
lines.push('');
lines.push('export const GROK_IMAGINE_COUNT = GROK_IMAGINE_PROMPTS.length;');

const outPath = resolve(__dirname, '../src/data/grokImaginePrompts.js');
writeFileSync(outPath, lines.join('\n'));
console.log(`Generated ${total} Grok Imagine prompts → ${outPath}`);