# Unified Template Waterfall Design

## Goal

Replace the separate community tab with one discovery experience where built-in and community video-prompt templates appear on the original page. Replace the inherited software-agent cover art with purpose-built video-generation artwork, fix confirmed project errors, and preserve the current editor and local-first storage behavior.

## Scope

- Keep `DiscoveryView` as the single discovery surface on desktop and mobile.
- Display built-in and community entries in one searchable, filterable waterfall.
- Keep community entries read-only until the user selects one; only then convert it to a persisted editable template.
- Generate 15 new text-free cinematic covers, one for each built-in template.
- Give community cards a deterministic cover selected from the new platform-appropriate artwork.
- Fix the missing ESLint configuration and the category state bug when switching community platforms.
- Record CBM findings, completed work, and verification in `todos.md`, `test.md`, and `final.md`.
- Do not add production dependencies or change the package manager.

## Unified Presentation Model

Discovery cards will use a small normalized shape:

```js
{
  key,
  source: 'builtin' | 'community',
  title,
  imageUrl,
  tags,
  platform,
  popularity,
  template,
  communityItem,
}
```

Built-in templates are mapped from the existing persisted `templates` state. Community cards are mapped from the existing static prompt dataset without being inserted into LocalStorage. The normalized model is presentation-only and does not replace either source model.

## User Experience

- Remove the `templates` / `community` tab switch.
- Keep one search field and one set of source, platform, and category filters above the waterfall.
- Show a clear source badge on every card.
- Built-in cards keep their current preview/select behavior.
- Selecting a community card converts it through `communityPromptToTemplate`, persists the resulting template, selects it, and opens the editor.
- Render an initial bounded page of cards and expose a “load more” action. Changing search or filters resets pagination.
- Empty and error states remain inline and do not block access to built-in templates.

## Images

The 15 built-in templates receive individual portrait-oriented cinematic illustrations tailored to their actual video-generation purpose. Artwork must contain no logos, words, watermarks, UI screenshots, or recognizable copyrighted characters. A consistent dark cinematic palette with controlled accent colors will keep the waterfall coherent.

Final assets live under `public/template-covers/video/` and `src/data/templates.js` references those project-local files. Legacy development-agent covers remain unreferenced and will be removed only after confirming no source file uses them.

## Error Handling and Compatibility

- Community conversion continues to use the existing conversion service and toast feedback.
- Missing artwork falls back to a CSS gradient card instead of a broken image.
- Existing persisted user templates remain valid; only system template image URLs change.
- The current bilingual data and editor template language behavior remain unchanged.
- External source links retain `noopener noreferrer`.

## Quality and Performance

- Add a project ESLint configuration matching the existing React/Vite stack.
- Correct category reset behavior when the selected platform changes.
- Avoid persisting the full community catalog.
- Bound initial DOM size through pagination.
- Keep all image references local so discovery does not depend on third-party image hosts.
- Treat the current large JavaScript bundle warning as a documented follow-up unless a safe, measurable split is possible without delaying the core integration.

## Verification

1. Add unit coverage for unified card mapping, filtering, pagination, deterministic community artwork, and category reset logic where practical.
2. Run the narrowest new tests first.
3. Run `npm test`, `npm run lint`, and `npm run build`.
4. Run the existing Playwright smoke suite and add or update a flow proving a community card is visible in the original waterfall and opens in the editor.
5. Inspect generated covers and verify every referenced path exists.
6. Review the final diff and commit only project files, excluding `_ref`, build output, test output, and local CBM artifacts.

## Acceptance Criteria

- No separate community tab remains.
- Built-in and community templates are discoverable on the original page with unified search/filter controls.
- Community templates do not enter persistent user state until selected.
- All 15 built-in templates use new generated video-themed covers.
- `npm run lint` completes successfully.
- Unit tests, production build, and relevant E2E checks pass.
- `todos.md`, `test.md`, and `final.md` contain the review findings and final evidence.
- The completed implementation is committed in the root Git repository.
