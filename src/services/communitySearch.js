import {
  COMMUNITY_PROMPTS,
  COMMUNITY_DATA_VERSION,
  GROK_IMAGINE_CATEGORIES,
  SEEDANCE_CATEGORIES,
  KLING_CATEGORIES,
  RUNWAY_CATEGORIES,
  SORA_CATEGORIES,
} from '../data/communityPrompts';
import { getLocalized } from '../utils/helpers';

export {
  COMMUNITY_DATA_VERSION,
  GROK_IMAGINE_CATEGORIES,
  SEEDANCE_CATEGORIES,
  KLING_CATEGORIES,
  RUNWAY_CATEGORIES,
  SORA_CATEGORIES,
};

const PLATFORM_CATEGORIES = {
  grok: GROK_IMAGINE_CATEGORIES,
  seedance: SEEDANCE_CATEGORIES,
  kling: KLING_CATEGORIES,
  runway: RUNWAY_CATEGORIES,
  sora: SORA_CATEGORIES,
};

const normalize = (text) => (text || '').toLowerCase().trim();

const getCategoryLabel = (platform, categoryId, language) => {
  const cats = PLATFORM_CATEGORIES[platform] || [];
  const cat = cats.find((c) => c.id === categoryId);
  return cat ? getLocalized(cat.label, language) : categoryId;
};

const getSearchableText = (item, language) => {
  const title = getLocalized(item.title, language);
  const prompt = getLocalized(item.prompt, language);
  const category = item.category || '';
  const catText = getCategoryLabel(item.platform, category, language);
  return normalize(
    `${title} ${prompt} ${item.platform} ${category} ${catText} ${item.tags.join(' ')} ${item.source} ${item.author || ''}`
  );
};

/**
 * 搜尋社群提示詞（本機索引，即時過濾）
 */
export const searchCommunityPrompts = (query = '', filters = {}, language = 'zh-tw') => {
  const q = normalize(query);
  const { platform, tag, category } = filters;

  return COMMUNITY_PROMPTS.filter((item) => {
    if (platform && platform !== 'all' && item.platform !== platform) return false;
    if (tag && !item.tags.includes(tag)) return false;
    if (category && category !== 'all' && item.category !== category) return false;
    if (!q) return true;
    return getSearchableText(item, language).includes(q);
  }).sort((a, b) => (b.likes || 0) - (a.likes || 0));
};

export const getCommunityPlatforms = () => {
  const platforms = new Set(COMMUNITY_PROMPTS.map((p) => p.platform));
  return ['all', ...Array.from(platforms).sort()];
};

export const getCommunityTags = () => {
  const tags = new Set();
  COMMUNITY_PROMPTS.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
};

export const getPlatformCategories = (platform) => PLATFORM_CATEGORIES[platform] || [];

export const getGrokCategories = () => GROK_IMAGINE_CATEGORIES;
export const getSeedanceCategories = () => SEEDANCE_CATEGORIES;
export const getKlingCategories = () => KLING_CATEGORIES;
export const getRunwayCategories = () => RUNWAY_CATEGORIES;
export const getSoraCategories = () => SORA_CATEGORIES;

export const getGrokCategoryLabel = (categoryId, language = 'zh-tw') =>
  getCategoryLabel('grok', categoryId, language);

export const getSeedanceCategoryLabel = (categoryId, language = 'zh-tw') =>
  getCategoryLabel('seedance', categoryId, language);

export const getKlingCategoryLabel = (categoryId, language = 'zh-tw') =>
  getCategoryLabel('kling', categoryId, language);

export const getRunwayCategoryLabel = (categoryId, language = 'zh-tw') =>
  getCategoryLabel('runway', categoryId, language);

export const getSoraCategoryLabel = (categoryId, language = 'zh-tw') =>
  getCategoryLabel('sora', categoryId, language);

export const getPlatformCategoryLabel = (platform, categoryId, language = 'zh-tw') =>
  getCategoryLabel(platform, categoryId, language);

/**
 * 將社群提示詞轉為可編輯模板
 */
export const communityPromptToTemplate = (item, language = 'zh-tw') => {
  const title = getLocalized(item.title, language);
  const prompt = getLocalized(item.prompt, language);

  return {
    id: `tpl_community_${item.id}_${Date.now()}`,
    name: `${title}（社群）`,
    content: prompt,
    selections: {},
    tags: [item.platform, ...(item.tags || [])].filter((v, i, a) => a.indexOf(v) === i),
    author: item.author || item.source,
    language: ['zh-tw', 'en'],
  };
};