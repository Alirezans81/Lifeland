# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Not started (context files filled from the assignment brief; no code yet).

## Current Goal

- Scaffold the Next.js 16 project and define API-derived types.

## Completed

- Extracted requirements from `lifelands-technical-assignment.md` into `context/` and `CLAUDE.md`.
- Inspected the live API (envelope, pagination, data quirks) and recorded findings in `architecture.md`.

## In Progress

- None yet.

## Next Up

- Project setup (Next.js 16, strict TS, RTL, font, `.gitignore`, test runner).
- Types and generic envelope; vendor union and guard; sort keys.
- `lib/` pure layer with tests.

## Open Questions

- Image base URL: relative `image` paths (e.g. `game/file-....webp`) returned 404 on `lifelands.ir/`, `/game/`, `/api/v1/game/`, `/uploads/`. Find the real public host/path (browser devtools on the Lifelands site) before implementing 8.1.
- Load more vs pagination: pick one and justify (leaning load more, since the API is page-based with `?pageId=N` and filtering is client-side).
- Client-side filtering only covers loaded items; decide how search/filters interact with unloaded pages (729 total, 12 per page).
- Empty-vendor policy (8.3): included / excluded / "unspecified" bucket. Sampled data: 26 of 48 games have none.
- `revalidate` value for the server fetch.
- Styling choice (Tailwind vs CSS Modules), font, color tokens, light/dark scope.
- Which unrequested filter to add for Task 6.3.
- Whether the API supports server-side search via `searchValue` (not tested).

## Architecture Decisions

- Use `?pageId=N` for pagination (`?page=N` is ignored by the API).
- Do not forward the `creator` object (contains personal data) to the client; map to a minimal game type at the server boundary.
- Trim category titles when building filter options.

## Session Notes

- Live API (2026-10-19): `total` 729, `eachPerPage` 12, page 1 returns 12 games, vendors seen: `rubika`, `soroush`, no empty vendors on page 1 but common on later pages.
- AI usage log (for README): Claude/Codex used to extract requirements into context files and inspect the API; log further usage here as it happens.
