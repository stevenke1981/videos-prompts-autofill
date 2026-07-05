import { getLocalized } from './helpers';

export const DISCOVERY_PAGE_SIZE = 24;

const VIDEO_COVER_ROOT = './template-covers/video';

export const COMMUNITY_COVER_BY_PLATFORM = {
  seedance: [
    `${VIDEO_COVER_ROOT}/seedance-general.webp`,
    `${VIDEO_COVER_ROOT}/seedance-multimodal.webp`,
    `${VIDEO_COVER_ROOT}/seedance-video-edit.webp`,
    `${VIDEO_COVER_ROOT}/seedance-dialogue.webp`,
  ],
  kling: [
    `${VIDEO_COVER_ROOT}/kling-cinematic.webp`,
    `${VIDEO_COVER_ROOT}/kling-product-ad.webp`,
    `${VIDEO_COVER_ROOT}/kling-action-reference.webp`,
  ],
  grok: [`${VIDEO_COVER_ROOT}/grok-creative-short.webp`],
  runway: [`${VIDEO_COVER_ROOT}/runway-narrative.webp`],
  sora: [`${VIDEO_COVER_ROOT}/sora-style-story.webp`],
  pika: [`${VIDEO_COVER_ROOT}/image-to-video.webp`],
  minimax: [`${VIDEO_COVER_ROOT}/commercial-15s.webp`],
  luma: [`${VIDEO_COVER_ROOT}/camera-choreography.webp`],
  hailuo: [`${VIDEO_COVER_ROOT}/anime-fight.webp`],
  general: [
    `${VIDEO_COVER_ROOT}/landscape-timelapse.webp`,
    `${VIDEO_COVER_ROOT}/image-to-video.webp`,
    `${VIDEO_COVER_ROOT}/camera-choreography.webp`,
  ],
};

const KNOWN_PLATFORMS = new Set(Object.keys(COMMUNITY_COVER_BY_PLATFORM));

const normalize = (value) => String(value || '').toLocaleLowerCase().trim();

const stableIndex = (value, length) => {
  let hash = 0;
  for (const character of String(value || '')) {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }
  return length === 0 ? 0 : hash % length;
};

const inferBuiltinPlatform = (template) =>
  (template.tags || []).find((tag) => KNOWN_PLATFORMS.has(normalize(tag))) || 'general';

export const getCommunityCover = (item) => {
  const platform = normalize(item?.platform) || 'general';
  const covers = COMMUNITY_COVER_BY_PLATFORM[platform] || COMMUNITY_COVER_BY_PLATFORM.general;
  const identity = `${item?.id || ''}:${item?.category || ''}:${(item?.tags || []).join(':')}`;
  return covers[stableIndex(identity, covers.length)];
};

const normalizeBuiltinTemplate = (template, language) => {
  const title = getLocalized(template.name, language);
  const platform = normalize(inferBuiltinPlatform(template));
  const tags = template.tags || [];
  const content = getLocalized(template.content, language);

  return {
    key: `builtin:${template.id}`,
    source: 'builtin',
    title,
    excerpt: content,
    imageUrl: template.imageUrl || template.imageUrls?.[0] || '',
    tags,
    platform,
    category: '',
    popularity: 0,
    searchText: normalize(
      [title, content, platform, tags.join(' '), template.author, 'builtin built-in 內建'].join(' ')
    ),
    template,
    communityItem: null,
  };
};

const normalizeCommunityItem = (item, language) => {
  const title = getLocalized(item.title, language);
  const prompt = getLocalized(item.prompt, language);
  const platform = normalize(item.platform) || 'general';
  const category = normalize(item.category);
  const tags = item.tags || [];

  return {
    key: `community:${item.id}`,
    source: 'community',
    title,
    excerpt: prompt,
    imageUrl: getCommunityCover(item),
    tags,
    platform,
    category,
    popularity: item.likes || 0,
    searchText: normalize(
      [
        title,
        prompt,
        platform,
        category,
        tags.join(' '),
        item.author,
        item.source,
        'community 社群',
      ].join(' ')
    ),
    template: null,
    communityItem: item,
  };
};

export const buildDiscoveryFeed = ({ templates = [], community = [], language = 'zh-tw' }) => [
  ...templates.map((template) => normalizeBuiltinTemplate(template, language)),
  ...community.map((item) => normalizeCommunityItem(item, language)),
];

export const filterDiscoveryFeed = (
  feed,
  {
    query = '',
    source = 'all',
    platform = 'all',
    category = 'all',
    visibleCount = DISCOVERY_PAGE_SIZE,
  } = {}
) => {
  const normalizedQuery = normalize(query);
  const normalizedSource = normalize(source) || 'all';
  const normalizedPlatform = normalize(platform) || 'all';
  const normalizedCategory = normalize(category) || 'all';

  const all = feed.filter((item) => {
    if (normalizedSource !== 'all' && item.source !== normalizedSource) return false;
    if (normalizedPlatform !== 'all' && item.platform !== normalizedPlatform) return false;
    if (normalizedCategory !== 'all' && item.category !== normalizedCategory) return false;
    return !normalizedQuery || item.searchText.includes(normalizedQuery);
  });

  return {
    all,
    visible: all.slice(0, visibleCount),
    hasMore: all.length > visibleCount,
  };
};
