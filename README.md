# Lifelands Game Explorer

Single-section frontend assignment: a Persian (RTL) Game Explorer built with Next.js 16 (App Router) and strict TypeScript. It renders games from `GET https://lifelands.ir/api/v1/games`. Full brief: `lifelands-technical-assignment.md` (do not modify).

## Critical Rules (violating any gets the submission rejected)

- TypeScript `strict: true`; no `any`, `@ts-ignore`, or `as unknown as`.
- Initial fetch happens in a Server Component, never in `useEffect`; never mark the whole page `'use client'`.
- Never call the Lifelands API from the browser; use a server proxy / route handler.
- Types come from the real API response, not from a tutorial or another project.
- Persian normalization is mandatory; `lib/` has zero React imports.
- No `console.log`, unused files, dead code, or commented-out blocks.
- No UI kits or dashboard templates; no committed `.env` or `node_modules`.
- `README.md` is mandatory and must include an honest "AI Usage" section; log AI usage as you go.

## Application Building Context

Read the following files in order before implementing
or making any architectural decision:

1. `context/project-overview.md` — product definition,
   goals, features, and scope
2. `context/architecture.md` — system structure,
   boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography,
   and component conventions
4. `context/code-standards.md` — implementation rules
   and conventions
5. `context/ai-workflow-rules.md` — development workflow,
   scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase,
   completed work, open questions, and next steps

Update `context/progress-tracker.md` after each
meaningful implementation change.

If implementation changes the architecture, scope, or
standards documented in the context files, update the
relevant file before continuing.
