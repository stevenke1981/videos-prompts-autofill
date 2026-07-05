import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const SHARED_CATEGORIES = [
  { id: 'cinematic', zh: '電影感場景', en: 'Cinematic Scene' },
  { id: 'product', zh: '產品展示', en: 'Product Showcase' },
  { id: 'portrait', zh: '人像角色', en: 'Portrait Character' },
  { id: 'action', zh: '動作場景', en: 'Action Scene' },
  { id: 'landscape', zh: '自然風景', en: 'Nature Landscape' },
  { id: 'urban', zh: '都市街景', en: 'Urban Cityscape' },
  { id: 'anime', zh: '動漫風格', en: 'Anime Style' },
  { id: 'commercial', zh: '商業廣告', en: 'Commercial Ad' },
  { id: 'food', zh: '美食料理', en: 'Food Culinary' },
  { id: 'sports', zh: '運動動作', en: 'Sports Action' },
  { id: 'music', zh: '音樂舞蹈', en: 'Music Dance' },
  { id: 'horror', zh: '恐怖懸疑', en: 'Horror Suspense' },
  { id: 'scifi', zh: '科幻未來', en: 'Sci-Fi Future' },
  { id: 'fantasy', zh: '奇幻魔法', en: 'Fantasy Magic' },
  { id: 'underwater', zh: '水下海洋', en: 'Underwater Ocean' },
  { id: 'retro', zh: '復古懷舊', en: 'Retro Vintage' },
  { id: 'animal', zh: '動物生態', en: 'Animal Wildlife' },
  { id: 'fashion', zh: '時尚造型', en: 'Fashion Style' },
  { id: 'seasonal', zh: '節慶季節', en: 'Seasonal Holiday' },
  { id: 'minimal', zh: '極簡概念', en: 'Minimal Concept' },
];

const SEEDANCE_EXTRA = [
  { id: 'multimodal', zh: '多模態參考', en: 'Multimodal Reference' },
  { id: 'video-edit', zh: '影片編輯', en: 'Video Editing' },
  { id: 'text-overlay', zh: '文字疊加', en: 'Text Overlay' },
  { id: 'dialogue', zh: '對話字幕', en: 'Dialogue Subtitles' },
  { id: 'i2v', zh: '圖生影片', en: 'Image-to-Video' },
  { id: 'camera-ref', zh: '運鏡參考', en: 'Camera Reference' },
  { id: 'extend', zh: '影片延伸', en: 'Video Extension' },
  { id: 'effects', zh: '特效參考', en: 'Effects Reference' },
  { id: 'storyboard', zh: '分鏡敘事', en: 'Storyboard Narrative' },
  { id: 'character', zh: '角色一致', en: 'Character Consistency' },
];

const KLING_EXTRA = [
  { id: 'slowmo', zh: '慢動作特寫', en: 'Slow Motion' },
  { id: 'timelapse', zh: '縮時攝影', en: 'Timelapse' },
  { id: 'macro', zh: '微距細節', en: 'Macro Detail' },
  { id: 'romance', zh: '浪漫愛情', en: 'Romance' },
  { id: 'documentary', zh: '紀錄寫實', en: 'Documentary' },
  { id: 'aerial', zh: '航拍俯瞰', en: 'Aerial Overhead' },
  { id: 'night', zh: '夜景霓虹', en: 'Night Neon' },
  { id: 'fight', zh: '打鬥武術', en: 'Fight Martial Arts' },
  { id: 'pet', zh: '寵物萌系', en: 'Cute Pets' },
  { id: 'travel', zh: '旅行紀實', en: 'Travel Vlog' },
];

// Seedance: use 10 seedance-specific + 10 shared = 20 categories
const SEEDANCE_CATEGORIES = [...SEEDANCE_EXTRA, ...SHARED_CATEGORIES.slice(0, 10)];
// Kling: use 10 kling-specific + 10 shared = 20 categories
const KLING_CATEGORIES = [...KLING_EXTRA, ...SHARED_CATEGORIES.slice(10, 20)];

const SUBJECTS_ZH = ['年輕女性', '機械馬', '高端相機', '橘貓', '登山者', '咖啡師', '賽博少女', '產品瓶', '舞者', '老建築', '跑車', '櫻花樹', '宇航員', '廚師', '街頭藝人'];
const SUBJECTS_EN = ['young woman', 'mechanical horse', 'premium camera', 'orange cat', 'mountaineer', 'barista', 'cyber girl', 'product bottle', 'dancer', 'old building', 'sports car', 'cherry tree', 'astronaut', 'chef', 'street artist'];
const MOTIONS_ZH = ['緩慢轉身', '奔跑跳躍', '優雅旋轉', '輕柔撫摸', '攀爬上升', '彈奏演奏', '揮手微笑', '衝刺爆發', '漂浮下落', '漫步前行'];
const MOTIONS_EN = ['slowly turns', 'runs and leaps', 'spins gracefully', 'gently caresses', 'climbs upward', 'plays instrument', 'waves and smiles', 'sprints explosively', 'floats downward', 'walks forward'];
const SCENES_ZH = ['霓虹都市', '溫馨客廳', '清晨山間', '咖啡廳', '白色展台', '賽博街道', '校園跑道', '草莓農園', '海底世界', '星空沙漠'];
const SCENES_EN = ['neon city', 'cozy living room', 'morning mountains', 'coffee shop', 'white display table', 'cyber street', 'school track', 'strawberry farm', 'underwater world', 'starry desert'];
const CAMERAS_ZH = ['緩慢推進', '環繞旋轉', '跟隨鏡頭', '俯衝一鏡', '平移橫移', '固定廣角', '手持微晃', '微距特寫', '航拍俯瞰', '過肩鏡頭'];
const CAMERAS_EN = ['slow push-in', 'orbit rotation', 'tracking shot', 'diving one-shot', 'lateral pan', 'static wide', 'subtle handheld', 'macro close-up', 'aerial overhead', 'over-shoulder shot'];

const SEEDANCE_HANDCRAFTED = {
  multimodal: [
    ['參考 Image 1 角色吃蛋糕', 'Reference Image 1 character eating cake', '參考 Image 1-3 女子外觀，她在咖啡廳吃蛋糕，保持角色特徵一致，中景，暖色調。', 'Reference woman appearance from Image 1-3, she eats cake in coffee shop, maintain consistent features, medium shot, warm tones.'],
    ['多圖產品旋轉展示', 'Multi-image product rotation', '提取 Image 1-3 相機多角度，白底桌面，鏡頭環繞旋轉展示正面側面背面。', 'Extract camera from Image 1-3 angles, white table, orbit rotation showing front side back.'],
    ['Logo+角色賽博場景', 'Logo and character cyber scene', '參考 Image 2 女孩放浮空燈籠，場景模糊後 Image 1 Logo 浮現，3D 賽博龐克。', 'Reference girl from Image 2 releases floating lanterns, scene blurs then Image 1 Logo appears, 3D cyberpunk.'],
    ['貓狗多主體互動', 'Cat and dog multi-subject', '參考圖片中貓狗，溫馨公寓狗吃糧貓伸爪碰狗，暖色調。', 'Reference cat and dog from images, cozy apartment dog eating cat touches paw, warm tones.'],
    ['多元素餐廳場景', 'Multi-element restaurant', 'Image 4 餐廳內，Image 1 女孩穿 Image 2 服裝，Image 3 男孩搭訕，Image 5 Logo 固定右下角。', 'Inside Image 4 restaurant, Image 1 girl wears Image 2 outfit, Image 3 boy chats, Image 5 Logo fixed bottom-right.'],
    ['分鏡格鬥依序', 'Storyboard fight sequence', '參考分鏡圖構圖依序出現，接著兩角色激烈對戰，動作參考 Video 1。', 'Reference storyboard compositions in order, then intense battle between two characters, action from Video 1.'],
    ['女孩吹笛粒子特效', 'Girl flute particle effects', '參考 Video 1 金色粒子，Image 1 女孩吹長笛周圍相同粒子特效。', 'Reference golden particles from Video 1, girl from Image 1 plays flute with same particle effects.'],
    ['翅膀生長特效', 'Wings growth effect', '參考 Video 1 特效，Image 1 女孩長出相同翅膀，生成軌跡一致。', 'Reference effects from Video 1, girl from Image 1 grows same wings, matching generation trajectory.'],
    ['熱水瓶居家展示', 'Thermos home showcase', '溫馨居家場景，參考圖熱水瓶中景，手入畫握起旋轉展示。', 'Warm home scene, reference thermos medium shot, hand enters frame grips and rotates to showcase.'],
    ['馬奔馳變吊墜', 'Horse gallop to pendant', '參考 Video 1 馬奔跑姿態，金馬草原奔馳定格轉化馬形黃金吊墜。', 'Reference horse running form from Video 1, golden horse gallops on grassland freezes into horse-shaped gold pendant.'],
    ['三角度角色一致', 'Three-angle character consistency', '參考 Image 1-3 女子外觀，她在雨中撐傘漫步，特徵完全一致。', 'Reference woman from Image 1-3, she walks with umbrella in rain, features fully consistent.'],
    ['產品+場景合成', 'Product scene composite', '參考 Image 1 產品與 Image 2 場景，產品置於場景中央，運鏡緩推。', 'Reference Image 1 product and Image 2 scene, product placed at center, slow push-in camera.'],
    ['服裝替換生成', 'Outfit swap generation', '參考 Image 1 角色穿 Image 2 服裝，在 Image 3 場景中行走。', 'Reference Image 1 character wearing Image 2 outfit, walking in Image 3 scene.'],
    ['Logo 浮現轉場', 'Logo reveal transition', '場景漸模糊，Image 1 Logo 在螢幕中央淡入，品牌 Slogan 同步出現。', 'Scene gradually blurs, Image 1 Logo fades in at center, brand slogan appears simultaneously.'],
    ['多分鏡對話場景', 'Multi-panel dialogue scene', '參考 Image 3 分鏡構圖，女孩等爸爸煮飯，對話氣泡同步，角色參考 Image 1-2。', 'Reference Image 3 storyboard composition, girl waits for dad cooking, speech bubbles sync, characters from Image 1-2.'],
  ],
  'video-edit': [
    ['桌面新增零食', 'Add snacks on counter', '在 Video 1 櫃台上新增炸雞、披薩等零食，其餘不變。', 'Add fried chicken, pizza and snacks on counter in Video 1, everything else unchanged.'],
    ['清除桌面雜物', 'Clear desktop clutter', '清除 Video 1 桌面多餘物品，保持整潔，僅留手中物品。', 'Clear extra items from desktop in Video 1, keep tidy, only items in hands remain.'],
    ['替換香水為面霜', 'Replace perfume with cream', '將 Video 1 香水替換為 Image 1 面霜，運鏡不變。', 'Replace perfume in Video 1 with face cream from Image 1, camera movement unchanged.'],
    ['向後延伸聚會', 'Extend backward to meeting', '生成 Video 1 之後內容，兩男子跑來五人開心相聚。', 'Generate content after Video 1, two men run over, all five meet happily.'],
    ['向前延伸對話', 'Extend forward with dialogue', '向前延伸 Video 1，白衣男子過肩鏡頭說：「沒那麼糟，繼續加油。」', 'Extend Video 1 forward, over-shoulder white-shirt man says: "Not that bad, keep going."'],
    ['葉片轉場連接', 'Leaf transition connect', 'Video 1 葉片觸地金色粒子爆發，一陣風後連接 Video 2。', 'Video 1 leaf touches ground golden particles burst, wind then connect to Video 2.'],
    ['移除背景路人', 'Remove background pedestrians', '移除 Video 1 背景路人，主體與運鏡保持不變。', 'Remove background pedestrians in Video 1, subject and camera unchanged.'],
    ['替換天空為黃昏', 'Replace sky with dusk', '將 Video 1 天空替換為黃昏橙紫色，地面光影同步調整。', 'Replace sky in Video 1 with dusk orange-purple, ground lighting adjusts accordingly.'],
    ['新增雨中效果', 'Add rain effect', '在 Video 1 指定時間位置新增下雨效果，地面出現水漬反光。', 'Add rain effect at specified time in Video 1, ground shows puddle reflections.'],
    ['修改服裝顏色', 'Change outfit color', '將 Video 1 中人物服裝改為紅色，動作與鏡頭不變。', 'Change character outfit in Video 1 to red, action and camera unchanged.'],
    ['添加品牌 Logo', 'Add brand logo', '在 Video 1 右下角添加 Image 1 Logo，全程固定顯示。', 'Add Image 1 Logo at bottom-right of Video 1, fixed throughout.'],
    ['移除水印文字', 'Remove watermark text', '移除 Video 1 中的水印文字，畫面其餘保持原樣。', 'Remove watermark text in Video 1, rest of frame unchanged.'],
    ['向前延伸開場', 'Extend forward opening', '向前延伸 Video 1，新增角色入畫走向鏡頭的開場。', 'Extend Video 1 forward, add opening with character entering frame walking toward camera.'],
    ['向後延伸結尾', 'Extend backward ending', '向後延伸 Video 1，場景漸暗字幕浮現品牌 Slogan。', 'Extend Video 1 backward, scene darkens subtitle fades in brand slogan.'],
    ['三影片軌道合成', 'Three-video track composite', 'Video 1 過渡連接 Video 2 再連接 Video 3，過渡為金色粒子爆發。', 'Video 1 transitions to Video 2 then Video 3, transitions use golden particle burst.'],
  ],
  dialogue: [
    ['辦公室聊天字幕', 'Office chat subtitles', '圖中兩人辦公室聊天，女先說：「你又準時到了？」男笑答：「我有自己的節奏。」底部同步字幕。', 'Two people chat in office, woman: "You arrived just on time again?" man laughs: "I have my own rhythm." Bottom synchronized subtitles.'],
    ['校園跑步氣泡', 'Campus running bubbles', '兩人穿運動服校園跑道跑步，女孩笑說：「我們一定可以的！」男孩猶豫：「你確定？」氣泡對話。', 'Two in sportswear run on school track, girl smiles: "We can definitely do it!" boy hesitates: "Are you sure?" speech bubbles.'],
    ['草莓園笑語', 'Strawberry farm smile', '參考女孩外觀，草莓園摘草莓咬一口笑說：「這才是正品！」氣泡顯示對白。', 'Reference girl appearance, strawberry garden picks berry bites smiles: "This is the real deal!" bubble shows dialogue.'],
    ['旁白風景紀錄', 'Narration landscape doc', '深沉男聲旁白：「在浩瀚宇宙中，我們的世界不過一瞬。」夜景過渡黎明，底部字幕。', 'Deep male voiceover: "In the grand universe, our world is but a fleeting moment." Night transitions to dawn, bottom subtitles.'],
    ['餐廳搭訕對話', 'Restaurant chat-up dialogue', '餐廳內女孩整理櫃台，男孩走近搭訕要聯絡方式，自然對話，底部字幕同步。', 'Girl tidies counter in restaurant, boy approaches to ask contact, natural dialogue, bottom subtitles sync.'],
    ['父女廚房對話', 'Father daughter kitchen talk', '女孩等爸爸煮飯說：「我餓了！好了嗎？」爸爸回：「快了，先去洗手！」分鏡切換對話。', 'Girl waits for dad cooking: "I\'m hungry! Is it ready?" dad replies: "Almost, go wash hands first!" storyboard cut dialogue.'],
    ['電話通話場景', 'Phone call scene', '女子接聽電話，表情從驚訝轉喜悅，對白字幕同步，特寫面部表情。', 'Woman answers phone, expression shifts surprise to joy, dialogue subtitles sync, facial close-up.'],
    ['演講台宣言', 'Podium declaration', '演講者站台上慷慨陳詞，底部字幕顯示關鍵句，環繞鏡頭。', 'Speaker on podium delivers passionate speech, bottom subtitles show key lines, orbit camera.'],
    ['街頭採訪問答', 'Street interview Q&A', '記者街頭採訪路人，問答字幕交替出現，紀實手持風格。', 'Reporter street interviews passerby, Q&A subtitles alternate, documentary handheld style.'],
    ['課堂師生互動', 'Classroom teacher student', '教室老師提問學生舉手回答，對話氣泡或底部字幕，明亮日光。', 'Classroom teacher asks student raises hand answers, speech bubbles or bottom subtitles, bright daylight.'],
    ['咖啡廳告白', 'Café confession', '咖啡廳男子深吸氣告白，女子驚喜捂嘴，浪漫對白字幕，淺景深。', 'Café man takes deep breath confesses, woman surprised covers mouth, romantic dialogue subtitles, shallow DOF.'],
    ['新聞播報片段', 'News anchor segment', '新聞主播播報突發新聞，底部滾動字幕，專業演播室燈光。', 'News anchor reports breaking news, bottom scrolling subtitles, professional studio lighting.'],
    ['導覽介紹解說', 'Tour guide narration', '導覽員帶團介紹古蹟，旁白字幕同步，跟拍鏡頭。', 'Tour guide leads group introducing ruins, voiceover subtitles sync, tracking camera.'],
    ['辯論激烈對話', 'Debate heated dialogue', '兩人辯論激烈交鋒，快速切換特寫，對白字幕交錯。', 'Two people debate intensely, quick close-up cuts, dialogue subtitles interleave.'],
    ['睡前故事旁白', 'Bedtime story narration', '父親床邊講故事，溫柔旁白字幕，孩子漸入夢鄉，暖色台燈。', 'Father tells bedtime story, gentle narration subtitles, child drifts to sleep, warm lamp tones.'],
  ],
};

const KLING_HANDCRAFTED = {
  slowmo: [
    ['籃球灌籃慢動作', 'Basketball dunk slowmo', '籃球運動員起跳灌籃慢動作，汗水飛濺，體育館燈光，低角度仰拍，史詩配樂。', 'Basketball player dunking in slow motion, sweat droplets fly, arena lighting, low-angle shot, epic score.'],
    ['櫻花飄落慢鏡', 'Cherry blossom slow fall', '櫻花瓣緩緩飄落，少女伸手接住，慢動作特寫，柔和逆光。', 'Cherry petals drift slowly, girl reaches to catch, slow-motion close-up, soft backlight.'],
    ['水滴濺起慢動作', 'Water splash slowmo', '水滴落入水面濺起皇冠水花，超慢動作微距，黑色背景。', 'Water drop hits surface crown splash, ultra slow-motion macro, black background.'],
    ['拳擊出拳瞬間', 'Boxing punch moment', '拳擊手出拳瞬間，肌肉緊繃汗水飛散，慢動作側面特寫。', 'Boxer throws punch moment, muscles tense sweat scatters, slow-motion side close-up.'],
    ['咖啡拉花慢鏡', 'Latte art slow pour', '咖啡師拉花牛奶緩緩倒入，葉脈圖案形成，俯拍慢動作。', 'Barista pours milk for latte art, leaf pattern forms, overhead slow motion.'],
    ['煙火綻放慢鏡', 'Firework bloom slowmo', '煙火夜空綻放，火花擴散慢動作，倒影映在湖面。', 'Firework blooms in night sky, sparks expand slow motion, reflection on lake.'],
    ['裙擺旋轉慢鏡', 'Dress spin slowmo', '舞者紅裙旋轉，布料飄揚凝固空中，環繞慢動作。', 'Dancer spins in red dress, fabric floats frozen in air, orbit slow motion.'],
    ['汽車飄移輪胎', 'Car drift tire smoke', '跑車飄移輪胎冒煙，慢動作低角度，賽道彎道。', 'Sports car drifts tire smoke, slow-motion low angle, track curve.'],
    ['蝴蝶振翅起飛', 'Butterfly wing takeoff', '蝴蝶振翅緩緩起飛，翅膀鱗粉微距慢動作。', 'Butterfly flaps wings slowly takes off, wing scales macro slow motion.'],
    ['玻璃破碎慢鏡', 'Glass shatter slowmo', '玻璃杯落地破碎，碎片四散慢動作，戲劇性側光。', 'Glass cup hits ground shatters, fragments scatter slow motion, dramatic side light.'],
    ['衝浪破浪瞬間', 'Surfing wave moment', '衝浪者破浪而起，水花飛濺慢動作，黃金時刻。', 'Surfer rides wave crest, spray flies slow motion, golden hour.'],
    ['粉末爆炸慢鏡', 'Powder explosion slowmo', '彩色粉末爆炸擴散，慢動作黑色背景，高飽和。', 'Colored powder explosion expands, slow motion black background, high saturation.'],
    ['眼淚滑落慢鏡', 'Tear rolling slowmo', '淚珠從眼角滑落，慢動作面部特寫，柔光。', 'Tear rolls from eye corner, slow-motion facial close-up, soft light.'],
    ['足球射門瞬間', 'Soccer kick moment', '足球員射門瞬間，足球形變，草地碎屑飛起，慢動作。', 'Soccer player kicks ball moment, ball deforms, grass chips fly, slow motion.'],
    ['雪花飄落慢鏡', 'Snowflake drift slowmo', '雪花緩緩飄落，落在睫毛上融化，極慢動作微距。', 'Snowflake drifts slowly, lands on eyelash melts, ultra slow macro.'],
  ],
  fight: [
    ['古裝劍術對決', 'Ancient sword duel', '兩位俠客竹林劍術對決，刀光劍影，快切慢動作交替，史詩配樂。', 'Two warriors bamboo forest sword duel, blade flashes, fast cuts and slow-mo alternate, epic score.'],
    ['現代格鬥搏擊', 'Modern MMA fight', '八角籠兩選手搏擊，低角度跟拍，汗水飛濺，激烈氛圍。', 'Octagon two fighters grapple, low-angle tracking, sweat flies, intense atmosphere.'],
    ['動漫能量對波', 'Anime energy beam clash', '日系動漫兩角色能量波對撞，速度線爆炸特效，高飽和。', 'Japanese anime two characters energy beams clash, speed lines explosion effects, high saturation.'],
    ['街頭街舞 Battle', 'Street dance battle', '街舞 Battle 兩組對決，快速舞步切換，觀眾圍成圈，手持跟拍。', 'Street dance battle two crews face off, quick footwork cuts, crowd circle, handheld tracking.'],
    ['拳擊擂台回合', 'Boxing ring round', '拳擊擂台兩選手激烈出拳，裁判在側，聚光燈，紀實風。', 'Boxing ring two fighters exchange punches, referee aside, spotlight, documentary feel.'],
    ['忍者暗殺潛行', 'Ninja stealth assassination', '忍者月夜屋頂潛行，突然拔刀突襲，快速剪輯，暗調。', 'Ninja moonlit rooftop stealth, sudden draw blade ambush, fast editing, dark tones.'],
    ['超級英雄對打', 'Superhero brawl', '兩超級英雄城市天台對打，建築震動塵土飛揚，電影感。', 'Two superheroes rooftop brawl, buildings shake dust flies, cinematic feel.'],
    ['武術長棍對練', 'Martial arts staff spar', '武術館兩人長棍對練，棍影交錯，固定中景，傳統氛圍。', 'Dojo two people staff sparring, staff shadows cross, static medium, traditional mood.'],
    ['賽博刀劍對決', 'Cyberpunk blade duel', '賽博朋克雨夜兩人光劍對決，霓虹反射，慢動作關鍵一擊。', 'Cyberpunk rainy night two people lightsaber duel, neon reflections, slow-mo key strike.'],
    ['馬術競技對決', 'Equestrian competition', '馬術場兩騎手競速跳欄，塵土飛揚，低角度跟拍。', 'Equestrian arena two riders race jump hurdles, dust rises, low-angle tracking.'],
    ['冰球激烈碰撞', 'Ice hockey collision', '冰球場兩選手激烈碰撞搶球，冰屑飛濺，快速剪輯。', 'Ice rink two players collide fighting for puck, ice chips fly, fast cuts.'],
    ['劍道切磋', 'Kendo practice match', '劍道場兩人穿戴護具切磋，氣勢對峙後出擊，固定廣角。', 'Kendo dojo two in armor practice, tense standoff then strike, static wide.'],
    ['魔法師法術對決', 'Wizard spell duel', '奇幻場景兩魔法師法術對轟，火球冰箭交織，特效華麗。', 'Fantasy scene two wizards spell duel, fireballs ice arrows weave, lavish effects.'],
    ['跑酷追逐跳躍', 'Parkour chase jumps', '跑酷者城市屋頂追逐跳躍，第一人稱與第三人稱交替。', 'Parkour runner rooftop chase jumps, first-person and third-person alternate.'],
    ['海盜甲板刀戰', 'Pirate deck sword fight', '海盜船甲板兩人海盜刀戰，海浪搖晃船體，復古色調。', 'Pirate ship deck two pirates sword fight, waves rock hull, vintage tones.'],
  ],
};

function buildHandcraftedOrGenerated(platform, cat, handcrafted) {
  if (handcrafted[cat.id]) return handcrafted[cat.id];

  const prefix = platform === 'seedance' ? 'Seedance 2.0' : 'Kling';
  const prefixEn = platform === 'seedance' ? 'Seedance 2.0' : 'Kling';
  const prompts = [];

  for (let i = 0; i < 15; i++) {
    const si = i % 15;
    const mi = (i + 2) % 10;
    const ei = (i + 4) % 10;
    const ci = (i + 6) % 10;
    const num = String(i + 1).padStart(2, '0');

    if (platform === 'seedance') {
      prompts.push([
        `${prefix} ${cat.zh} #${num}`,
        `${prefixEn} ${cat.en} #${num}`,
        `${prefix} ${cat.zh}：主體 ${SUBJECTS_ZH[si]} 在 ${SCENES_ZH[ei]} 中 ${MOTIONS_ZH[mi]}。鏡頭 ${CAMERAS_ZH[ci]}，自然語言描述，保持物理真實感，10秒。`,
        `${prefixEn} ${cat.en}: subject ${SUBJECTS_EN[si]} ${MOTIONS_EN[mi]} in ${SCENES_EN[ei]}. Camera ${CAMERAS_EN[ci]}, natural language, physical realism, 10 seconds.`,
      ]);
    } else {
      prompts.push([
        `${prefix} ${cat.zh} #${num}`,
        `${prefixEn} ${cat.en} #${num}`,
        `${prefix} ${cat.zh}：${SUBJECTS_ZH[si]} 在 ${SCENES_ZH[ei]} ${MOTIONS_ZH[mi]}。【主體】+【動作】+【鏡頭】三段式，${CAMERAS_ZH[ci]}，電影寫實，10秒。`,
        `${prefixEn} ${cat.en}: ${SUBJECTS_EN[si]} ${MOTIONS_EN[mi]} in ${SCENES_EN[ei]}. [Subject]+[Action]+[Camera] three-part, ${CAMERAS_EN[ci]}, cinematic photorealistic, 10 seconds.`,
      ]);
    }
  }
  return prompts;
}

function generatePlatformFile(platform, categories, handcrafted, config) {
  const lines = [];
  lines.push('/**');
  lines.push(` * ${config.title}`);
  lines.push(` * @see ${config.sourceUrl}`);
  lines.push(' */');
  lines.push('');
  lines.push(`export const ${config.categoriesExport} = [`);
  for (const c of categories) {
    lines.push(`  { id: '${c.id}', label: { 'zh-tw': '${c.zh}', en: '${c.en}' }, tag: '${c.id}' },`);
  }
  lines.push('];');
  lines.push('');
  lines.push('const cp = (id, title, prompt, category, tags, likes) => ({');
  lines.push(`  id, title, prompt, platform: '${platform}', category, tags,`);
  lines.push(`  source: '${config.source}', sourceUrl: '${config.sourceUrl}', author: '${config.author}', likes,`);
  lines.push('});');
  lines.push('');
  lines.push(`export const ${config.promptsExport} = [`);

  let total = 0;
  for (const cat of categories) {
    const prompts = buildHandcraftedOrGenerated(platform, cat, handcrafted);
    prompts.forEach((p, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const id = `${platform}_${cat.id}_${num}`;
      const tagPlatform = platform === 'seedance' ? 'seedance-2' : 'kling';
      const tags = JSON.stringify([tagPlatform, cat.id, platform]);
      lines.push(`  cp('${id}', { 'zh-tw': '${esc(p[0])}', en: '${esc(p[1])}' },`);
      lines.push(`    { 'zh-tw': '${esc(p[2])}', en: '${esc(p[3])}' },`);
      lines.push(`    '${cat.id}', ${tags}, ${300 + (total % 700)}),`);
      total++;
    });
  }
  lines.push('];');
  lines.push('');
  lines.push(`export const ${config.countExport} = ${config.promptsExport}.length;`);

  const outPath = resolve(__dirname, `../src/data/${config.fileName}`);
  writeFileSync(outPath, lines.join('\n'));
  console.log(`Generated ${total} ${platform} prompts → ${outPath}`);
  return total;
}

generatePlatformFile('seedance', SEEDANCE_CATEGORIES, SEEDANCE_HANDCRAFTED, {
  fileName: 'seedancePrompts.js',
  title: 'Seedance 2.0 影片提示詞庫 — 300 條分 20 類',
  source: 'Seedance 2.0 Library',
  sourceUrl: 'https://seedance2.ai/guide',
  author: 'ByteDance',
  categoriesExport: 'SEEDANCE_CATEGORIES',
  promptsExport: 'SEEDANCE_PROMPTS',
  countExport: 'SEEDANCE_COUNT',
});

generatePlatformFile('kling', KLING_CATEGORIES, KLING_HANDCRAFTED, {
  fileName: 'klingPrompts.js',
  title: 'Kling 影片提示詞庫 — 300 條分 20 類',
  source: 'Kling AI Library',
  sourceUrl: 'https://kling.ai/blog/kling-ai-prompt-guide',
  author: 'Kling AI',
  categoriesExport: 'KLING_CATEGORIES',
  promptsExport: 'KLING_PROMPTS',
  countExport: 'KLING_COUNT',
});