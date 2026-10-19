# AI Workflow Rules

## Approach

Build incrementally and spec-first. Context files define what to build, how, and current progress; implement against them and do not invent behavior. AI use is allowed and encouraged but must be disclosed and understood: the owner must be able to explain every line in a review call. Use AI to learn and verify, not to replace thinking.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated boundaries in one step.

## Suggested Build Order

1. Project setup (Next.js 16, strict TS, RTL layout, font, `.gitignore`).
2. API-derived types, generic envelope, vendor union and guard, sort keys.
3. `lib/` pure layer (`normalizePersian`, `filterGames`, `sortGames`, quality score) with tests.
4. API client, route handler proxy, server fetch with `revalidate`.
5. Hooks: `useDebounce`, `useUrlState`, `useFavorites`.
6. Config-driven filters and toolbar UI.
7. Game card, image fallback, skeleton, Suspense, empty state.
8. Load more with race-safe fetch and `total` mismatch handling.
9. Accessibility and performance pass; optional bonuses.
10. README (with AI Usage), deploy, final cleanup.

## When to Split Work

Split a step if it combines:

- Pure logic changes and UI changes.
- Server fetching and client interactivity.
- Behavior not clearly defined in the context files.

If a change cannot be verified end to end quickly, the scope is too broad.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- Resolve ambiguity in the relevant context file before implementing.
- Add missing requirements as open questions in `progress-tracker.md`.

## AI Usage Log (feeds the README "AI Usage" section)

Undisclosed AI use is grounds for rejection. Keep a running log in `progress-tracker.md` (Session Notes) of the tool used, files/tasks touched, what it produced, what was rewritten or rejected and why, and what was written by hand. The README section must cover:

1. Tools used.
2. Which parts, files, and tasks they were used for.
3. What output they gave.
4. How it was changed (most important): what the AI got wrong, what was rejected.
5. What was written without AI.
6. Honest assessment: where AI helped, slowed things down, or produced incorrect/insecure code.

## Protected Files

Do not modify unless explicitly instructed:

- `lifelands-technical-assignment.md` (the brief).
- Generated or third-party code (`node_modules`, `.next`).

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes architecture, state/storage decisions, conventions, or scope.

## Before Moving to the Next Unit

1. The unit works end to end within its scope.
2. No invariant in `architecture.md` was violated.
3. No `console.log`, `any`, `@ts-ignore`, `as unknown as`, dead code, or commented-out blocks.
4. Tests for touched `lib/` code pass.
5. `progress-tracker.md` reflects the completed work.
6. `npm run build` passes.
