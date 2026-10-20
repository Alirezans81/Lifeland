# Explorer Shell, Search, and URL State

## goal

- add `GameExplorer` in `components/games/game-explorer.tsx`: a Client Component that receives the server-fetched first page of games and owns the explorer's interactive state
- connect the existing `useDebounce` and `useUrlState` hooks to implement responsive search with URL persistence
- use the existing `filterGames` and `sortGames` helpers to derive visible games without duplicating business logic
- display an accessible result count and a Persian empty state with a reset action
- preserve server-side initial fetching, the existing `GameCard`, Suspense boundary, and skeleton
- no new dependencies, no changes to the API contract, and no advanced filter controls in this step

## explorer component

- add `components/games/game-explorer.tsx`
- mark it with `"use client"` because it owns local input state, URL state, and derived client-side results
- accept the initial `Game[]` through a typed props interface; do not fetch the initial page from the browser
- keep `app/page.tsx` and `GamesSection` as Server Components
- `GamesSection` continues calling `getGamesPage(1)` and passes its successfully fetched games to `GameExplorer`
- reuse `GameCard` to render the resulting list; do not copy card markup into the explorer
- preserve the existing responsive grid layout and design tokens
- keep interactive state in the explorer rather than converting the page or the whole game section into a Client Component

## search and URL state

- add a search input with a visible or programmatically associated Persian label
- keep the immediate input draft in local React state, so typing does not wait for URL navigation
- use the existing `useDebounce` hook with a delay of 300 milliseconds
- store the committed query in the URL through `useUrlState`
- use `history: "replace"` for search updates so typing does not create a separate browser-history entry for every keystroke
- use one consistent query key for the search state; use `q` unless an existing project convention specifies otherwise
- initialize the input draft from the URL-backed query so reloading or opening a shared link restores the search
- synchronize the draft when the URL-backed value changes through browser back/forward navigation
- avoid an effect that continually overwrites newer input drafts with stale debounced values
- when the committed query is empty or contains only whitespace, use browse mode; otherwise use search mode
- preserve the existing `FilterState` discriminated union: browse state uses a `SortKey`, while search state uses a `SearchSortKey`
- use `normalizePersian` and the existing `filterGames` implementation indirectly through the helper; do not reimplement Persian normalization in the component

## filtering and sorting

- use `filterGames(games, filter, favoriteIds)` from `lib/filter.ts` as the only filtering implementation
- in this step, use an empty `ReadonlySet<string>` for favorites because the favorites hook and UI belong to step 11
- initialize all filter criteria to their existing neutral values:
  - `vendors: []`
  - `category: null`
  - `scoreRange: null`
  - `favoritesOnly: false`
- use the existing `sortGames` helper for browse sorting
- use a valid existing `SortKey` as the default sort; use `"score"` unless an established project default says otherwise
- `sortGames` does not accept `"relevance"`; when search mode uses `"relevance"`, preserve the filtered input order instead of passing `"relevance"` to `sortGames`
- memoize the filter state, filtered games, and sorted visible games with `useMemo` where their dependencies are stable
- do not add vendor, category, score-range, favorites, or sort controls yet; those belong to step 10 and step 11

## result count

- display the number of games matching the current search
- format the number using Persian digits, consistent with the existing card UI
- put the changing count in an element with `aria-live="polite"`
- use an accurate Persian message for zero, one, or multiple results where appropriate
- derive the count from the currently filtered list, not the upstream catalog's `total`, because this step searches only the games already loaded on the client

## empty state and reset

- show a Persian empty state when no loaded games match the current search
- explain that no games match the current query and offer a clear reset action
- reset must clear the URL-backed query and restore the local input draft to an empty string
- reset must not mutate the initial games array
- reset must preserve unrelated query parameters owned by other explorer features; do not clear the entire URL indiscriminately
- do not add a separate empty state for a catalog-wide zero total unless the existing UI already requires one

## game list and rendering

- render the derived visible list using the existing `GameCard`
- use each game's stable `_id` as the React key
- memoize the card component with `React.memo` only if it can be done without changing the existing Server Component boundary; otherwise keep `GameCard` as the existing Server Component and avoid converting it solely for memoization
- do not add client-side data fetching, load more, or pagination in this step
- preserve the existing image resolution and fallback behavior

## error and loading behavior

- keep the initial fetch and upstream error handling inside `GamesSection`
- preserve the existing Suspense boundary and `GamesSkeleton`
- if the initial server request fails, continue rendering the existing Persian-friendly error state
- leave retry behavior as an integration point for a later step; do not add a browser API request just to implement retry
- do not hide an upstream error by rendering it as an ordinary empty search result

## URL behavior

- use `useUrlState` from `hooks/use-url-state.ts` rather than creating a second URL-state implementation
- use the existing serialization helpers in `lib/url-state.ts`
- preserve unrelated query parameters when updating the search value
- when the query equals its default value, remove the search parameter according to the existing `useUrlState` behavior
- ensure the URL is the source of truth for the committed query; the local input draft is only transient state
- do not add `useSearchParams` directly to a new component when `useUrlState` already handles URL access
- retain the current Suspense boundary around the server-rendered section; verify that any URL-dependent client rendering remains inside an appropriate Suspense boundary

## implementation constraints

- strict TypeScript; no `any`, `@ts-ignore`, or `as unknown as`
- use existing `Game`, `FilterState`, `SortKey`, and `SearchSortKey` types
- no React imports in `lib/`
- do not change the upstream API client, parser, proxy route, or cache configuration
- do not add dependencies or a UI kit
- use `cn()` when merging conditional Tailwind classes
- maintain Persian RTL layout and use logical CSS properties
- use existing color and typography tokens
- no `console.log`, dead code, or unnecessary comments
- read the relevant Next.js documentation under `node_modules/next/dist/docs/` before changing framework behavior

## manual verification

- start the development server and open the home page
- confirm the first page still renders the server-fetched game cards
- type a Persian game title and confirm matching cards appear after the 300 ms debounce
- test Persian and Arabic forms of `ی` and `ک`, Persian digits, and a query containing multiple words
- type a query with no matches and confirm the empty state appears
- press reset and confirm the input clears, the search parameter disappears, and the original loaded games return
- open a URL containing the search query directly and confirm the input and results are restored
- reload that URL and confirm the same search state is restored
- navigate between search values with browser history and confirm the input follows the URL
- confirm unrelated query parameters survive search updates
- confirm the result count updates and uses Persian digits
- confirm the initial error state and loading skeleton still work
- verify no client-side request is made directly to `lifelands.ir`

## files expected to change

- `components/games/game-explorer.tsx` — new client-side explorer shell
- `components/games/games-section.tsx` — pass server-fetched games to `GameExplorer`
- `context/progress-tracker.md` — mark step 09 complete and record actual verification
- `context/progress-tracker.md` Session Notes — add the AI usage entry and any implementation corrections

Do not modify `GameCard`, the API client, parser, proxy route, or data types unless implementation reveals a specific incompatibility that must be reported first.

## decisions

- search query key: `q`, unless the existing URL-state conventions require a different key
- search updates use `replace`, not `push`, to avoid polluting browser history while typing
- search is limited to the currently loaded first page; loading additional pages is step 12
- `"score"` is the default browse sort unless an existing project decision overrides it
- search-mode `"relevance"` preserves filtered order because `sortGames` accepts only `SortKey`
- favorites are not active in this step; pass an empty set until step 11
- keep `GameCard` as a Server Component rather than converting it just to use `React.memo`

## when to be done

- `GameExplorer` receives real games from the Server Component and renders the existing cards
- Persian search works using the existing normalization and filtering helpers
- search input updates immediately and commits to the URL after 300 milliseconds
- opening or reloading a shared URL restores the committed query and matching results
- browser history navigation synchronizes the search input
- result count and empty state update correctly and accessibly
- reset restores the default search state without deleting unrelated query parameters
- initial server fetching, Suspense, skeleton, error handling, and image behavior remain intact
- `npx tsc --noEmit` and `npm run lint` pass; run the project build when requested
- update the progress tracker and AI usage log with what was actually implemented and verified
