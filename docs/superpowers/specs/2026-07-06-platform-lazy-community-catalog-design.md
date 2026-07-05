# Platform-Lazy Community Catalog Design

## Goal

Reduce the initial JavaScript payload by removing the static 1,000-prompt community catalog from the application entry chunk. Built-in templates must render immediately, while community prompts load progressively in platform-specific chunks without breaking the unified discovery waterfall.

## Current Evidence

- Production JavaScript is one 874.18 kB chunk (202.90 kB gzip).
- `seedancePrompts.js`, `klingPrompts.js`, and `grokImaginePrompts.js` total about 424 kB of source before the remaining platform files.
- `DiscoveryView` statically imports `COMMUNITY_PROMPTS`.
- `App.jsx` imports `communityPromptToTemplate` from `communitySearch.js`, which also statically imports the complete community catalog.

## Platform Manifest

Create a lightweight manifest that is safe to include in the initial bundle:

```js
[
  { id: 'general', count: 3, load: () => import('./generalPrompts') },
  { id: 'seedance', count: 300, load: () => import('./seedancePrompts') },
  { id: 'kling', count: 300, load: () => import('./klingPrompts') },
  { id: 'grok', count: 300, load: () => import('./grokImaginePrompts') },
  { id: 'runway', count: 30, load: () => import('./runwayPrompts') },
  { id: 'sora', count: 30, load: () => import('./soraPrompts') },
  { id: 'pika', count: 10, load: () => import('./pikaPrompts') },
  { id: 'minimax', count: 10, load: () => import('./minimaxPrompts') },
  { id: 'luma', count: 10, load: () => import('./lumaPrompts') },
  { id: 'hailuo', count: 7, load: () => import('./hailuoPrompts') },
]
```

The manifest exposes IDs, expected counts, loading order, and loader functions. Prompt arrays and platform category definitions remain in their existing platform modules.

## Loader and Cache

Add a platform loader service with module-level caches:

- `loadCommunityPlatform(platformId)` returns one normalized platform payload.
- Concurrent calls for the same platform share one Promise.
- Successful results remain cached for the application session.
- Failed Promises are removed from the cache so retry can perform a new import.
- `loadAllCommunityPlatforms({ onPlatformLoaded })` loads in manifest order and reports each platform independently.
- One platform failure does not reject or discard successful platforms.

The general prompts currently embedded in `communityPrompts.js` move into `generalPrompts.js` so they receive the same loader contract.

## Runtime Data Flow

1. `DiscoveryView` renders built-in templates with an empty community list.
2. After the first committed render, background loading begins in manifest order:
   `general → seedance → kling → grok → runway → sora → pika → minimax → luma → hailuo`.
3. Each completed platform is merged into community state by platform ID. Repeated completions replace the platform slice instead of duplicating items.
4. Selecting a platform filter immediately prioritizes `loadCommunityPlatform(platformId)`.
5. The unified feed continues to receive one flattened community array, so existing card normalization, deterministic artwork, filtering, pagination, and import-on-select behavior remain unchanged.

## Search and Progress Semantics

- Source `builtin` never waits for community data.
- Source `all` and `community` show the results currently available plus a progress message such as “Loading community platforms 4/10”.
- While not all platforms are loaded, the UI must not imply that the visible count is the final global result count.
- Selecting a platform shows that platform’s loading state until it is available.
- Category controls appear only after the selected platform payload has loaded and use that module’s category metadata.
- Search text is applied immediately to all loaded platforms; remaining platforms continue loading in the background.

## Error Handling

- Track error state per platform.
- A failed platform displays a compact retry action when that platform is selected.
- In the all-platform view, failures are summarized without hiding successful results.
- Retry clears only that platform’s error and reuses the normal loader path.
- Built-in cards and editor navigation remain available during all community loading and error states.

## Decoupling Template Conversion

Move `communityPromptToTemplate` into a catalog-independent module that imports only localization helpers. `App.jsx` must import this lightweight conversion module, not `communitySearch.js`.

`communitySearch.js` may remain as a synchronous full-catalog utility for tests and non-runtime tooling, but no production entry path may import it.

## Testing

### Unit

- Platform manifest IDs and expected counts total 1,000.
- A platform loader returns the correct prompt array and categories.
- Duplicate concurrent loads share one Promise/result.
- Successful loads are cached.
- Failed loads can be retried.
- Platform results merge without duplicates.
- Community template conversion remains catalog-independent.

### E2E

- Built-in cards are visible before community loading completes.
- A loading/progress indicator is exposed for community data.
- Selecting Seedance loads and displays Seedance community cards.
- Selecting a community card still creates a local template and opens the editor.
- Existing editor, bank search, and theme smoke paths continue to pass.

### Build

- No statically imported complete catalog from `App.jsx` or `DiscoveryView`.
- Platform prompt modules appear as separate production chunks.
- Initial entry JavaScript is materially smaller than 874.18 kB.
- No JavaScript chunk exceeds 500 kB.

## Documentation

Update:

- `docs/cbm-review-2026-07-05.md` with measured before/after bundle evidence.
- `test.md` with loader and progressive-loading coverage.
- `todos.md` with the new optimization phase.
- `final.md` and `README.md` with platform-lazy behavior and verification results.

## Acceptance Criteria

- Built-in templates render without downloading the full community catalog.
- Community prompts load and appear incrementally by platform.
- Selecting a platform prioritizes and isolates that platform’s load.
- A platform failure is retryable and does not block other content.
- Community search never labels partial data as a complete global result.
- Existing template import and local persistence behavior remains unchanged.
- All unit, lint, build, and E2E checks pass.
- Build output proves platform-specific chunks and an initial entry below the previous 874.18 kB baseline.
