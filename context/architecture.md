# Architecture Context

## Stack

| Layer     | Technology                                  | Role                                       |
| --------- | ------------------------------------------- | ------------------------------------------ |
| Framework | Next.js 16 (App Router) + TypeScript strict | Server-rendered first page, route handlers |
| Styling   | Tailwind or CSS Modules (own choice)        | No prebuilt component kits                 |
| Data      | Lifelands REST API (`/api/v1/games`)        | Read-only game catalog                     |
| Storage   | Browser `localStorage`                      | Favorites only                             |
| Testing   | Vitest (node environment)                   | Pure `lib/` functions and type tests       |
| Hosting   | Vercel or Netlify                           | Public deployed link                       |

## System Boundaries

- `app/` — routes, Server Components, route handlers (proxy for client fetches). The page stays a Server Component.
- `components/` — presentational components; only leaf interactive ones use `'use client'`.
- `hooks/` — `useDebounce`, `useUrlState`, `useFavorites`; each usable in isolation, none imports another hook's internals.
- `lib/` — pure data layer: normalization, filtering, sorting, quality score, vendor guard, API client. Zero React imports.
- `types/` — types derived from the real API response.
- Filter config (one file) — filter definitions; adding a filter means editing only this file.

## API Facts (verified against the live endpoint, 2026-10-19)

- Envelope: `{ state: boolean, data: {...} }`.
- `data` keys: `pageId`, `eachPerPage` (12), `searchValue`, `total` (729), `games[]`, plus `gamesWithoutConsole`, `banner`, `sliders`, `category` (not needed).
- Pagination: `?pageId=N` works. `?page=N` is ignored (returns page 1). A page past the end returns an empty `games` array.
- No duplicate `_id` across pages 1-4 (48 items sampled).
- CORS is `*` and no `Cache-Control` header is sent, but the brief still forbids browser-direct calls: use a proxy.
- `/api/v1/` root returns 401; only the games endpoint is known to be public.
- Fields to consume and type: `_id`, `title`, `companyName`, `category.title`, `vitrinThirdPartyVendors`, `score`, `rating`, `like`, `level`, `runCount`, `seenCount`, `image`, `createdAtIso`. Other fields (`creator`, `reviewHistory`, ...) are not needed; the creator object contains personal data, so do not pass it to the client.
- Observed vendors: `rubika`, `soroush`. Empty vendor arrays are common (26 of 48 sampled; none on page 1). The field is also missing entirely on some games (27 of 117 in a later sample), so type it as optional.
- Data quirks:
  - Category titles have trailing spaces (`"امتیازی "`, `"رانندگی "`); trim/normalize before use as filter values.
  - `rating` is a mix of ints and decimals (0 to ~1.13); `score` is 0 to 4.9; `like` up to 25; `runCount` up to ~17k; `seenCount` up to ~27k.
  - `companyName` can be empty or inconsistent (`Lifelands`, `lifelands.ir`, `Vahid`, ...).
  - `createdAt`/`updatedAt` are relative Persian strings; use `createdAtIso` if a date is needed.
  - `description` can be whitespace only.
- `image` is a relative path (e.g. `game/file-....webp`). The public base URL is unconfirmed: the guessed paths on `lifelands.ir` all returned 404 (see progress tracker).

## Empty Vendor Policy (8.3)

Games with an empty or missing `vitrinThirdPartyVendors` are included while no vendor filter is selected and excluded as soon as any vendor is selected. A vendor filter means "published on this platform", so a game on no platform cannot match it. Sampling showed 26 of 48 games with an empty array and 27 of 117 with the field missing, so excluding them from the default view would hide a large part of the catalog, while an "unspecified" bucket would widen the vendor type and add a fake vendor to the UI for data that is mostly a gap. The API client normalizes a missing field to `[]`, so `filterGames` only deals with arrays.

## State Model

## Quality Score (8.2)

`qualityScore` in `lib/quality.ts` returns a number from 0 to 1: `0.5 * score / 5 + 0.3 * rating / 1.2 + 0.2 * ln(1 + like) / ln(26)`, each term clamped to 0..1. The caps come from a live sample of 93 games (2026-10-20): `score` 0 to 5, `rating` 0 to 1.19, `like` 0 to 25. The scales are fixed constants rather than the min and max of the loaded games, so load more never changes the quality of a game already shown. `like` is log-scaled so a few heavily liked games do not dominate. A game with `score` 0 and a nonzero `rating` still earns the rating and like terms (2 of 93 sampled games), so it ranks above a game with all three at 0. `level` is kept out of the formula, and `runCount` and `seenCount` are left out because they have their own sort keys and would double count popularity. Negative or non-finite inputs count as 0 so a comparator never sees `NaN`.

`sortGames` in `lib/sort.ts` sorts descending only, breaks ties by `_id` ascending (plain string comparison), and returns a new array. `relevance` is not a `SortKey`: in search mode the caller keeps the order `filterGames` produced.

## Total vs Page Length Mismatch (8.4)

`lib/pagination.ts` never fetches; it only decides. `getNextPageId` returns `null` when the received page is empty, when it is shorter than `eachPerPage`, or when the unique loaded count reaches `total`, in that order; otherwise `pageId + 1`. A `total` or `eachPerPage` that is not a positive finite number is treated as unknown, so only the empty and short-page rules apply and the loop always ends. A short page ends loading even when `total` promises more, and `describePageMismatch` reports what was found (`none`, `empty`, `short`, `long`, `total-exceeded`; the legitimate last short page is `none`). `mergeGames` appends a page and keeps the first occurrence of each `_id`. Request cancellation stays with load more (step 12).

## State Model

- **URL (source of truth):** search, vendors, category, sort, favorites-only, score range. Shared links and back/forward restore it exactly.
- **Local component state:** transient UI only (open dropdown, input draft before debounce).
- **`localStorage`:** favorite game ids.
- **Server:** first page fetched in a Server Component with a justified `revalidate`; list wrapped in `<Suspense>` with a skeleton matching final dimensions.

## Access Model

- Public, read-only, no auth. No secrets or API keys; `.env` is never committed.

## Invariants

1. The initial data load happens in a Server Component, never in `useEffect`.
2. The page is never marked `'use client'`; only leaf interactive components are.
3. `lib/` has zero React imports and is unit-testable in isolation.
4. The browser never calls `lifelands.ir` directly; it goes through a server proxy / route handler.
5. Async fetches are race-safe via `AbortController` or a request-ID guard, never `setTimeout`.
6. Types are derived from the real response, not copied; vendor and sort keys are narrowed unions, not `string`.
7. Filter state is a discriminated union; invalid combinations fail at compile time.
8. Filters are declared in config and the UI renders from it.
9. A mismatch between `total`/`eachPerPage` and the actual array length never crashes load-more.
10. Toggling one favorite does not re-render the whole list.
