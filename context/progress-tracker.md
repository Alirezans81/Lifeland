# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Foundation: Next.js 16 scaffolded, RTL and Persian font configured, Tailwind v4 with Lifelands color tokens and `cn()`, Vitest wired, API-derived types and the vendor guard in place. The pure `lib/` data layer (normalization, filter, sort, quality score) is not started.

## Current Goal

- Step 04: Persian normalization and `filterGames` (pure `lib/`, with tests). See Implementation Plan.

## Completed

- Extracted the assignment requirements into `context/` and the agent instruction file (now `AGENTS.md`).
- Inspected the live API (envelope, pagination, data quirks) and recorded findings in `architecture.md`.
- Feature 01 (init Next.js project): scaffolded Next.js 16.4.2 (React 19.3.0, TypeScript strict, Tailwind v4, ESLint, App Router, no `src/`, `@/*` alias, npm) in the repo root without touching the existing `context/` files. `npm run lint` and `npm run build` pass, and `next dev` serves `http://localhost:3000` with HTTP 200.
- RTL setup (per `node_modules/next/dist/docs`: root layout owns `<html>`, `next/font/google` with `variable`): `app/layout.tsx` now sets `lang="fa" dir="rtl"`, loads Vazirmatn (`arabic` + `latin` subsets, `display: swap`) as `--font-vazirmatn`, and has Persian metadata. `app/globals.css` maps `--font-sans` to it, with body `line-height: 1.8`. The starter `app/page.tsx` was replaced with a minimal RTL placeholder using logical utilities (`ps-*`, `border-s-*`). `npm run lint` and `npm run build` pass, and prerendered HTML contains `<html lang="fa" dir="rtl">`.
- Feature 02 (init UI themes): colors extracted from lifelands.ir and documented in `context/ui-context.md` (source table, light/dark tokens, measured WCAG contrast, radii, typography) together with the site's UI principles. `app/globals.css` defines the tokens as CSS variables (light on `:root`, dark via `prefers-color-scheme`), exposes them through `@theme inline` (`bg-base`, `bg-surface`, `text-primary`, `text-muted`, `bg-accent`, `border-border`, `text-error`, `text-success`, `rounded-pill`, and so on), and adds a global `:focus-visible` ring and a `prefers-reduced-motion` rule. `lib/cn.ts` exports `cn()` (`clsx` + `tailwind-merge`). Tailwind setup was switched from the `@tailwindcss/turbopack` loader to the documented `@tailwindcss/postcss` plugin in `postcss.config.mjs` (the loader rule was removed from `next.config.ts`; `@tailwindcss/postcss` and `postcss` moved to devDependencies). `AGENTS.md`, `README.md`, and `ui-context.md` were updated to match. Verified: `npm run lint` and `npm run build` pass; a temporary probe file confirmed the compiled CSS contains the token utilities and the dark media query (probe removed); `cn()` resolves conflicts (`px-2 px-4` becomes `px-4`) and drops falsy values.
- Feature 03 (test runner and API-derived types): spec in `context/features/03-test-runner-and-types.md`. Added Vitest 5 (`vitest.config.mts`: node environment, `@/` alias, includes `lib/**/*.test.ts` and `types/**/*.test.ts`; `npm run test` runs `vitest run`). Types were derived from a fresh live API sample (pages 1 to 5, 30 to 32, 60 to 63): `types/api.ts` (`ApiResponse<T>`, `ApiGame`, `GamesPage`, `GamesResponse`), `types/game.ts` (client-safe `Game` without `creator`), `types/sort.ts` (`SortKey` mapped over numeric `Game` keys minus `level` and `rating`, plus `quality`; `SearchSortKey` adds `relevance`), `types/filter.ts` (`FilterState` discriminated by `mode`). `lib/vendor.ts` has `VENDORS`, `Vendor`, and `isVendor`. Tests: `lib/cn.test.ts`, `lib/vendor.test.ts`, `types/filter.test.ts` (17 tests, with `@ts-expect-error` proofs that `tsc` verifies). Verified: `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## In Progress

- None.

## Next Up

- Step 04 of the Implementation Plan (below): `normalizePersian`, `filterGames`, and the empty-vendor policy.
- After step 04: step 05 (sorting, quality score, pagination-meta helpers).
- README placeholders and the AI Usage assessment are finished in step 14, but each step appends its decisions to the README as it lands.

## Implementation Plan

Steps 01 to 03 are done. Steps 04 to 14 follow the build order in `ai-workflow-rules.md` but are sized so each one is verifiable end to end and never mixes pure logic with UI, or server fetching with client interactivity. Each step gets a spec in `context/features/NN-name.md` when it starts. Every step ends with the "Before Finishing a Unit" checklist in `AGENTS.md` (tests for touched `lib/` code, `npm run build`, tracker and AI usage log updated).

### Step 01: Init Next.js project (done)

- Spec: `context/features/01-init-nextjs-project.md`.
- Scaffolded Next.js 16.4.2 (React 19.3.0, TypeScript strict, Tailwind v4, ESLint, App Router, no `src/`, `@/*` alias, npm) in the repo root without touching the existing `context/` files.
- Configured RTL once in `app/layout.tsx` (`<html lang="fa" dir="rtl">`), Vazirmatn through `next/font/google` as `--font-vazirmatn` mapped to `--font-sans`, Persian metadata, and a placeholder `app/page.tsx` using logical utilities.
- Verified: `npm run lint`, `npm run build`, and the dev server (HTTP 200); prerendered HTML contains `lang="fa" dir="rtl"`.

### Step 02: Init UI themes (done)

- Spec: `context/features/02-init-ui-themes.md`.
- Colors extracted from lifelands.ir and documented in `context/ui-context.md` together with the site's UI principles and measured WCAG contrast.
- Tailwind v4 initialized with `@tailwindcss/postcss` in `postcss.config.mjs` (Next.js 16 CSS docs); tokens defined in `app/globals.css` (light on `:root`, dark via `prefers-color-scheme`) and mapped with `@theme inline`; global focus ring and `prefers-reduced-motion` rule.
- `lib/cn.ts` exports `cn()` (`clsx` + `tailwind-merge`); `ui-context.md` requires `cn()` whenever classes are merged.
- Verified: `npm run lint`, `npm run build`, compiled CSS contains the token utilities and the dark media query, `cn()` resolves conflicting utilities. The `cn()` test was added in step 03.

### Step 03: Test runner and API-derived types (done)

- Spec: `context/features/03-test-runner-and-types.md`.
- Scope: add Vitest (node environment, `@/*` alias, `npm run test` script). Add a `cn()` test. Fetch the live API once more and derive `types/` from the real response (no copied types).
- `types/`: generic envelope `ApiResponse<T>`; page type `GamesPage` (`pageId`, `eachPerPage`, `total`, `games`); raw `ApiGame` with only the consumed fields (`_id`, `title`, `companyName`, `category.title`, `vitrinThirdPartyVendors`, `score`, `rating`, `like`, `level`, `runCount`, `seenCount`, `image`, `createdAtIso`); client-safe `Game` without `creator`.
- Narrowed types (tasks 5.2 to 5.4): `Vendor` union (`rubika` | `soroush`) plus `isVendor(value: string): value is Vendor` in `lib/`; `SortKey` derived by a mapped/conditional type from `Game` (numeric fields only, plus the quality key); `FilterState` as a discriminated union where an incompatible `sort`/`search` combination fails to compile.
- Compile-time proof: a type test using `@ts-expect-error` (never `@ts-ignore`) that rejects an invalid filter state and an invalid sort key. Unit tests for `isVendor`.
- Done: `npm run test` (17 tests), `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass; no `any` or `as unknown as`.
- Covers: 5.1, 5.2, 5.3, 5.4, test-runner decision.

### Step 04: Persian normalization and `filterGames`

- Scope (pure `lib/`, no React): `normalizePersian` (ی/ي and ک/ك unification, Persian and Arabic digits to Latin, ZWNJ removal, whitespace collapse and trim); `filterGames` for search over `title` and `companyName` (normalized on both sides), vendor multi-select, category (trimmed titles), score range, and favorites-only (accepts an id set).
- Apply the empty-vendor policy (8.3) here: pick included, excluded, or an "unspecified" bucket, based on the sampled data (26 of 48 games have none), and record the one-paragraph justification in `architecture.md` and the README.
- Tests: at least 3 for `normalizePersian` (digits, ی/ک, ZWNJ and whitespace) and 2 for `filterGames`, plus cases for category trimming, empty vendors, empty `companyName`, and an empty query.
- Done when: tests pass and `lib/` imports no React.
- Covers: Persian-aware search, vendor/category/score filters, 8.3, minimum unit tests.

### Step 05: Sorting, quality score, and pagination-meta helpers

- Scope (pure `lib/`): `sortGames` accepting only valid `SortKey`s (`score`, `runCount`, `seenCount`, `like`, `quality`) with a stable order and an explicit tie-break on `_id`; `qualityScore` blending `score`, `rating`, and `like` (8.2: `score` may be 0 while `rating` is nonzero; `level` stays separate), normalized so no single field dominates; document the formula in the README.
- 8.4 helper: a function that compares `total` and `eachPerPage` with the actual `games.length` and returns whether more pages exist, tolerating a short, long, or empty page without looping forever; plus a dedupe-by-`_id` merge for appended pages.
- Tests for every function above, including a zero-score game with a nonzero rating, equal keys, and the mismatch cases.
- Done when: tests pass; formula and mismatch behavior are written down.
- Covers: 8.2, 8.4 (logic), sort options, remaining `lib/` unit tests.

### Step 06: API client, boundary validation, image URL, and proxy route

- Scope: first resolve the open image question (find the real public host/path for relative `image` values via the live site or devtools; record it in `architecture.md`), then implement `resolveImageUrl` as a pure `lib/` function with tests.
- Server-only API client: fetch `GET /api/v1/games?pageId=N`, validate the unknown JSON at the boundary (envelope `state`, field types), map to `Game` (drop `creator`, trim category titles), and return a typed result or a typed error.
- Route handler (`app/api/games/route.ts`) that does one thing: validate `pageId` input (positive integer), call the client, and return a consistent `{ games, pageId, total, eachPerPage }` or error shape with proper status codes. Decide the `revalidate` value against `node_modules/next/dist/docs/` (Cache Components) and justify it in the README.
- Tests for the mapper/validator with fixture payloads (empty vendors, trailing-space category, empty company, malformed item).
- Done when: the route returns real data locally, malformed input returns a 400, and the browser never needs the Lifelands host.
- Covers: proxy requirement, API boundary validation, revalidate decision, 8.1 (URL resolution).

### Step 07: Server-rendered first page, game card, skeleton, and image fallback

- Scope (no filtering yet): the page stays a Server Component; the first page (12 games) is fetched in a Server Component and rendered inside `<Suspense>` with a skeleton that reuses the exact card dimensions and grid columns (no CLS). Decide whether `loading.tsx` is also used and explain route-level vs component-level streaming in the README.
- `GameCard` (Server Component by default): fixed image aspect ratio, title, company, vendor badges, score/like/run stats with Persian tabular digits, tokens from `ui-context.md`, `cn()` for merged classes, logical properties only.
- Image: `next/image` with explicit dimensions and lazy loading below the fold; a small client leaf that swaps to a placeholder rendered inside the same card box on error (8.1), not just hiding the image.
- Persian section header and storytelling line; responsive grid.
- Done when: the page renders 12 real cards in server HTML, the skeleton matches final dimensions, a broken image keeps the layout, and build passes.
- Covers: server render, Suspense and skeleton, card UI, 8.1 fallback, README list of Server vs Client components (started).

### Step 08: Hooks

- Scope: `useDebounce<T>(value, delay)`, `useUrlState<T>(key, defaultValue): [T, (v: T) => void]` (reads and writes the URL via the Next.js navigation APIs, serializes arrays and numbers, uses `replace` for typing and `push` where back/forward should restore), and `useFavorites()` returning `{ favorites: Set<string>; toggle }` (`localStorage`, SSR-safe so there is no hydration mismatch, handles storage being unavailable or corrupt).
- Each hook is independent and imports no other hook's internals. Add a jsdom and testing-library setup only if needed to test them; otherwise cover the serialization and storage parsing as pure `lib/` helpers with tests.
- Done when: each hook works in isolation (demonstrated through a test or a temporary harness that is then removed) and build passes.
- Covers: hooks requirements, `localStorage` favorites storage, URL state foundation.

### Step 09: Explorer shell with search, URL state, and empty state

- Scope: a client `GameExplorer` leaf that receives the server-fetched first page, owns interactivity, and renders the toolbar slot, grid, and result count. Search box (accessible label, 300ms debounce via `useDebounce`, input draft kept in local state, committed value in the URL via `useUrlState`). Filtering and sorting memoized with `useMemo` on `filterGames`/`sortGames`; memoized card component; `aria-live="polite"` result count.
- Empty state with a "reset filters" action that clears the URL state; also the error state with retry hook-up point.
- Done when: typing filters Persian text correctly (ی/ي, digits), the URL updates, reloading or sharing the link restores the same view, and typing stays responsive.
- Covers: search UX, URL as source of truth (search part), empty state, memoization.

### Step 10: Config-driven filters, toolbar, and sort

- Scope: one filter config file declaring vendor (multi-select), category, score range, and one extra filter that is not in the brief (pick it from the data, for example level or favorites-based, and add it by editing only the config to demonstrate the invariant; note it in the README). The toolbar renders from the config, so adding a filter touches no UI code.
- Vendor multi-select and category and sort dropdowns as hand-built accessible components (combobox/listbox roles, Escape closes, keyboard navigation, visible focus). Score range control. Sort select with all options including quality.
- Wire everything into the `FilterState` union and URL state; invalid combinations are impossible by type.
- Done when: every filter and sort combines correctly, state round-trips through the URL, keyboard-only use works, and the extra filter is documented.
- Covers: 6.3 config-driven filters, filter UI, sort UI, accessibility of dropdowns, `FilterState` in use.

### Step 11: Favorites

- Scope: favorite button on the card (`aria-pressed`, accessible name, visible focus) wired to `useFavorites`; favorites-only filter in the toolbar and URL; memoized cards so toggling one favorite does not re-render the whole list (verify with React Profiler or a render counter that is then removed).
- Optional micro-interaction (and sound/haptics) behind `prefers-reduced-motion`.
- Done when: favorites persist across reloads, favorites-only works with other filters, and only the toggled card re-renders.
- Covers: personalization, invariant 10, performance requirement.

### Step 12: Race-safe load more

- Scope: a "load more" button that requests the next page through the route handler with `AbortController` (or a request-ID guard; choose and justify in the README), a loading state, an error state with retry, and dedupe by `_id` when merging. Handle the `total` vs array-length mismatch from step 05 so the button disappears correctly instead of looping or crashing. Filters apply to loaded items only; document this client-side filtering limit and the decision for unloaded pages (open question).
- Done when: rapid clicks and filter changes never let a stale response overwrite fresh state (reproduced and recorded, optionally as a screen recording), and a past-the-end page yields a clean end state.
- Covers: Task 8.4 (behavior), race safety, load more vs pagination decision, async requirements.

### Step 13: Accessibility, performance, and polish

- Scope: keyboard and screen-reader pass (tab order, labels, live regions), contrast check in light and dark, `prefers-reduced-motion` for skeleton shimmer and motion, error boundary with retry (`error.tsx`), and a Lighthouse run. Optional bonuses by value: virtualized grid above 50 items, extra unit tests.
- Remove any leftover dead code, unused files, and `console.log`.
- Done when: no console errors, Lighthouse scores recorded, and the invariants in `architecture.md` all hold.
- Covers: accessibility, performance, dark mode, error boundary, bonus items.

### Step 14: README, final cleanup, and deploy

- Scope: finish the README (replace `<repository-url>`, exact tech versions, run steps, design decisions and trade-offs, TypeScript decisions, which components are Server Components and why, `revalidate` justification, quality formula, empty-vendor and mismatch notes, extra filter, honest AI Usage covering all six points from `ai-workflow-rules.md`), then deploy to Vercel or Netlify and add the link.
- Final audit: `npm run lint`, `npm run test`, `npm run build`, grep for forbidden constructs, `.gitignore` check, and the success criteria in `project-overview.md`.
- Done when: the deployed URL works with shared-link state restore and every deliverable in `project-overview.md` is present.
- Covers: README deliverable, AI disclosure, deployment, final success criteria.

### Requirement Coverage

| Requirement                                               | Step(s)    |
| --------------------------------------------------------- | ---------- |
| Server-rendered first 12 games, Suspense, no-CLS skeleton | 07         |
| Persian normalization and search                          | 04, 09     |
| Vendor, category, score filters (config-driven) + extra   | 04, 10     |
| Sort options and quality score                            | 05, 10     |
| URL as single source of truth                             | 08, 09, 10 |
| Favorites with `localStorage` and favorites-only          | 08, 11     |
| Load more, race safety, `total` mismatch                  | 05, 12     |
| Empty state and error handling                            | 09, 13     |
| Image resolution and fallback                             | 06, 07     |
| Strict API-derived types, vendor guard, `SortKey`, union  | 03         |
| Proxy route handler and boundary validation               | 06         |
| Unit tests (3+ normalize, 2+ filter, rest of `lib/`)      | 03 to 06   |
| Accessibility, performance, dark mode, bonuses            | 11, 13     |
| README with decisions and AI Usage, deploy                | 14         |

## Open Questions

- Image base URL (resolve in step 06): relative `image` paths (e.g. `game/file-....webp`) returned 404 on `lifelands.ir/`, `/game/`, `/api/v1/game/`, `/uploads/`. Find the real public host/path (browser devtools on the Lifelands site) before implementing 8.1.
- Load more vs pagination (decide in step 12): pick one and justify (leaning load more, since the API is page-based with `?pageId=N` and filtering is client-side).
- Client-side filtering only covers loaded items (decide in step 12): how search/filters interact with unloaded pages (729 total, 12 per page).
- Empty-vendor policy 8.3 (decide in step 04): included / excluded / "unspecified" bucket. Sampled data: 26 of 48 games have an empty array; in a later 117-game sample the field was also missing entirely on 27 games (never `null`), so the policy must cover empty and missing.
- `revalidate` value for the server fetch (decide in step 06).
- Which unrequested filter to add for Task 6.3 (decide in step 10).
- Whether the API supports server-side search via `searchValue` (test in step 06; not tested yet).

## Architecture Decisions

- Vitest runs in the `node` environment only (no jsdom or Testing Library yet; add them when component tests are needed). The alias is a regex on `^@/` in `vitest.config.mts` instead of `vite-tsconfig-paths`, to avoid an extra dependency.
- `ApiGame.vitrinThirdPartyVendors` is optional because the API omits it on some games; the mapping to `Game.vendors` (always an array, narrowed with `isVendor`) happens at the server boundary in the API client step.
- `FilterState` uses `mode: "browse" | "search"` as the discriminant so a `relevance` sort and a `query` can only exist together. `SortKey` excludes `level` (separate from quality) and `rating` (feeds `quality`).
- `@types/node` was raised from `^20` to `^24` because Vitest 5 requires `^22 || >=24` and npm refused the install otherwise.
- `create-next-app` refuses a non-empty folder (existing agent instruction file and `context/`), so the project was scaffolded in a temp directory and copied into the repo root, leaving existing files untouched.
- Tailwind v4 via `@tailwindcss/postcss` (documented Next.js setup) instead of the `@tailwindcss/turbopack` loader. Color tokens live as CSS variables and are mapped with `@theme inline`; light/dark follows `prefers-color-scheme` only (no JS toggle). `architecture.md` was not changed; check it for styling references at the next architectural update.
- RTL is set once on `<html dir="rtl">`; components use logical properties only (Tailwind `ps/pe/ms/me/border-s/text-start`, never `left/right`). Next.js has no built-in RTL switch (the i18n guide only covers `lang`), so `dir` is set manually in the root layout.
- Use `?pageId=N` for pagination (`?page=N` is ignored by the API).
- Do not forward the `creator` object (contains personal data) to the client; map to a minimal game type at the server boundary.
- Trim category titles when building filter options.

## Session Notes

- Scaffold notes: `next.config.ts` generated with `cacheComponents: true` and `partialPrefetching: true`, which affects how fetching and `revalidate` are written (check `node_modules/next/dist/docs/` before implementing the server fetch). The generated `AGENTS.md` tells agents to read those docs first. `npm install` reported 5 high-severity audit findings (not addressed). Generated `README.md` is the default one and must be rewritten.
- AI usage (feature 01): Codex ran `create-next-app@latest`, copied the output into the repo, and verified lint, build, and the dev server. No hand-written code.
- AI usage (RTL setup): Codex read the Next.js docs in `node_modules`, edited `app/layout.tsx` and `app/globals.css`, and replaced `app/page.tsx` with a temporary placeholder.
- AI usage (README): Codex rewrote the default `README.md` from `AGENTS.md` and `context/` (stack, run steps, Next.js notes, rules, planned features, API notes). Unbuilt features are labeled planned, and the AI Usage section is a stub to finish before submission.
- Live API (2026-10-19): `total` 729, `eachPerPage` 12, page 1 returns 12 games, vendors seen: `rubika`, `soroush`, no empty vendors on page 1 but common on later pages.
- AI usage log (for README): Claude/Codex used to extract requirements into context files and inspect the API; log further usage here as it happens.
- AI usage (agent docs): Codex replaced the old agent instruction file with `AGENTS.md` as the single agent entry point (commands, context reading order, critical rules, Next.js notes, structure, API facts, done checklist) from `README.md` and the old instructions. The generated `nextjs-agent-rules` block is kept because `next dev` re-adds it. All references to the old file name were updated to `AGENTS.md`.
- AI usage (feature 02): the assistant read the feature spec and Next.js CSS docs, found that the color tokens, UI principles, `globals.css`, and `lib/cn.ts` were already in the working tree, then verified them (lint, build, compiled-CSS probe, `cn()` runtime check). It changed the Tailwind wiring to the documented PostCSS plugin and synced `AGENTS.md`, `README.md`, and `ui-context.md`. Color values and contrast figures in `ui-context.md` were taken as already extracted; they were not re-fetched from lifelands.ir in this session.
- AI usage (implementation plan): the assistant read `README.md`, `project-overview.md`, `architecture.md`, and `ai-workflow-rules.md` and wrote the 12-step plan (steps 03 to 14) in this file, splitting the suggested build order so no step mixes pure logic with UI or server fetching with client interactivity. No code was changed. Also added `AGENTS.md`/`ui-context.md` notes (PowerShell-only file reading, always use `cn()`).
- AI usage (feature 03): the assistant read the Next.js Vitest guide, sampled the live API (including pages past the end) to confirm field types and the optional vendors field, installed Vitest, and wrote the spec, config, types, vendor guard, and tests. Two things it got wrong first: the initial `npm install -D vitest` failed on a `@types/node` peer conflict (fixed by raising `@types/node` to `^24`), and the first `@ts-expect-error` placement in `types/filter.test.ts` was on the wrong line so `tsc` flagged unused directives (moved above the statement). The `browse`/`search` split of `FilterState` and excluding `level`/`rating` from `SortKey` are assistant proposals to be confirmed by the owner.
