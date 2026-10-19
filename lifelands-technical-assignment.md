# Frontend Technical Assignment — Lifelands

**Role:** Frontend Engineer  
**Scope:** One section  
**Time:** 4–6 hours

---

## 1. Brief

Build **one section**: a **Game Explorer** for Lifelands that fetches and renders games from the live API.

```txt
GET https://lifelands.ir/api/v1/games
```

Not a full landing page. One section — but the engineering inside it must be real, readable, and defensible. Every task below exists to reveal how you think, not just what you can render.

UI copy must be **Persian (RTL)**.

---

## 2. Functional Requirements

1. **Server-side fetch** of the first page (Next.js App Router). No `useEffect` for initial load.
2. **Client-side search** with 300ms debounce across `title` and `companyName`.
3. **Persian text normalization** before matching (mandatory):
   - ی/ي and ک/ك unification
   - Persian/Arabic digits → Latin
   - ZWNJ removal, whitespace collapse
4. **Filter by `vitrinThirdPartyVendors`** (multi-select: soroush, rubika, …) and by `category.title`.
5. **Sort** by `score`, `runCount`, `seenCount`, or `like`.
6. **Favorites** toggle persisted in `localStorage`. Show a favorites-only filter.
7. **URL as source of truth** for search, filters, and sort. Shared links restore exact state. Back/forward works.
8. **Loading & empty states.** Skeleton on initial load, empty state with a recovery action.
9. **Load more or pagination** — pick one, implement it, and justify the choice in the README.
10. **Keyboard accessible.** Tab order, Escape closes dropdowns, visible focus rings.

---

## 3. ⚠️ Critical Requirements

These are **non-negotiable**. If any of these are missing, the submission will not be reviewed further.

1. **TypeScript with `strict: true`.** No `any`, no `@ts-ignore`, no `as unknown as`.
2. **Server Component for the initial fetch.** No `useEffect`-based initial data load.
3. **A `README.md` is mandatory.** Without it, the submission is rejected. See Section 10 for what it must contain.
4. **AI usage must be declared.** See Section 11. Undisclosed AI use is grounds for immediate rejection.
5. **Deployed link must work.** A dead link or a localhost-only submission will not be evaluated.
6. **No `console.log` in the final code.** Clean up before submitting.
7. **No unused files, dead code, or commented-out blocks.**

---

## 4. ⛔ Warnings

Read these carefully. Most rejections come from these mistakes.

- **Do not copy a `Game` type from a tutorial, GitHub gist, or another project.** Your types must be derived from the actual API response. We check.
- **Do not call the Lifelands API directly from the browser.** CORS and hygiene issues. Use a server-side proxy or route handler.
- **Do not mark the entire page `'use client'`.** This defeats the purpose of the assignment. Only leaf interactivity should be client-side.
- **Do not install a full UI kit or dashboard template.** Styling libraries (Tailwind, CSS Modules) are fine. Prebuilt component templates are not.
- **Do not skip the normalization step.** Persian text handling is a core part of this task, not a nice-to-have.
- **Do not commit `.env`, API keys, or `node_modules`.** Use `.gitignore`.
- **Do not submit a repo with a single giant `page.tsx`.** Component and logic separation are graded.
- **Do not use `setTimeout` to "fix" race conditions.** Use `AbortController` or a request-ID guard.
- **Do not ignore the README.** A good project with a lazy README scores lower than a decent project with a thoughtful one.

---

## 5. TypeScript Tasks

These are graded on **precision**, not volume.

### Task 5.1 — Generic API Response Envelope

Define a reusable generic that models the API envelope. Then define page and item types so that your fetch function returns a properly typed result. No `any`. Every field you consume from the response must be typed.

### Task 5.2 — Exhaustive Vendor Union

The vendor field is an array of strings in the raw response. Define a type for the vendors you actually support, and write a type guard that narrows an arbitrary string to that type. Explain in the README why a plain `string[]` is insufficient here.

### Task 5.3 — Discriminated Filter State

Model the filter state as a discriminated union where the `sort` field cannot coexist with an incompatible `search` state. Show that TypeScript rejects an invalid combination at compile time.

### Task 5.4 — Mapped Type for Sort Options

Instead of `type SortKey = string`, derive the sort keys from your item type, constrained to numeric fields only. Provide a `sortGames` function that accepts only valid keys.

---

## 6. Engineering Tasks

### Task 6.1 — Pure Data Layer

All filtering, sorting, and normalization logic must live in `lib/` with **zero React imports**. These functions must be individually unit-testable. Write at least **3 tests** for `normalizePersian` and **2 tests** for `filterGames`.

### Task 6.2 — Custom Hooks

Extract at minimum:

- `useDebounce<T>(value: T, delay: number): T`
- `useUrlState<T>(key: string, defaultValue: T): [T, (v: T) => void]`
- `useFavorites(): { favorites: Set<string>; toggle: (id: string) => void }`

Each hook must be usable in isolation. No hook may import another hook's internals.

### Task 6.3 — Config-Driven Filters

Define filters in a config array (vendor, category, score range). The UI must render from this config. Adding a new filter should mean editing **one file** — demonstrate this by adding a filter you were not asked for and noting it in the README.

### Task 6.4 — Race-Safe Async

Simulate a second-page fetch. If the user types or changes a filter while a fetch is in flight, the stale response must not overwrite fresh state. Implement this with either `AbortController` or a request-ID guard, and explain your choice.

---

## 7. Next.js Tasks

### Task 7.1 — Server / Client Split

Fetch the initial page in a Server Component. Pass it to a Client Component that owns interactivity. Do not mark the whole page `'use client'`. In the README, list exactly which components are Server Components and why.

### Task 7.2 — Streaming with Suspense

Wrap the game list in `<Suspense>` with a skeleton fallback **that matches the final layout dimensions** — no layout shift (CLS) when the list streams in. If you also add `loading.tsx`, explain the difference between route-level and component-level streaming in your README.

### Task 7.3 — Revalidation Strategy

Choose a `revalidate` value for the server fetch. Justify it in the README based on how often the game list actually changes.

---

## 8. Problem-Solving Tasks

### Task 8.1 — Broken Image Fallback

The API returns a relative image path. Resolve it to a full URL. Then handle the case where the image 404s: show a fallback without breaking the card layout. No `onError` that just hides the image.

### Task 8.2 — Score Normalization

`score` can be 0 while `rating` is nonzero, and `level` is a separate numeric field. Design a single "quality" heuristic that blends `score`, `rating`, and `like`, and sort by it as one of the options. Document the formula.

### Task 8.3 — Empty Vendor Arrays

Some games have an empty vendor array. Decide how the UI treats them under a vendor filter — included, excluded, or a separate "unspecified" bucket. Pick one, implement it, and write a one-paragraph justification.

### Task 8.4 — `total` vs. `eachPerPage`

The API reports a total count and a per-page size. The actual array length may not match. Detect this discrepancy and handle it without crashing the "load more" logic. Explain what you found.

---

## 9. Performance Requirements

- Memoize filtering/sorting results; do not recompute on unrelated renders.
- Do not re-render the entire list when one favorite toggles.
- Debounce/throttle any scroll or resize handler.
- Images: use `next/image` with explicit dimensions; lazy-load below-fold cards.
- Keep typing responsive — profile it if you can.

---

## 10. Deliverables

1. GitHub repository link
2. Deployed link (Vercel / Netlify)
3. `README.md` (mandatory — see below)

### README must include:

- **Project explanation** — what you built and the scenario you chose
- **Tech stack** — exact versions
- **How to run** — step-by-step, from `git clone` to `npm run dev`
- **Design decisions** — pagination vs. load-more, URL-state approach, normalization strategy, revalidation choice
- **TypeScript decisions** — why the vendor union, why the discriminated filter state, etc.
- **Trade-offs & known limitations** — what you would improve with more time
- **AI usage disclosure** — see Section 11

---

## 11. AI Usage — Disclosure & README

You are **allowed and encouraged** to use AI tools. But you must be transparent. Add a dedicated **"AI Usage"** section in your README covering all of the following:

1. **Which tools you used** — e.g. ChatGPT, Claude, Copilot, Cursor, v0, etc.
2. **Which parts of the project they were used for** — be specific. Which files, which tasks, which functions.
3. **What output you got** — paste or summarize the AI's suggestions.
4. **How you changed it** — this is the most important part. What did you rewrite? What did the AI get wrong? What did you reject and why?
5. **What you wrote yourself** — the parts you did not use AI for.
6. **Your honest assessment** — where AI helped, where it slowed you down, where it produced incorrect or insecure code.

**Rules:**
- A submission with no AI section will be treated as if you used AI and hid it. That is worse than declaring it.
- Copy-pasting AI output without understanding it is easy to detect during the review call. You will be asked to explain specific lines.
- Using AI to *learn* and *verify* is a plus. Using AI to *replace* thinking is a red flag.

---

## 12. Bonus (Optional)

These are not required. They will improve your score if done well and can hurt if done poorly.

- **Unit tests** for every pure function in `lib/` (beyond the minimum).
- **Virtualized list** for the game grid when more than 50 items are loaded.
- **Advanced micro-interactions** — hover states, transitions, skeleton shimmer.
- **Sound or subtle haptic feedback** on favorite toggle (respect `prefers-reduced-motion`).
- **Storytelling** — a short narrative framing the section (e.g. "Discover your next favorite game").
- **A short screen recording** walking through your race-condition guard and component tree.
- **Accessibility audit** — run Lighthouse and paste the score in the README.
- **Dark mode** with proper contrast ratios.
- **Persian typography attention** — correct font stack, line-height, digit rendering.
- **Error boundary** around the game list with a retry action.

---

## 13. Tech

- **Next.js 16** (App Router) — required
- **TypeScript** — required, `strict: true`
- Styling: your choice (Tailwind, CSS Modules, plain CSS)
- RTL required
- ❌ No ready-made template or filter clones. ❌ No copying a `Game` type from a tutorial.

---

## 14. Rules

Write the logic yourself. Using a library for debounce or URL state is fine — but you must be able to explain every line. Questions? Reach out.