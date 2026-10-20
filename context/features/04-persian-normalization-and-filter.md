## persian normalization and filterGames

- add `normalizePersian` in `lib/normalize.ts`: ی/ي (U+064A) and ک/ك (U+0643) unified to the Persian forms, Persian (U+06F0 to U+06F9) and Arabic-Indic (U+0660 to U+0669) digits to Latin, ZWNJ (U+200C) removed, whitespace collapsed and trimmed, Latin letters lowercased so `Lifelands` matches `lifelands`
- add `filterGames` in `lib/filter.ts`: pure, takes `(games, filter, favoriteIds)` and returns a new array in the original order (sorting is step 05)
- `filter` is the existing `FilterState`; the query is read only when `mode === "search"`, so the discriminant is narrowed instead of reading an optional field
- `favoriteIds` is a `ReadonlySet<string>` so the function stays independent of `useFavorites`
- apply the empty-vendor policy (8.3) here and record the justification in `architecture.md` and the README

## filter rules

- search: normalize the query and split it on spaces; every token must appear in the normalized `title` plus `companyName`; an empty or whitespace-only query keeps every game
- vendors: an empty selection keeps every game; otherwise a game stays when at least one of its vendors is selected (OR within the filter)
- category: compare `normalizePersian(game.categoryTitle)` with `normalizePersian(filter.category)`, so a trailing space never breaks a match; `null` keeps every game
- score range: inclusive on `score`; `null` keeps every game
- favorites only: keeps games whose `_id` is in `favoriteIds`
- criteria combine with AND

## decisions

- empty-vendor policy (8.3): games without vendors are included while no vendor is selected and excluded once any vendor is selected; a vendor filter means "published on this platform", so a game on no platform cannot match it (26 of 48 sampled games have none, and the field is missing on 27 of 117 in a later sample)
- rejected alternative: an "unspecified" bucket; it would widen `FilterState.vendors` from `Vendor[]` to `Vendor | "unspecified"` and add a fake vendor to the UI for data that is mostly a gap; it can be added later by changing the type and one rule
- `Game.vendors` is always an array (the optional field is normalized at the API client boundary in step 06), so `filterGames` never checks for `undefined`
- `normalizePersian` is the only place that knows about character variants; `filterGames` calls it and never re-implements it
- token AND matching instead of one substring check, so `بازی ماشین` finds a title where the words are not adjacent

## tests

- `lib/normalize.test.ts`: Arabic and Persian digits, ی/ي and ک/ك, ZWNJ removal, whitespace collapse and trim, Latin lowercase, an empty string, and idempotence (`normalizePersian(normalizePersian(x))` equals `normalizePersian(x)`)
- `lib/filter.test.ts`: search over `title` and `companyName` with variant letters and digits, multi-token search, empty and whitespace query, vendor OR match, empty vendors included with no selection and excluded with one, category match with a trailing space, empty `companyName`, inclusive score range edges, favorites-only, combined criteria, original order kept, input array not mutated
- fixtures come from a small `makeGame` helper inside the test file that fills a full `Game` and accepts overrides

## when to be done

- `npm run test`, `npm run lint`, and `npm run build` pass
- no `any`, `@ts-ignore`, or `as unknown as`
- `lib/` has no React imports
- `architecture.md` has the 8.3 paragraph, the README has the empty-vendor decision, and `progress-tracker.md` has the step 04 entry and the AI usage note
