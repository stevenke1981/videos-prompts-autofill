import { describe, it, expect } from 'vitest';
import {
  searchCommunityPrompts,
  communityPromptToTemplate,
  COMMUNITY_DATA_VERSION,
  getCommunityPlatforms,
  getGrokCategories,
  getSeedanceCategories,
  getKlingCategories,
  getRunwayCategories,
  getSoraCategories,
  getPlatformCategoryLabel,
  normalizeCommunityCategory,
} from '../services/communitySearch';
import {
  COMMUNITY_PROMPTS,
  COMMUNITY_PROMPTS_COUNT,
  GROK_IMAGINE_COUNT,
  SEEDANCE_COUNT,
  KLING_COUNT,
  RUNWAY_COUNT,
  SORA_COUNT,
  PIKA_COUNT,
  MINIMAX_COUNT,
  LUMA_COUNT,
  HAILUO_COUNT,
} from '../data/communityPrompts';
import { SEEDANCE_PROMPTS } from '../data/seedancePrompts';
import { KLING_PROMPTS } from '../data/klingPrompts';
import { GROK_IMAGINE_PROMPTS } from '../data/grokImaginePrompts';
import { RUNWAY_PROMPTS } from '../data/runwayPrompts';
import { SORA_PROMPTS } from '../data/soraPrompts';

describe('communitySearch', () => {
  it('has exactly 300 prompts per major platform', () => {
    expect(SEEDANCE_COUNT).toBe(300);
    expect(KLING_COUNT).toBe(300);
    expect(GROK_IMAGINE_COUNT).toBe(300);
    expect(SEEDANCE_PROMPTS.length).toBe(300);
    expect(KLING_PROMPTS.length).toBe(300);
    expect(GROK_IMAGINE_PROMPTS.length).toBe(300);
  });

  it('has extra platform prompt counts', () => {
    expect(RUNWAY_COUNT).toBe(30);
    expect(SORA_COUNT).toBe(30);
    expect(PIKA_COUNT).toBe(10);
    expect(MINIMAX_COUNT).toBe(10);
    expect(LUMA_COUNT).toBe(10);
    expect(HAILUO_COUNT).toBe(7);
    expect(RUNWAY_PROMPTS.length).toBe(30);
    expect(SORA_PROMPTS.length).toBe(30);
  });

  it('returns exactly 1000 total community prompts', () => {
    const results = searchCommunityPrompts('');
    expect(results.length).toBe(COMMUNITY_PROMPTS.length);
    expect(COMMUNITY_PROMPTS_COUNT).toBe(1000);
    expect(results.length).toBe(1000);
  });

  it('filters seedance platform with 300 results', () => {
    const results = searchCommunityPrompts('', { platform: 'seedance' });
    expect(results.length).toBe(300);
    results.forEach((item) => expect(item.platform).toBe('seedance'));
  });

  it('filters kling platform with 300 results', () => {
    const results = searchCommunityPrompts('', { platform: 'kling' });
    expect(results.length).toBe(300);
    results.forEach((item) => expect(item.platform).toBe('kling'));
  });

  it('filters runway platform with 30 results', () => {
    const results = searchCommunityPrompts('', { platform: 'runway' });
    expect(results.length).toBe(30);
    results.forEach((item) => expect(item.platform).toBe('runway'));
  });

  it('filters sora platform with 30 results', () => {
    const results = searchCommunityPrompts('', { platform: 'sora' });
    expect(results.length).toBe(30);
    results.forEach((item) => expect(item.platform).toBe('sora'));
  });

  it('filters seedance category multimodal', () => {
    const results = searchCommunityPrompts('', { platform: 'seedance', category: 'multimodal' });
    expect(results.length).toBe(15);
    results.forEach((item) => expect(item.category).toBe('multimodal'));
  });

  it('filters kling category slowmo', () => {
    const results = searchCommunityPrompts('', { platform: 'kling', category: 'slowmo' });
    expect(results.length).toBe(15);
    results.forEach((item) => expect(item.category).toBe('slowmo'));
  });

  it('filters grok category surreal', () => {
    const results = searchCommunityPrompts('', { platform: 'grok', category: 'surreal' });
    expect(results.length).toBe(15);
    results.forEach((item) => expect(item.category).toBe('surreal'));
  });

  it('filters runway category cinematic', () => {
    const results = searchCommunityPrompts('', { platform: 'runway', category: 'cinematic' });
    expect(results.length).toBe(5);
    results.forEach((item) => expect(item.category).toBe('cinematic'));
  });

  it('filters sora category physics', () => {
    const results = searchCommunityPrompts('', { platform: 'sora', category: 'physics' });
    expect(results.length).toBe(5);
    results.forEach((item) => expect(item.category).toBe('physics'));
  });

  it('searches seedance video-edit keyword', () => {
    const results = searchCommunityPrompts('Video 1', { platform: 'seedance', category: 'video-edit' }, 'en');
    expect(results.length).toBeGreaterThan(0);
  });

  it('converts seedance prompt to template', () => {
    const item = SEEDANCE_PROMPTS[0];
    const template = communityPromptToTemplate(item, 'zh-tw');
    expect(template.id).toMatch(/^tpl_community_/);
    expect(template.tags).toContain('seedance');
  });

  it('has community data version 1.3.0', () => {
    expect(COMMUNITY_DATA_VERSION).toBe('1.3.0');
  });

  it('lists 20 categories per major platform and 6 for runway/sora', () => {
    expect(getSeedanceCategories().length).toBe(20);
    expect(getKlingCategories().length).toBe(20);
    expect(getGrokCategories().length).toBe(20);
    expect(getRunwayCategories().length).toBe(6);
    expect(getSoraCategories().length).toBe(6);
    expect(getPlatformCategoryLabel('seedance', 'multimodal', 'zh-tw')).toBe('多模態參考');
    expect(getPlatformCategoryLabel('kling', 'slowmo', 'en')).toBe('Slow Motion');
    expect(getPlatformCategoryLabel('runway', 'cinematic', 'zh-tw')).toBe('電影感場景');
    expect(getPlatformCategoryLabel('sora', 'physics', 'en')).toBe('Physical Realism');
  });

  it('lists all platforms including new ones', () => {
    const platforms = getCommunityPlatforms();
    expect(platforms).toContain('seedance');
    expect(platforms).toContain('kling');
    expect(platforms).toContain('grok');
    expect(platforms).toContain('runway');
    expect(platforms).toContain('sora');
    expect(platforms).toContain('pika');
    expect(platforms).toContain('minimax');
    expect(platforms).toContain('luma');
    expect(platforms).toContain('hailuo');
    expect(platforms).toContain('general');
  });

  it('resets a category that does not belong to the selected platform', () => {
    expect(normalizeCommunityCategory('seedance', 'multimodal')).toBe('multimodal');
    expect(normalizeCommunityCategory('kling', 'multimodal')).toBe('all');
    expect(normalizeCommunityCategory('all', 'cinematic')).toBe('all');
  });
});
