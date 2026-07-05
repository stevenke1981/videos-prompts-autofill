import { describe, expect, it } from 'vitest';
import {
  DISCOVERY_PAGE_SIZE,
  buildDiscoveryFeed,
  filterDiscoveryFeed,
  getCommunityCover,
} from '../utils/discoveryFeed';

const builtinTemplate = {
  id: 'tpl_seedance',
  name: { 'zh-tw': '內建模板', en: 'Built-in template' },
  content: 'A cinematic camera move',
  tags: ['seedance', 'cinematic'],
  author: 'Video Prompts Autofill',
  imageUrl: './template-covers/video/seedance-general.webp',
};

const communityPrompt = {
  id: 'community_1',
  title: { 'zh-tw': '社群範例', en: 'Community example' },
  prompt: { 'zh-tw': '電影感運鏡', en: 'Cinematic camera movement' },
  platform: 'seedance',
  category: 'cinematic',
  tags: ['camera', 'cinematic'],
  likes: 9,
  author: 'Creator',
  source: 'Community',
};

describe('unified discovery feed', () => {
  it('normalizes built-in and community items without persisting community data', () => {
    const feed = buildDiscoveryFeed({
      templates: [builtinTemplate],
      community: [communityPrompt],
      language: 'en',
    });

    expect(feed).toHaveLength(2);
    expect(feed.map((item) => item.source)).toEqual(['builtin', 'community']);
    expect(feed[0]).toMatchObject({
      key: 'builtin:tpl_seedance',
      title: 'Built-in template',
      template: builtinTemplate,
    });
    expect(feed[1]).toMatchObject({
      key: 'community:community_1',
      title: 'Community example',
      platform: 'seedance',
      category: 'cinematic',
      communityItem: communityPrompt,
    });
    expect(feed[1].template).toBeNull();
  });

  it('assigns a stable local cover to the same community item', () => {
    const first = getCommunityCover(communityPrompt);
    const second = getCommunityCover({ ...communityPrompt });

    expect(first).toBe(second);
    expect(first).toMatch(/^\.\/template-covers\/video\/.+\.webp$/);
  });

  it('filters across source, platform, category, and localized search text', () => {
    const feed = buildDiscoveryFeed({
      templates: [builtinTemplate],
      community: [communityPrompt],
      language: 'zh-tw',
    });

    const result = filterDiscoveryFeed(feed, {
      query: '電影感',
      source: 'community',
      platform: 'seedance',
      category: 'cinematic',
      visibleCount: DISCOVERY_PAGE_SIZE,
    });

    expect(result.all).toHaveLength(1);
    expect(result.visible[0].communityItem).toBe(communityPrompt);
    expect(result.hasMore).toBe(false);
  });

  it('returns one bounded page and reports additional results', () => {
    const feed = Array.from({ length: DISCOVERY_PAGE_SIZE + 2 }, (_, index) => ({
      key: `community:${index}`,
      source: 'community',
      title: `Seedance ${index}`,
      searchText: `seedance cinematic ${index}`,
      platform: 'seedance',
      category: 'cinematic',
    }));

    const result = filterDiscoveryFeed(feed, {
      query: 'cinematic',
      source: 'community',
      platform: 'seedance',
      category: 'cinematic',
      visibleCount: DISCOVERY_PAGE_SIZE,
    });

    expect(result.all).toHaveLength(DISCOVERY_PAGE_SIZE + 2);
    expect(result.visible).toHaveLength(DISCOVERY_PAGE_SIZE);
    expect(result.hasMore).toBe(true);
  });
});
