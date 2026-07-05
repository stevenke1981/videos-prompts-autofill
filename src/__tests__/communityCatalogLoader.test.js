import { describe, expect, it, vi } from 'vitest';
import { COMMUNITY_PLATFORM_MANIFEST } from '../data/communityPlatformManifest';
import {
  createCommunityCatalogLoader,
  mergeCommunityPlatformPayload,
} from '../services/communityCatalogLoader';

const testManifestEntry = (load, count = 1) => ({
  id: 'test',
  count,
  promptsExport: 'TEST_PROMPTS',
  categoriesExport: 'TEST_CATEGORIES',
  load,
});

describe('community platform manifest', () => {
  it('defines unique platforms whose expected counts total 1000', () => {
    const ids = COMMUNITY_PLATFORM_MANIFEST.map((entry) => entry.id);
    const count = COMMUNITY_PLATFORM_MANIFEST.reduce((sum, entry) => sum + entry.count, 0);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'general',
      'seedance',
      'kling',
      'grok',
      'runway',
      'sora',
      'pika',
      'minimax',
      'luma',
      'hailuo',
    ]);
    expect(count).toBe(1000);
  });
});

describe('community catalog loader', () => {
  it('shares one in-flight load and caches a successful platform payload', async () => {
    const load = vi.fn(async () => ({
      TEST_PROMPTS: [{ id: 'one', platform: 'test' }],
      TEST_CATEGORIES: [{ id: 'cinematic', label: { en: 'Cinematic' } }],
    }));
    const loader = createCommunityCatalogLoader([testManifestEntry(load)]);

    const [first, second] = await Promise.all([
      loader.loadPlatform('test'),
      loader.loadPlatform('test'),
    ]);
    const third = await loader.loadPlatform('test');

    expect(first).toBe(second);
    expect(third).toBe(first);
    expect(load).toHaveBeenCalledTimes(1);
    expect(loader.getLoadedPlatformIds()).toEqual(['test']);
  });

  it('removes a failed Promise so retry can load the platform', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ TEST_PROMPTS: [], TEST_CATEGORIES: [] });
    const loader = createCommunityCatalogLoader([testManifestEntry(load, 0)]);

    await expect(loader.loadPlatform('test')).rejects.toThrow('offline');
    await expect(loader.loadPlatform('test')).resolves.toMatchObject({
      platformId: 'test',
      prompts: [],
    });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads platforms sequentially and isolates one platform error', async () => {
    const order = [];
    const loaded = [];
    const failed = [];
    const manifest = [
      {
        ...testManifestEntry(async () => {
          order.push('first');
          return { FIRST_PROMPTS: [{ id: 'first' }] };
        }),
        id: 'first',
        promptsExport: 'FIRST_PROMPTS',
        categoriesExport: null,
      },
      {
        ...testManifestEntry(async () => {
          order.push('broken');
          throw new Error('broken');
        }),
        id: 'broken',
        promptsExport: 'BROKEN_PROMPTS',
        categoriesExport: null,
      },
      {
        ...testManifestEntry(async () => {
          order.push('last');
          return { LAST_PROMPTS: [{ id: 'last' }] };
        }),
        id: 'last',
        promptsExport: 'LAST_PROMPTS',
        categoriesExport: null,
      },
    ];
    const loader = createCommunityCatalogLoader(manifest);

    const summary = await loader.loadAll({
      onPlatformLoaded: (payload) => loaded.push(payload.platformId),
      onPlatformError: (platformId) => failed.push(platformId),
    });

    expect(order).toEqual(['first', 'broken', 'last']);
    expect(loaded).toEqual(['first', 'last']);
    expect(failed).toEqual(['broken']);
    expect(summary.loaded.map((payload) => payload.platformId)).toEqual(['first', 'last']);
    expect(summary.errors.map(({ platformId }) => platformId)).toEqual(['broken']);
  });

  it('replaces one platform slice without duplicating prompts', () => {
    const first = { platformId: 'test', prompts: [{ id: 'one' }], categories: [] };
    const second = { platformId: 'test', prompts: [{ id: 'two' }], categories: [] };

    const result = mergeCommunityPlatformPayload({ test: first }, second);

    expect(result.test.prompts).toEqual([{ id: 'two' }]);
    expect(Object.keys(result)).toEqual(['test']);
  });
});
