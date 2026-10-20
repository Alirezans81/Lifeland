## sortGames, qualityScore, and pagination-meta helpers

- add `qualityScore` in `lib/quality.ts`: pure, takes a `Game` and returns a number from 0 to 1
- add `sortGames` in `lib/sort.ts`: pure, takes `(games, sortKey)` with `sortKey: SortKey` and returns a new array, always descending (best first)
- add `lib/pagination.ts` with the 8.4 helpers: `getNextPageId`, `describePageMismatch`, and `mergeGames` (dedupe by `_id`)
- no React imports, no new dependencies, no changes to `types/` (`SortKey` already contains `quality`)
- `relevance` is not handled by `sortGames`: it is not a `SortKey`, and in search mode the order produced by `filterGames` is the relevance order, so the caller skips sorting

## quality score (8.2)

- formula: `quality = 0.5 * scoreTerm + 0.3 * ratingTerm + 0.2 * likeTerm`, each term clamped to 0..1
- `scoreTerm = score / 5` (observed range 0 to 4.9)
- `ratingTerm = rating / 1.2` (observed range 0 to about 1.13, a mix of ints and decimals; the cap leaves headroom so one outlier does not saturate the scale)
- `likeTerm = ln(1 + like) / ln(1 + 25)` (observed maximum 25; the log keeps a few heavily liked games from dominating, and it maps 0 to 0)
- the scales are fixed constants, not min/max of the loaded games, so a game's quality never changes when load more appends a page and the order of already shown games stays put
- 8.2 handling: a game with `score` 0 and a nonzero `rating` is not treated as unrated; its `scoreTerm` is 0 and it still earns the rating and like terms, so it ranks above a game with all three at 0
- `level` is not part of the formula (kept separate per the brief); `runCount` and `seenCount` are excluded because they already have their own sort keys and would double count popularity
- non-finite or negative inputs count as 0 so a malformed value cannot produce `NaN` in a sort comparator
- the weights and caps are named constants at the top of `lib/quality.ts`; the formula is written in the README in step 14

## sortGames rules

- accepts only `SortKey` (`score`, `runCount`, `seenCount`, `like`, `quality`); an invalid key fails to compile
- `quality` sorts by `qualityScore(game)`; every other key sorts by that numeric field on `Game`
- descending order; equal values break the tie by `_id` ascending (plain string comparison, not locale based), so the result is deterministic and does not depend on the input order
- returns a new array; the input is not mutated
- sorting only sees the games already loaded; this limit is handled and documented in step 12

## pagination-meta helpers (8.4)

- `getNextPageId(page, loadedCount)` where `page` is `{ pageId, eachPerPage, total, receivedCount }` for the page just fetched and `loadedCount` is the number of unique games held after merging; returns the next page number or `null` when there is nothing more to load
- stop (`null`) when any of these hold, checked in this order: the page came back empty; the page is shorter than `eachPerPage` (a short page is the last page); `loadedCount >= total`
- otherwise return `pageId + 1`
- `total` or `eachPerPage` that is not a positive finite number is treated as unknown: the `total` rule is skipped and the empty and short-page rules still end the loop, so a bad envelope can never loop forever
- `describePageMismatch(page)` returns a small union that names what was found: `"none"`, `"empty"` (no games on a page that should have some), `"short"` (fewer than `eachPerPage` while `pageId * eachPerPage < total`, so more were promised), `"long"` (more than `eachPerPage`), or `"total-exceeded"` (a page past `ceil(total / eachPerPage)` still returned games); the final short page is not a mismatch
- `mergeGames(existing, incoming)` appends `incoming` to `existing`, keeps the first occurrence of each `_id`, keeps order, and returns a new array without mutating either input
- duplicates inside `incoming` itself are also dropped
- these helpers never fetch and never read state, so step 12 owns the `AbortController` or request-ID guard

## tests

- `lib/quality.test.ts`: all-zero game scores 0; maximum values score 1; values above the caps are clamped; `score` 0 with a nonzero `rating` scores above the all-zero game and below a game with the same `rating` and a real `score`; log scale for `like` (the step from 0 to 5 likes is worth more than from 20 to 25); negative and `NaN` inputs count as 0; `level`, `runCount`, and `seenCount` do not change the result
- `lib/sort.test.ts`: each of the five keys sorts descending; equal keys fall back to `_id` ascending; the result is the same for any input order; input not mutated; a zero-score game with a nonzero rating lands correctly under `quality`; an empty array; `@ts-expect-error` proof that `"relevance"` and `"level"` are rejected
- `lib/pagination.test.ts`: a full page with more to load returns `pageId + 1`; the last full page stops on `loadedCount >= total`; an empty page stops even when `total` says more; a short page stops; a `total` of 0 or `NaN` still ends on the empty or short page and never returns a page forever; `describePageMismatch` for each of `none`, `empty`, `short`, `long`, and `total-exceeded`, including that the legitimate last short page reports `none`; `mergeGames` drops repeated `_id`s across pages and inside one page, keeps order, and leaves inputs untouched
- fixtures come from a small `makeGame` helper inside each test file (the same shape as in `lib/filter.test.ts`)

## decisions to confirm

- weights 0.5 / 0.3 / 0.2 and the caps 5, 1.2, and 25 are my proposal from the sampled ranges in `architecture.md`; I will re-check them against a fresh live sample before implementing and report any outlier that changes a cap
- all sorts are descending only; an ascending toggle is not in the brief, so it is left out
- the tie-break is `_id` as the plan says, not `createdAtIso`
- a short page ends loading even when `total` promises more; the mismatch is reported through `describePageMismatch` instead of retrying

## when to be done

- `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass
- no `any`, `@ts-ignore`, or `as unknown as`; `lib/` has no React imports
- `architecture.md` has the quality formula and the mismatch rules, the README has the formula and the mismatch decision, and `progress-tracker.md` has the step 05 entry and the AI usage note
