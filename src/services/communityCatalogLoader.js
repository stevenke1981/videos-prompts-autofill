import { COMMUNITY_PLATFORM_MANIFEST } from '../data/communityPlatformManifest';

export const mergeCommunityPlatformPayload = (current, payload) => ({
  ...current,
  [payload.platformId]: payload,
});

export const createCommunityCatalogLoader = (manifest = COMMUNITY_PLATFORM_MANIFEST) => {
  const manifestById = new Map(manifest.map((entry) => [entry.id, entry]));
  const promises = new Map();
  const payloads = new Map();

  const loadPlatform = (platformId) => {
    const entry = manifestById.get(platformId);
    if (!entry) {
      return Promise.reject(new Error(`Unknown community platform: ${platformId}`));
    }
    if (payloads.has(platformId)) return Promise.resolve(payloads.get(platformId));
    if (promises.has(platformId)) return promises.get(platformId);

    const promise = Promise.resolve()
      .then(() => entry.load())
      .then((module) => {
        const prompts = module[entry.promptsExport];
        const categories = entry.categoriesExport ? module[entry.categoriesExport] : [];

        if (!Array.isArray(prompts)) {
          throw new Error(`Platform ${platformId} did not export ${entry.promptsExport}`);
        }
        if (!Array.isArray(categories)) {
          throw new Error(`Platform ${platformId} categories must be an array`);
        }
        if (prompts.length !== entry.count) {
          throw new Error(
            `Platform ${platformId} expected ${entry.count} prompts but loaded ${prompts.length}`
          );
        }

        const payload = {
          platformId,
          prompts,
          categories,
          count: prompts.length,
        };
        payloads.set(platformId, payload);
        return payload;
      })
      .catch((error) => {
        promises.delete(platformId);
        throw error;
      });

    promises.set(platformId, promise);
    return promise;
  };

  const loadAll = async ({ onPlatformLoaded, onPlatformError } = {}) => {
    const loaded = [];
    const errors = [];

    for (const entry of manifest) {
      try {
        const payload = await loadPlatform(entry.id);
        loaded.push(payload);
        onPlatformLoaded?.(payload);
      } catch (error) {
        errors.push({ platformId: entry.id, error });
        onPlatformError?.(entry.id, error);
      }
    }

    return { loaded, errors };
  };

  return {
    loadPlatform,
    loadAll,
    getPlatform: (platformId) => payloads.get(platformId) || null,
    getLoadedPlatformIds: () =>
      manifest.filter((entry) => payloads.has(entry.id)).map((entry) => entry.id),
  };
};

export const communityCatalogLoader = createCommunityCatalogLoader();
