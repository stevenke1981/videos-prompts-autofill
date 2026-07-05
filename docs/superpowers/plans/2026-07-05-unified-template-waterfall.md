# Unified Template Waterfall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge built-in and community video-prompt templates into one paginated discovery waterfall, replace the inherited agent artwork, fix confirmed lint/filter errors, verify the application, and commit the result.

**Architecture:** Add a pure discovery-feed utility that normalizes and filters both data sources without persisting the community catalog. Rebuild `DiscoveryView` around one shared grid and retain the existing callback boundary for converting a community item only when selected. Keep generated artwork project-local and map community cards deterministically to platform-appropriate covers.

**Tech Stack:** React 18, Vite 5, Tailwind CSS, Vitest, Testing Library, Playwright, ESLint 8, Codex built-in image generation

---

## File Structure

- Create `src/utils/discoveryFeed.js`: normalized feed model, deterministic cover mapping, filtering, and pagination constants.
- Create `src/__tests__/discoveryFeed.test.js`: pure behavior coverage for the unified feed.
- Modify `src/components/DiscoveryView.jsx`: one set of controls and one waterfall for both sources.
- Modify `src/components/CommunitySearchPanel.jsx`: fix platform/category state consistency; retain the component for compatibility until all imports are removed.
- Modify `src/data/templates.js`: point each system template at its new generated cover.
- Create `.eslintrc.cjs`: restore the existing `npm run lint` contract.
- Modify `e2e/smoke.spec.js`: prove community cards appear on the original page and open in the editor.
- Modify `todos.md`, `test.md`, and `final.md`: capture CBM findings and verification evidence.
- Create `public/template-covers/video/*.webp`: 15 generated, text-free, web-optimized video-template covers.
- Delete unreferenced `public/template-covers/*.jpg` legacy agent artwork after an `rg` reference check.

### Task 1: Pure Unified Feed Model

**Files:**
- Create: `src/utils/discoveryFeed.js`
- Create: `src/__tests__/discoveryFeed.test.js`

- [ ] **Step 1: Write failing normalization and filtering tests**

Cover built-in/community source fields, localized community titles, deterministic platform covers, source/platform/category/query filters, and a 24-item page boundary.

```js
import { describe, expect, it } from 'vitest';
import {
  DISCOVERY_PAGE_SIZE,
  buildDiscoveryFeed,
  filterDiscoveryFeed,
} from '../utils/discoveryFeed';

describe('discovery feed', () => {
  it('normalizes both sources without mutating them', () => {
    const templates = [{ id: 'tpl_1', name: 'Built in', tags: ['seedance'], imageUrl: '/a.png' }];
    const community = [{
      id: 'community_1',
      title: { 'zh-tw': '社群範例', en: 'Community example' },
      prompt: { 'zh-tw': '提示', en: 'Prompt' },
      platform: 'seedance',
      category: 'cinematic',
      tags: ['cinematic'],
      likes: 9,
    }];
    const feed = buildDiscoveryFeed({ templates, community, language: 'en' });
    expect(feed.map((item) => item.source)).toEqual(['builtin', 'community']);
    expect(feed[1].title).toBe('Community example');
    expect(feed[1].communityItem).toBe(community[0]);
  });

  it('filters and limits one page', () => {
    const feed = Array.from({ length: DISCOVERY_PAGE_SIZE + 2 }, (_, index) => ({
      key: String(index),
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
    expect(result.visible).toHaveLength(DISCOVERY_PAGE_SIZE);
    expect(result.hasMore).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npx vitest run src/__tests__/discoveryFeed.test.js`

Expected: FAIL because `src/utils/discoveryFeed.js` does not exist.

- [ ] **Step 3: Implement the pure feed utility**

Export `DISCOVERY_PAGE_SIZE = 24`, `COMMUNITY_COVER_BY_PLATFORM`, `buildDiscoveryFeed`, and `filterDiscoveryFeed`. Search text must include localized title/prompt, platform, category, tags, source, and author. The function returns `{ all, visible, hasMore }` after filtering and slicing.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `npx vitest run src/__tests__/discoveryFeed.test.js`

Expected: all discovery-feed tests pass.

### Task 2: Unified Discovery UI

**Files:**
- Modify: `src/components/DiscoveryView.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/index.js`
- Modify: `src/constants/translations.js`

- [ ] **Step 1: Add a failing E2E assertion for the unified page**

Update the discovery flow so it expects a single search control, visible source filters, a community card in the same main grid, no community-tab button, and clicking the community card to open the editor.

- [ ] **Step 2: Run the focused E2E test and confirm RED**

Run: `npx playwright test e2e/smoke.spec.js --grep "community"`

Expected: FAIL because the separate community tab still exists.

- [ ] **Step 3: Replace the tab state with unified filters**

`DiscoveryView` imports `COMMUNITY_PROMPTS`, `getPlatformCategories`, `getPlatformCategoryLabel`, and the pure feed helpers. It owns `query`, `source`, `platform`, `category`, and `visibleCount`; resets category on platform change and resets pagination whenever any filter changes.

- [ ] **Step 4: Render one shared grid**

Use one card component for desktop and mobile. Built-in cards call the existing template selection and preview callbacks. Community cards show a source badge, platform/category metadata, deterministic cover, short localized prompt, and call `onImportCommunityTemplate(item)` when selected. A load-more button increments `visibleCount` by `DISCOVERY_PAGE_SIZE`.

- [ ] **Step 5: Remove obsolete tab wiring**

Delete `CommunitySearchPanel` imports/usages from `DiscoveryView`. Keep the exported component temporarily if tests or external imports still reference it, but remove it from `src/components/index.js` when no runtime import remains.

- [ ] **Step 6: Run unit and E2E checks**

Run:

```powershell
npx vitest run src/__tests__/discoveryFeed.test.js src/__tests__/communitySearch.test.js
npx playwright test e2e/smoke.spec.js --grep "community"
```

Expected: focused checks pass.

### Task 3: Confirmed Error Fixes

**Files:**
- Create: `.eslintrc.cjs`
- Modify: `src/components/CommunitySearchPanel.jsx`
- Modify: `src/__tests__/communitySearch.test.js`

- [ ] **Step 1: Add the category-reset regression case**

Extract or export a small platform/category normalization helper and assert that switching to a different platform resets an incompatible category to `all`.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npx vitest run src/__tests__/communitySearch.test.js`

Expected: the new regression case fails before the helper exists.

- [ ] **Step 3: Implement category normalization**

Remove the redundant `activeCategoryPlatform` ternary and ensure category state cannot refer to a category from another platform.

- [ ] **Step 4: Restore ESLint configuration**

Create `.eslintrc.cjs` for browser/ES2022/React modules, extend `eslint:recommended`, enable `react-hooks` recommendations, disable React-in-scope requirements for the automatic JSX transform, and ignore `_ref`, `dist`, `node_modules`, coverage, and test output.

- [ ] **Step 5: Run lint and fix only actionable project findings**

Run: `npm run lint`

Expected: exit code 0 with zero warnings.

### Task 4: Generate and Wire Video Artwork

**Files:**
- Create: `public/template-covers/video/*.png`
- Modify: `src/data/templates.js`
- Modify: `src/__tests__/seedData.test.js`
- Delete: unreferenced `public/template-covers/*.jpg`

- [ ] **Step 1: Update the seed-data contract**

Require every built-in template to reference a unique local path matching:

```js
expect(template.imageUrl).toMatch(/^\.\/template-covers\/video\/.+\.webp$/);
expect(new Set(INITIAL_TEMPLATES_CONFIG.map((template) => template.imageUrl)).size)
  .toBe(INITIAL_TEMPLATES_CONFIG.length);
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npx vitest run src/__tests__/seedData.test.js`

Expected: FAIL because current templates share inherited agent JPG covers.

- [ ] **Step 3: Generate 15 distinct covers with the built-in image tool**

Use one generation call per template. Shared constraints: portrait cinematic key art, coherent dark indigo/charcoal palette with restrained platform-specific accents, clear focal subject, no text, no letters, no logos, no watermark, no UI screenshots, and no recognizable copyrighted characters.

- [ ] **Step 4: Copy generated files into stable project paths**

Use these names:

```text
seedance-general.webp
seedance-multimodal.webp
seedance-video-edit.webp
seedance-dialogue.webp
kling-cinematic.webp
kling-product-ad.webp
kling-action-reference.webp
grok-creative-short.webp
runway-narrative.webp
sora-style-story.webp
anime-fight.webp
commercial-15s.webp
landscape-timelapse.webp
image-to-video.webp
camera-choreography.webp
```

- [ ] **Step 5: Wire and validate assets**

Update each `imageUrl`, run the seed-data test, use `rg` to prove legacy JPGs are no longer referenced, delete only those unreferenced files, and visually inspect representative generated covers.

### Task 5: Documentation, Full Verification, and Commit

**Files:**
- Modify: `todos.md`
- Modify: `test.md`
- Modify: `final.md`

- [ ] **Step 1: Record the CBM review**

Document confirmed defects, implemented improvements, deferred bundle-size recommendation, and the exact affected files.

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: all commands exit 0. Record exact test counts and any non-blocking build warnings.

- [ ] **Step 3: Re-index and review changed paths with CBM**

Run an incremental CBM index, inspect the unified feed symbols and `DiscoveryView` connections, and verify the community conversion path still terminates in the editor.

- [ ] **Step 4: Review the Git diff**

Run:

```powershell
git status --short
git diff --check
git diff --stat
```

Expected: no whitespace errors, no `_ref`, build output, test output, secrets, or unrelated changes.

- [ ] **Step 5: Commit the implementation**

```powershell
git add .eslintrc.cjs e2e public/template-covers src todos.md test.md final.md docs/superpowers/plans/2026-07-05-unified-template-waterfall.md
git commit -m "feat: unify video template discovery"
```

Expected: a focused implementation commit on top of the baseline and design commits.
