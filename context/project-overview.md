# Lifelands Game Explorer

## Overview

A single-section frontend deliverable ("Game Explorer") for Lifelands, an Iranian game platform. It fetches games from the live API (`GET https://lifelands.ir/api/v1/games`) and renders a searchable, filterable, sortable grid. It is a hiring technical assignment (Frontend Engineer, 4-6 hours): the goal is readable, defensible engineering, not a full landing page. All UI copy is Persian (RTL).

## Goals

1. Server-render the first page of games with Next.js 16 App Router (no `useEffect` initial load).
2. Persian-aware client-side search, filtering, and sorting with the URL as the single source of truth.
3. Strict, API-derived TypeScript with a pure, unit-tested data layer in `lib/`.
4. Ship a thoughtful `README.md` (including AI usage disclosure) and a working deployed link.

## Core User Flow

1. User opens the page; the first 12 games are already rendered by the server (skeleton shown while streaming).
2. User types in search (500ms debounce) over `title` and `companyName`; Persian text is normalized before matching.
3. User narrows by vendor (multi-select), category, and optionally favorites-only; picks a sort.
4. State is written to the URL; sharing the link or using back/forward restores the exact view.
5. User toggles favorites (persisted in `localStorage`) and loads more games.
6. If nothing matches, an empty state offers a recovery action (reset filters).

## Features

### Discovery

- Search across `title` and `companyName` with 500ms debounce.
- Persian normalization: ی/ي and ک/ك unification, Persian/Arabic digits to Latin, ZWNJ removal, whitespace collapse.
- Config-driven filters: `vitrinThirdPartyVendors` (multi-select), `category.title`, score range, plus one extra filter not in the brief (documented in README).
- Sort by `score`, `runCount`, `seenCount`, `like`, and a blended "quality" heuristic.

### Personalization

- Favorites toggle persisted in `localStorage`, with a favorites-only filter.

### Data and Loading

- Load more or pagination (choose one, justify in README) with a race-safe fetch.
- Skeleton on initial load matching final layout dimensions (no CLS); empty state with recovery action.
- Images resolved from relative paths with a non-breaking fallback.

## Scope

### In Scope

- One section: Game Explorer, Persian RTL UI.
- Next.js route handler / server proxy for client-side API calls.
- Pure `lib/` functions with unit tests (min. 3 for `normalizePersian`, 2 for `filterGames`).
- README with decisions, trade-offs, and AI usage.

### Out of Scope

- Full landing page, auth, game detail/play pages.
- Prebuilt UI kits or dashboard/filter templates.
- Calling the Lifelands API directly from the browser.

## Success Criteria

1. All 10 functional requirements work, and shared URLs restore exact state.
2. All critical requirements hold (strict TS, Server Component fetch, README, AI disclosure, working deploy, no `console.log`, no dead code).
3. `npm run build` passes with zero type errors; unit tests pass.
4. Deployed on Vercel/Netlify and reachable.

## Deliverables

1. GitHub repository link.
2. Deployed link.
3. `README.md`: project explanation, exact tech versions, run steps (`git clone` to `npm run dev`), design decisions, TypeScript decisions, trade-offs, AI usage.

## Optional Bonus

Extra unit tests, virtualized grid (>50 items), micro-interactions, favorite sound/haptics (respect `prefers-reduced-motion`), storytelling copy, screen recording of the race guard, Lighthouse score in README, dark mode, Persian typography, error boundary with retry.
