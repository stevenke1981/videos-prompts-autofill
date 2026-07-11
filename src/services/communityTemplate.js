import { getLocalized } from '../utils/helpers';
import { withDeliverables } from '../constants/deliverables';

const PLATFORM_HINTS = {
  general: {
    'zh-tw': '通用影片生成 — 明確描述主體、動作、場景、鏡頭與風格',
    en: 'General video generation — describe subject, action, scene, camera, and style clearly',
  },
  seedance: {
    'zh-tw': 'Seedance — 使用自然語言描述動作，並明確標示多模態參考來源',
    en: 'Seedance — describe motion naturally and identify multimodal references explicitly',
  },
  kling: {
    'zh-tw': 'Kling — 依主體、動作、場景與運鏡順序撰寫，強調動態連續性',
    en: 'Kling — structure subject, action, scene, and camera while emphasizing motion continuity',
  },
  grok: {
    'zh-tw': 'Grok Imagine — 使用精簡、具象且視覺導向的創意描述',
    en: 'Grok Imagine — use concise, concrete, visually driven creative direction',
  },
  runway: {
    'zh-tw': 'Runway — 以鏡頭運動、場景變化與時間順序描述完整畫面',
    en: 'Runway — describe camera motion, scene changes, and temporal order as one coherent shot',
  },
  sora: {
    'zh-tw': 'Sora — 清楚描述物理互動、空間關係與時間連續性',
    en: 'Sora — specify physical interactions, spatial relationships, and temporal continuity',
  },
  pika: {
    'zh-tw': 'Pika — 聚焦短片動作、風格化效果與清楚的起訖狀態',
    en: 'Pika — focus on short-form motion, stylized effects, and clear start and end states',
  },
  minimax: {
    'zh-tw': 'MiniMax — 明確描述主體動作、運鏡節奏與氛圍變化',
    en: 'MiniMax — specify subject motion, camera pacing, and atmosphere changes',
  },
  luma: {
    'zh-tw': 'Luma — 使用電影化空間、自然運動與連續鏡頭描述',
    en: 'Luma — use cinematic space, natural motion, and continuous camera direction',
  },
  hailuo: {
    'zh-tw': '海螺 AI — 清楚描述角色動作、情緒、運鏡與場景節奏',
    en: 'Hailuo AI — specify character motion, emotion, camera, and scene pacing',
  },
};

const getPlatformHint = (platform) => PLATFORM_HINTS[platform] || PLATFORM_HINTS.general;

const getCompletePromptContent = (prompt) =>
  withDeliverables(
    typeof prompt === 'string'
      ? { 'zh-tw': prompt, en: prompt }
      : {
          'zh-tw': getLocalized(prompt, 'zh-tw'),
          en: getLocalized(prompt, 'en'),
        }
  );

export const communityPromptToTemplate = (item, language = 'zh-tw') => {
  const title = getLocalized(item.title, language);

  return {
    id: `tpl_community_${item.id}_${Date.now()}`,
    name: `${title}（社群）`,
    content: getCompletePromptContent(item.prompt),
    selections: {
      'platform_hint-0': getPlatformHint(item.platform),
    },
    tags: [item.platform, ...(item.tags || [])].filter(
      (value, index, allValues) => allValues.indexOf(value) === index
    ),
    author: item.author || item.source,
    language: ['zh-tw', 'en'],
  };
};
