# Code Standards

## General

- Keep modules small and single-purpose; no giant `page.tsx`.
- Fix root causes; never use `setTimeout` to hide race conditions.
- No `console.log`, unused files, dead code, or commented-out blocks in final code.
- No inline comments unless explicitly requested.
- Every line must be explainable (a review call asks about specific lines).

## TypeScript

- `strict: true` throughout.
- Forbidden: `any`, `@ts-ignore`, `as unknown as`.
- Derive types from the actual API response; never copy a `Game` type from elsewhere.
- Task 5.1: generic envelope (e.g. `ApiResponse<T>`) with page and item types; the fetch function returns a typed result and every consumed field is typed.
- Task 5.2: `Vendor` union for supported vendors plus a type guard that narrows an arbitrary `string` to it. README explains why plain `string[]` is insufficient.
- Task 5.3: filter state as a discriminated union where `sort` cannot coexist with an incompatible `search` state; demonstrate compile-time rejection (e.g. `@ts-expect-error` in a type test, not `@ts-ignore`).
- Task 5.4: `SortKey` derived via mapped/conditional type from the item type, numeric fields only; `sortGames` accepts only valid keys.
- Validate unknown external input (API JSON) at the boundary before trusting it.

## Next.js

- Default to Server Components; `'use client'` only for leaf interactivity (search box, dropdowns, favorites, load more).
- Fetch the initial page in a Server Component and pass it to a Client Component that owns interactivity.
- Wrap the list in `<Suspense>` with a skeleton matching final layout dimensions (no CLS). If `loading.tsx` is also used, explain route-level vs component-level streaming in README.
- Choose a `revalidate` value and justify it in README by how often the game list changes.
- Use `next/image` with explicit dimensions; lazy-load below-fold cards.
- Route handlers do one thing: proxy the games endpoint, validate query input, return a consistent response shape.
- README lists exactly which components are Server Components and why.

## Pure Data Layer (`lib/`)

- Zero React imports.
- `normalizePersian`: ی/ي and ک/ك unification, Persian/Arabic digits to Latin, ZWNJ removal, whitespace collapse (and trim).
- `filterGames`, `sortGames`, quality score, vendor guard: pure and individually testable.
- Tests: at least 3 for `normalizePersian` and 2 for `filterGames`; ideally every pure function.

## Hooks

- `useDebounce<T>(value: T, delay: number): T`
- `useUrlState<T>(key: string, defaultValue: T): [T, (v: T) => void]`
- `useFavorites(): { favorites: Set<string>; toggle: (id: string) => void }`
- Each is usable in isolation and never imports another hook's internals. Libraries for debounce/URL state are allowed if every line can be explained.

## Async and Race Safety

- The second-page fetch uses `AbortController` or a request-ID guard so stale responses never overwrite fresh state; justify the choice in README.
- Debounce/throttle any scroll or resize handler.

## Domain Decisions to Implement

- 8.1 Image: resolve the relative path to a full URL; on 404 show a fallback inside the same card dimensions (not just hiding the image in `onError`).
- 8.2 Quality score: one heuristic blending `score`, `rating`, `like` (`score` may be 0 while `rating` is nonzero; `level` is separate); document the formula in README; expose it as a sort option.
- 8.3 Empty vendors: choose included / excluded / "unspecified" bucket, implement it, and write a one-paragraph justification.
- 8.4 `total` vs `eachPerPage`: detect mismatch against the actual array length, handle it gracefully, and explain what was found.
- 6.3 Config-driven filters: define vendor, category, score range in a config array; demonstrate adding an unrequested filter and note it in README.

## Performance

- Memoize filtering/sorting; do not recompute on unrelated renders.
- Memoize list items so one favorite toggle does not re-render the whole list.
- Keep typing responsive (debounced search); profile if possible.

## Styling

- RTL: `dir="rtl"`, `lang="fa"`, logical CSS properties (`margin-inline`, `padding-inline`).
- Use tokens from `ui-context.md`; no hardcoded hex values in components.
- Visible focus rings; respect `prefers-reduced-motion`.
- Tailwind or CSS Modules only; no UI kits or dashboard templates.

## Repo Hygiene

- `.gitignore` covers `.env*`, `node_modules`, `.next`.
- Never commit secrets or `node_modules`.

## File Organization

- `app/` — routes, layout, route handlers.
- `components/` — UI components (Server by default).
- `hooks/` — custom hooks.
- `lib/` — pure logic, API client, colocated tests.
- `types/` — API-derived types.
