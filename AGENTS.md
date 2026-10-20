# Lifelands Game Explorer: Agent Guide

Persian (RTL) Game Explorer built with Next.js 16 (App Router) and strict TypeScript. It renders games from `GET https://lifelands.ir/api/v1/games` as a searchable, filterable, sortable grid. Human-facing overview, stack, and run steps are in `README.md`; the requirements are extracted into `context/`.

## Commands

- `npm run dev`: dev server on `http://localhost:3000`
- `npm run build`: production build and type check (must pass before a unit is done)
- `npm run lint`: ESLint
- `npm run test`: Vitest (`vitest run`, node environment); covers `lib/**/*.test.ts` and `types/**/*.test.ts`

Use `npm.cmd` / `npx.cmd` in PowerShell, where `npm.ps1` is blocked by the execution policy.

Do not use the `Read` and `Bash` tools. Read files and run every command through the PowerShell tool (for example `Get-Content -Raw -Encoding UTF8 <path>`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Context

Read these in order before implementing or making an architectural decision:

1. `context/project-overview.md`: product definition, goals, scope
2. `context/architecture.md`: boundaries, state model, invariants, verified API facts
3. `context/ui-context.md`: theme, colors, typography, component conventions
4. `context/code-standards.md`: implementation rules
5. `context/ai-workflow-rules.md`: workflow, scoping, AI usage log rules
6. `context/progress-tracker.md`: current phase, open questions, next steps

Update `context/progress-tracker.md` after every meaningful change. If a change alters architecture, scope, or standards, update the relevant context file first. Work on one feature unit at a time; feature specs live in `context/features/`.

## Critical Rules

Violating any of these gets the submission rejected:

- TypeScript `strict: true`; no `any`, `@ts-ignore`, or `as unknown as`.
- The initial fetch happens in a Server Component, never in `useEffect`; never mark the whole page `'use client'`.
- The browser never calls the Lifelands API; client fetches go through a server proxy / route handler.
- Types come from the real API response, not from a tutorial or another project.
- Persian normalization is mandatory; `lib/` has zero React imports.
- No `console.log`, unused files, dead code, or commented-out blocks. No inline comments unless asked.
- No UI kits or dashboard templates; no committed `.env` or `node_modules`.
- `README.md` is mandatory and must keep an honest AI Usage section.

## Next.js Notes

- `next.config.ts` enables `cacheComponents: true` and `partialPrefetching: true`. Check `node_modules/next/dist/docs/` before writing server fetching, caching, or `revalidate` code.
- Tailwind 4 is wired through the PostCSS plugin `@tailwindcss/postcss` in `postcss.config.mjs` (the setup from the Next.js CSS docs); `app/globals.css` starts with `@import "tailwindcss"`.
- The root layout uses the generated `LayoutProps<"/">` type. `next-env.d.ts` is git-ignored.
- RTL is set manually once in `app/layout.tsx` (`<html lang="fa" dir="rtl">`). Vazirmatn is loaded with `next/font/google` and exposed as `--font-vazirmatn`, mapped to `--font-sans`.
- Use logical properties only (`ps-*`, `pe-*`, `ms-*`, `me-*`, `border-s-*`, `text-start`); never `left`/`right`.
- Components are Server Components by default; `'use client'` only for leaf interactivity (search box, dropdowns, favorites, load more).
- Never edit generated or third-party code (`node_modules`, `.next`).

## Structure

- `app/`: routes, layout, Server Components, route handlers (proxy)
- `components/`: presentational components
- `hooks/`: `useDebounce`, `useUrlState`, `useFavorites`, each usable in isolation
- `lib/`: pure data layer (normalization, filter, sort, quality score, vendor guard, API client) with colocated tests
- `types/`: types derived from the real API response

`app/`, `lib/`, `types/`, `public/`, and `context/` exist so far; `components/` and `hooks/` are created as features land.

## API Facts

- Envelope is `{ state, data }`; `data` has `pageId`, `eachPerPage` (12), `total` (729), `games[]`.
- Paginate with `?pageId=N`; `?page=N` is ignored.
- Trim category titles; handle empty `companyName` and empty `vitrinThirdPartyVendors`.
- `image` is a relative path with an unconfirmed base URL.
- Never forward the `creator` object (personal data) to the client.

## Before Finishing a Unit

1. The unit works end to end within its scope and violates no invariant in `context/architecture.md`.
2. No forbidden constructs from Critical Rules.
3. Tests for touched `lib/` code pass and `npm run build` passes.
4. `context/progress-tracker.md` is updated, including the AI usage log in Session Notes.
5. Do not commit or create branches unless asked.
