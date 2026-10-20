## test runner and api-derived types

- add Vitest (node environment, `@/*` alias, `npm run test` script)
- add a unit test for `cn()` in /lib
- re-fetch the live API and derive /types from the real response (envelope, page, raw game, client-safe game)
- add the `Vendor` union and `isVendor` guard in /lib (task 5.2)
- derive `SortKey` from `Game` with a mapped type, numeric fields only, plus `quality` (task 5.4)
- model `FilterState` as a discriminated union so an incompatible `sort`/`search` combination fails to compile (task 5.3)
- prove the compile-time rejection with `@ts-expect-error` in a type test

## decisions

- the raw `ApiGame` types only consumed fields; `vitrinThirdPartyVendors` is optional because the live API omits it on some games (27 of 117 sampled) besides returning `[]`
- `Game` is the client-safe shape: no `creator`, flat `categoryTitle`, `vendors` narrowed to `Vendor[]`; the mapping from `ApiGame` lands with the API client
- `SortKey` excludes `level` and `rating`: the product sorts by `score`, `runCount`, `seenCount`, `like`, and `quality`; `rating` feeds `quality` and `level` stays separate
- `FilterState` has two modes: `browse` (no query, any `SortKey`) and `search` (query required, any `SortKey` or `relevance`); `relevance` is only valid while searching

## when to be done

- `npm run test`, `npm run lint`, and `npm run build` pass
- no `any`, `@ts-ignore`, or `as unknown as`
- `isVendor` and `cn()` have unit tests; the type test fails to compile if the union stops rejecting invalid states
- `lib/` has no React imports
