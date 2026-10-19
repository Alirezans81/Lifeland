# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Project setup: Next.js 16 scaffolded, RTL and Persian font configured. Types and `lib/` layer not started.

## Current Goal

- Define API-derived types, the generic envelope, vendor union and guard, and sort keys.

## Completed

- Extracted requirements from `lifelands-technical-assignment.md` into `context/` and the agent instruction file (now `AGENTS.md`).
- Inspected the live API (envelope, pagination, data quirks) and recorded findings in `architecture.md`.
- Feature 01 (init Next.js project): scaffolded Next.js 16.4.2 (React 19.3.0, TypeScript strict, Tailwind v4, ESLint, App Router, no `src/`, `@/*` alias, npm) in the repo root without touching the existing `context/` files. `npm run lint` and `npm run build` pass, and `next dev` serves `http://localhost:3000` with HTTP 200.
- RTL setup (per `node_modules/next/dist/docs`: root layout owns `<html>`, `next/font/google` with `variable`): `app/layout.tsx` now sets `lang="fa" dir="rtl"`, loads Vazirmatn (`arabic` + `latin` subsets, `display: swap`) as `--font-vazirmatn`, and has Persian metadata. `app/globals.css` maps `--font-sans` to it, with body `line-height: 1.8`. The starter `app/page.tsx` was replaced with a minimal RTL placeholder using logical utilities (`ps-*`, `border-s-*`). `npm run lint` and `npm run build` pass, and prerendered HTML contains `<html lang="fa" dir="rtl">`.

## In Progress

- None yet.

## Next Up

- Remaining project setup: add a test runner, define color tokens in `globals.css` (still the scaffold `--background`/`--foreground`).
- README: replace the `<repository-url>` placeholder, then fill the design decisions and the full AI Usage assessment as features land.
- Types and generic envelope; vendor union and guard; sort keys.
- `lib/` pure layer with tests.

## Open Questions

- Image base URL: relative `image` paths (e.g. `game/file-....webp`) returned 404 on `lifelands.ir/`, `/game/`, `/api/v1/game/`, `/uploads/`. Find the real public host/path (browser devtools on the Lifelands site) before implementing 8.1.
- Load more vs pagination: pick one and justify (leaning load more, since the API is page-based with `?pageId=N` and filtering is client-side).
- Client-side filtering only covers loaded items; decide how search/filters interact with unloaded pages (729 total, 12 per page).
- Empty-vendor policy (8.3): included / excluded / "unspecified" bucket. Sampled data: 26 of 48 games have none.
- `revalidate` value for the server fetch.
- Color tokens and light/dark scope (Tailwind and Vazirmatn are chosen).
- Which unrequested filter to add for Task 6.3.
- Whether the API supports server-side search via `searchValue` (not tested).

## Architecture Decisions

- `create-next-app` refuses a non-empty folder (existing agent instruction file and `context/`), so the project was scaffolded in a temp directory and copied into the repo root, leaving existing files untouched.
- Tailwind chosen as the styling option (scaffolded with Tailwind v4); update `ui-context.md` and `architecture.md` when tokens are defined.
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
