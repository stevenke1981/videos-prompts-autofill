import { getLocalized } from '../utils/helpers';

export const communityPromptToTemplate = (item, language = 'zh-tw') => {
  const title = getLocalized(item.title, language);
  const prompt = getLocalized(item.prompt, language);

  return {
    id: `tpl_community_${item.id}_${Date.now()}`,
    name: `${title}（社群）`,
    content: prompt,
    selections: {},
    tags: [item.platform, ...(item.tags || [])].filter(
      (value, index, allValues) => allValues.indexOf(value) === index
    ),
    author: item.author || item.source,
    language: ['zh-tw', 'en'],
  };
};
