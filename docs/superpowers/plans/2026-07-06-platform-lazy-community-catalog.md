# Platform-Lazy Community Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1,000-prompt community catalog into platform-specific dynamic chunks while preserving the unified discovery waterfall, search, filtering, retry, and import behavior.

**Architecture:** Keep platform data files as the chunk boundaries and introduce a lightweight manifest plus a Promise-caching loader. `DiscoveryView` renders built-in templates first, progressively merges loaded platform payloads, and exposes partial-result progress and platform-local retry. Move template conversion out of the synchronous full-catalog search service so no production entry path statically imports all community data.

**Tech Stack:** React 18, Vite 5 dynamic imports, Vitest, Playwright, ESLint 8, Node.js bundle verification

---

## File Structure

- Create `src/data/generalPrompts.js`: the three general prompts currently embedded in the aggregate catalog.
- Create `src/data/communityPlatformManifest.js`: platform IDs, expected counts, export names, order, and dynamic import functions.
- Create `src/services/communityCatalogLoader.js`: injectable Promise cache, normalized payloads, sequential background loading, retry, and merge helper.
- Create `src/services/communityTemplate.js`: catalog-independent `communityPromptToTemplate`.
- Create `src/__tests__/communityCatalogLoader.test.js`: cache, retry, ordering, counts, and merge tests.
- Modify `src/data/communityPrompts.js`: preserve the synchronous aggregate only for tests/tooling, now importing `GENERAL_PROMPTS`.
- Modify `src/services/communitySearch.js`: re-export conversion for compatibility but keep it out of runtime imports.
- Modify `src/App.jsx`: import conversion from the lightweight module.
- Modify `src/components/DiscoveryView.jsx`: progressive platform state, priority loading, progress, and retry UI.
- Modify `src/constants/translations.js`: loading, partial-result, error, and retry labels.
- Modify `e2e/smoke.spec.js`: platform selection and progressive community integration.
- Create `scripts/check-bundle-size.mjs`: fail when any production JS chunk exceeds 500 KiB or the entry does not improve over the 874.18 kB baseline.
- Modify `package.json`: add `build:check`.
- Modify `README.md`, `docs/cbm-review-2026-07-05.md`, `test.md`, `todos.md`, and `final.md`: measured before/after evidence.

### Task 1: Decouple General Prompts and Template Conversion

**Files:**
- Create: `src/data/generalPrompts.js`
- Create: `src/services/communityTemplate.js`
- Modify: `src/data/communityPrompts.js`
- Modify: `src/services/communitySearch.js`
- Modify: `src/App.jsx`
- Modify: `src/__tests__/communitySearch.test.js`

- [x] **Step 1: Add a failing catalog-independence test**

Add an assertion that `communityPromptToTemplate` imported from `../services/communityTemplate` converts a fixture without importing or receiving the aggregate catalog:

```js
import { communityPromptToTemplate } from '../services/communityTemplate';

it('converts a community item from the catalog-independent module', () => {
  const item = {
    id: 'fixture',
    title: { 'zh-tw': '測試', en: 'Fixture' },
    prompt: { 'zh-tw': '提示', en: 'Prompt' },
    platform: 'seedance',
    tags: ['cinematic'],
    author: 'Author',
  };
  const template = communityPromptToTemplate(item, 'en');
  expect(template.name).toBe('Fixture（社群）');
  expect(template.tags).toEqual(['seedance', 'cinematic']);
});
```

- [x] **Step 2: Run the focused test and confirm RED**

Run: `npx vitest run src/__tests__/communitySearch.test.js`

Expected: FAIL because `src/services/communityTemplate.js` does not exist.

- [x] **Step 3: Move conversion into the lightweight service**

Create `communityTemplate.js` with the existing conversion implementation and only one import:

```js
import { getLocalized } from '../utils/helpers';

export const communityPromptToTemplate = (item, language = 'zh-tw') => {
  const title = getLocalized(item.title, language);
  const prompt = getLocalized(item.prompt, language);
  return {
    id: `tpl_community_${item.id}_${Date.now()}`,
    name: `${title}（社群）`,
    content: prompt,
    selections: {},
    tags: [item.platform, ...(item.tags || [])].filter((value, index, all) =>
      all.indexOf(value) === index
    ),
    author: item.author || item.source,
    language: ['zh-tw', 'en'],
  };
};
```

`communitySearch.js` re-exports this symbol for compatibility. `App.jsx` imports it directly from `communityTemplate.js`.

- [x] **Step 4: Move general prompts into their own platform module**

Create `generalPrompts.js` exporting `GENERAL_PROMPTS`, `GENERAL_CATEGORIES = []`, and `GENERAL_COUNT`. Update the synchronous aggregate so its public count remains exactly 1,000.

- [x] **Step 5: Run focused tests and confirm GREEN**

Run: `npx vitest run src/__tests__/communitySearch.test.js`

Expected: all community search and conversion tests pass.

### Task 2: Platform Manifest and Promise-Caching Loader

**Files:**
- Create: `src/data/communityPlatformManifest.js`
- Create: `src/services/communityCatalogLoader.js`
- Create: `src/__tests__/communityCatalogLoader.test.js`

- [x] **Step 1: Write failing manifest and loader tests**

Use an injected two-platform manifest to prove cache and retry behavior without mocking native dynamic import:

```js
import { describe, expect, it, vi } from 'vitest';
import {
  createCommunityCatalogLoader,
  mergeCommunityPlatformPayload,
} from '../services/communityCatalogLoader';

it('shares one in-flight platform load and caches success', async () => {
  const load = vi.fn(async () => ({
    TEST_PROMPTS: [{ id: 'one', platform: 'test' }],
    TEST_CATEGORIES: [{ id: 'cinematic', label: { en: 'Cinematic' } }],
  }));
  const loader = createCommunityCatalogLoader([{
    id: 'test',
    count: 1,
    promptsExport: 'TEST_PROMPTS',
    categoriesExport: 'TEST_CATEGORIES',
    load,
  }]);
  const [first, second] = await Promise.all([
    loader.loadPlatform('test'),
    loader.loadPlatform('test'),
  ]);
  expect(first).toBe(second);
  expect(load).toHaveBeenCalledTimes(1);
  await loader.loadPlatform('test');
  expect(load).toHaveBeenCalledTimes(1);
});

it('removes a failed Promise so retry can succeed', async () => {
  const load = vi.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ TEST_PROMPTS: [], TEST_CATEGORIES: [] });
  const loader = createCommunityCatalogLoader([{
    id: 'test',
    count: 0,
    promptsExport: 'TEST_PROMPTS',
    categoriesExport: 'TEST_CATEGORIES',
    load,
  }]);
  await expect(loader.loadPlatform('test')).rejects.toThrow('offline');
  await expect(loader.loadPlatform('test')).resolves.toMatchObject({ platformId: 'test' });
  expect(load).toHaveBeenCalledTimes(2);
});

it('replaces one platform slice without duplicating prompts', () => {
  const first = { platformId: 'test', prompts: [{ id: 'one' }], categories: [] };
  const second = { platformId: 'test', prompts: [{ id: 'two' }], categories: [] };
  expect(mergeCommunityPlatformPayload({ test: first }, second).test.prompts)
    .toEqual([{ id: 'two' }]);
});
```

Also assert that production manifest IDs are unique and expected counts sum to 1,000.

- [x] **Step 2: Run the focused test and confirm RED**

Run: `npx vitest run src/__tests__/communityCatalogLoader.test.js`

Expected: FAIL because manifest and loader modules do not exist.

- [x] **Step 3: Implement the platform manifest**

Each entry defines:

```js
{
  id,
  count,
  promptsExport,
  categoriesExport,
  load: () => import('./platformPrompts'),
}
```

Use the approved order: general, seedance, kling, grok, runway, sora, pika, minimax, luma, hailuo.

- [x] **Step 4: Implement the loader**

`createCommunityCatalogLoader(manifest)` returns:

```js
{
  loadPlatform(platformId),
  loadAll({ onPlatformLoaded, onPlatformError }),
  getPlatform(platformId),
  getLoadedPlatformIds(),
}
```

Validate platform IDs and exported arrays, share in-flight Promises, retain successful payloads, delete failed cache entries, and load all platforms sequentially so the callback order is deterministic.

- [x] **Step 5: Run focused tests and confirm GREEN**

Run: `npx vitest run src/__tests__/communityCatalogLoader.test.js`

Expected: manifest and loader tests pass.

### Task 3: Progressive Unified Discovery Runtime

**Files:**
- Modify: `src/components/DiscoveryView.jsx`
- Modify: `src/constants/translations.js`
- Modify: `e2e/smoke.spec.js`

- [x] **Step 1: Update the E2E expectation before runtime implementation**

Change the community smoke flow to:

```js
await expect(page.getByTestId('community-load-status')).toBeVisible();
await page.getByRole('button', { name: /^Seedance 2\.0$|^seedance$/i }).click();
const grid = page.getByTestId('unified-discovery-grid');
await expect(grid.getByTestId('community-template-card').first()).toBeVisible();
```

The final click must still open the editor.

- [x] **Step 2: Run the focused E2E test and confirm RED**

Run: `npx playwright test e2e/smoke.spec.js --grep "community templates"`

Expected: FAIL because no progressive load status exists and `DiscoveryView` still statically imports the aggregate catalog.

- [x] **Step 3: Add progressive platform state**

Remove the static `COMMUNITY_PROMPTS` and `communitySearch` imports. Track:

```js
const [communityPlatforms, setCommunityPlatforms] = useState({});
const [loadingPlatforms, setLoadingPlatforms] = useState([]);
const [platformErrors, setPlatformErrors] = useState({});
```

Flatten prompts in manifest order. Derive selected categories from the loaded platform payload.

- [x] **Step 4: Add cached priority and background loading**

After first render, call `communityCatalogLoader.loadAll` and merge each callback result. Platform button selection calls the same cached `loadPlatform` immediately, so an in-flight background request is reused.

- [x] **Step 5: Add progress, partial result semantics, and retry**

Expose `data-testid="community-load-status"` while fewer than ten platforms are loaded. Result text distinguishes complete from partial data. A selected failed platform shows its error and a retry button that clears only that platform error.

- [x] **Step 6: Run focused unit and E2E checks**

Run:

```powershell
npx vitest run src/__tests__/communityCatalogLoader.test.js src/__tests__/discoveryFeed.test.js
npx playwright test e2e/smoke.spec.js --grep "community templates"
```

Expected: all focused checks pass.

### Task 4: Durable Bundle Gate

**Files:**
- Create: `scripts/check-bundle-size.mjs`
- Modify: `package.json`

- [x] **Step 1: Create the build checker**

Read `dist/assets/*.js`, fail if:

- no JavaScript files exist;
- any file is greater than `500 * 1024` bytes;
- the largest entry-like chunk is not smaller than the 874,180-byte baseline.

Print a sorted table of file names and byte sizes on success and failure.

- [x] **Step 2: Add the package script**

```json
"build:check": "npm run build && node scripts/check-bundle-size.mjs"
```

- [x] **Step 3: Run the bundle gate**

Run: `npm run build:check`

Expected: platform-specific chunks are listed, every JS chunk is below 500 KiB, and the command exits 0.

If the entry is still too large, use Vite `build.rollupOptions.output.manualChunks` only for stable vendor groups (`react`, `lucide-react`, `html2canvas`) and rerun the same gate.

### Task 5: Documentation, CBM Re-index, Verification, and Commit

**Files:**
- Modify: `README.md`
- Modify: `docs/cbm-review-2026-07-05.md`
- Modify: `test.md`
- Modify: `todos.md`
- Modify: `final.md`

- [x] **Step 1: Record measured before/after results**

Document the 874.18 kB baseline, final entry size, platform chunk names/sizes, progressive behavior, error isolation, and exact test counts.

- [x] **Step 2: Run complete verification**

Run:

```powershell
npm test
npm run lint
npm run build:check
npm run test:e2e
```

Expected: every command exits 0.

- [x] **Step 3: Incrementally re-index CBM**

Re-index `cbm+videos-prompts-autofill` and confirm the manifest, loader, and `DiscoveryView` symbols appear. Verify with `rg` that neither `App.jsx` nor `DiscoveryView.jsx` statically imports `communityPrompts.js` or `communitySearch.js`.

- [x] **Step 4: Review the final diff**

Run:

```powershell
git status --short
git diff --check
git diff --stat
```

Expected: no whitespace errors, generated build output, test output, `_ref`, secrets, or unrelated edits.

- [x] **Step 5: Commit**

```powershell
git add src e2e scripts package.json README.md docs test.md todos.md final.md
git commit -m "perf: lazy load community prompts by platform"
```

Expected: the optimization is committed on `master`; no push occurs unless separately requested.
