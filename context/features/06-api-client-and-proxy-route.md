## API client, boundary validation, image URL, and proxy route

- add `resolveImageUrl` in `lib/image.ts`: pure, turns the relative `image` path into an absolute URL on the confirmed media host, or `null` when there is nothing usable
- add `parseGamesPage` in `lib/parse-games.ts`: pure, takes the `unknown` JSON of the upstream response, validates it at the boundary, and maps it to client-safe `Game` objects (no `creator`, trimmed category, normalized vendors)
- add `fetchGamesPage` in `lib/games-client.ts`: fetches `GET https://lifelands.ir/api/v1/games?pageId=N`, runs the parser, and returns a typed result instead of throwing; the `fetch` function is injectable so tests never touch the network
- add `parsePageIdParam` in `lib/page-id.ts`: pure, validates the `pageId` query value for the route
- add `getGamesPage` in `app/_data/get-games-page.ts`: the one cached entry point (`use cache` + `cacheLife`), shared by the route handler now and by the server-rendered first page in step 07
- add the route handler `app/api/games/route.ts`: validates input, calls `getGamesPage`, and returns a consistent success or error JSON shape with proper status codes
- no React imports in `lib/`, no new dependencies, no UI changes

## image base URL (8.1)

- resolved from the live site's JS bundles and verified with HEAD requests on 2026-10-20: the public media host is `https://dl.lifelands.ir/`
- `https://dl.lifelands.ir/game/file-1791705692709.webp` and two more sampled game images returned 200 with `image/webp` and `image/png` content types; a made-up path returned 404, so the host does not answer 200 for everything
- the API response contains no absolute URL anywhere, so the base has to be a constant in `lib/image.ts`
- `Game.image` stays the raw relative path; the card (step 07) calls `resolveImageUrl` when it renders
- `next/image` needs `dl.lifelands.ir` in `remotePatterns`; that config change belongs to step 07, where the image is first rendered
- other relative fields seen in the sample (`headerImage`, `portraitHeaderImage`) resolve on the same host (`placeholder/header-placeholder.png` returned 200), but the app does not use them

## resolveImageUrl rules

- `resolveImageUrl(path)` returns `string | null`
- a blank or whitespace-only path returns `null`, so the card can show its placeholder immediately
- a relative path: leading slashes are removed and the path is appended to `IMAGE_BASE_URL`
- a path that is already `https://` or `http://` is returned unchanged; any other scheme (`javascript:`, `data:`) and any path containing a `..` segment returns `null`
- spaces and other unsafe characters are percent-encoded per segment; `/` separators stay
- `IMAGE_BASE_URL` is a named exported constant

## boundary validation and mapping

- `parseGamesPage(payload: unknown)` returns `{ ok: true, page } | { ok: false, reason }`; it never throws and uses type guards only (no `as`, no `any`)
- envelope: the payload must be an object with `state === true` and an object `data`, otherwise `reason` is `"bad-envelope"`
- page meta: `pageId`, `eachPerPage`, and `total` must be finite numbers and `games` must be an array, otherwise `"bad-page"`
- each game is validated on its own: `_id` is a non-empty string, `title` is a string that is not empty after trimming, and `score`, `rating`, `like`, `level`, `runCount`, `seenCount` are finite numbers; a game that fails any of these is dropped
- lenient fields with a safe default: `companyName` missing or not a string becomes `""` (trimmed otherwise), `category.title` missing becomes `""` (trimmed otherwise), `image` and `createdAtIso` missing become `""`
- `vitrinThirdPartyVendors` missing or not an array becomes `[]`; unknown vendor strings are dropped through `isVendor`, so `Game.vendors` only holds `Vendor` values (this applies the missing-field note in `architecture.md`)
- the mapper copies fields by name into a new object, so `creator`, `reviewHistory`, and every other upstream field cannot reach the client; a test checks that the output has no `creator` key
- the parsed page is `{ games, pageId, total, eachPerPage, receivedCount }` where `receivedCount` is the raw length of the upstream `games` array before any game was dropped
- why `receivedCount`: `getNextPageId` ends loading on a short page, so if the client counted only mapped games, one dropped item would look like the last page and load more would stop early; the raw count keeps the 8.4 logic honest (it feeds `PageMeta.receivedCount` from step 05)

## API client

- `fetchGamesPage(pageId, options)` with `options: { signal?: AbortSignal; fetcher?: typeof fetch }`
- result: `{ ok: true, page } | { ok: false, error }` where `error.kind` is `"network"` (fetch threw or timed out), `"upstream-status"` (non-2xx, carries the status), `"invalid-json"`, or `"invalid-payload"` (parser rejected it, carries the parser `reason`)
- the request has a 10 second timeout combined with the caller's signal, so a hung upstream cannot hold a route handler open
- the base URL is a constant in the file; the only variable part is `pageId`, passed through `URLSearchParams`, so nothing user-controlled is concatenated into the URL
- no secrets and no custom headers; the endpoint is public
- the client does no caching of its own; caching sits one level up in `getGamesPage`

## route handler

- `GET /api/games?pageId=N` in `app/api/games/route.ts`; it validates, delegates, and formats the response, nothing else
- `parsePageIdParam(value: string | null)` accepts `null` (missing, meaning page 1) or a string matching a positive integer without leading zeros up to `MAX_PAGE_ID`; it returns the number, or `null` for anything else
- an invalid `pageId` (`abc`, `0`, `-1`, `1.5`, `01`, empty, above the max) returns 400 with the error shape
- success: 200 with `{ games, pageId, total, eachPerPage, receivedCount }`
- error shape: `{ error: { code, message } }` with `code` one of `"invalid-page-id"` (400), `"upstream-unavailable"` (502, for `network` and `upstream-status`), or `"invalid-upstream-payload"` (502, for `invalid-json` and `invalid-payload`); the message is a short English string for developers, and the UI maps `code` to Persian text later
- a page past the end is valid: upstream returns an empty `games` array, so the route returns 200 with `games: []` and the load-more helpers end the loop
- the handler reads the query through `request.nextUrl.searchParams`, so it runs at request time under Cache Components, and the cache lives in `getGamesPage`
- no `console.log`; errors are returned, not logged

## revalidate decision

- checked against `node_modules/next/dist/docs` (Route Handlers, `use cache`, `cacheLife`): with `cacheComponents: true` a `GET` handler runs at request time by default, `use cache` cannot sit directly in the handler body, and the documented pattern is a helper with `use cache` plus `cacheLife`
- `getGamesPage(pageId)` is that helper; the cache key is the `pageId` argument, so each page is cached separately and the route and the step 07 page share the same entries
- proposed value: `cacheLife({ stale: 60, revalidate: 300, expire: 3600 })`, which means a background refresh at most every 5 minutes
- why 5 minutes: the catalog is 729 games and the fields that move (`like`, `runCount`, `seenCount`) change slowly, so they do not need to be live; new games are added rarely; a short window keeps the first page fast and light on the upstream without showing stale data for long, and `expire` of 1 hour bounds how old an unused page can get
- failures should not be cached for 5 minutes: on the error branch the helper calls a short `cacheLife` instead, so one bad upstream response cannot pin an error; the docs allow different `cacheLife` calls per branch as long as only one runs per invocation
- I will confirm in `next build` and a local run that the error branch really is short lived before relying on it, and record the result in the tracker; if the docs or behavior say otherwise, the fallback is to throw from the cached helper so errors are never stored, and I will report that instead of guessing
- the justification goes into the README in step 14

## tests

- `lib/image.test.ts`: a relative path resolves on `https://dl.lifelands.ir/`; leading slashes are stripped; an absolute `https://` URL is unchanged; blank and whitespace-only return `null`; `javascript:` and `data:` return `null`; a path with `..` returns `null`; a path with a space is percent-encoded
- `lib/parse-games.test.ts` with fixture payloads: a clean page maps all fields; an empty `vitrinThirdPartyVendors` and a missing one both give `[]`; an unknown vendor is dropped; a trailing-space category is trimmed; an empty `companyName` stays `""`; `creator` is absent from the output; a malformed item (missing `_id`, string instead of number, blank title) is dropped while the others stay and `receivedCount` is the raw length; `state: false`, a non-object payload, `null`, and a missing `games` array each return a failure with the right `reason`
- `lib/games-client.test.ts` with an injected fetcher: the request URL carries `pageId`; a 200 with a valid body returns `ok`; a 500 returns `upstream-status` with the status; a thrown fetch returns `network`; a body that is not JSON returns `invalid-json`; valid JSON of the wrong shape returns `invalid-payload`; an already aborted signal returns `network`
- `lib/page-id.test.ts`: `null` gives 1; `"1"`, `"12"`, and the max are accepted; `"0"`, `"-1"`, `"1.5"`, `"01"`, `""`, `"abc"`, `" 2"`, and max plus one return `null`
- the route handler and `getGamesPage` are thin and are not unit tested (Vitest only covers `lib/` and `types/`); they are verified against the running app instead

## manual verification

- `npm run dev`, then request `/api/games?pageId=1` and check 12 games, `total`, `eachPerPage`, `receivedCount`, vendors as an array, trimmed categories, and no `creator`
- `/api/games` without `pageId` returns page 1
- `/api/games?pageId=0`, `?pageId=abc`, `?pageId=-1`, `?pageId=1.5`, and `?pageId=99999` return 400 with the error shape
- `/api/games?pageId=100` (past the end) returns 200 with an empty `games` array
- repeat one request and confirm the second is served from the cache (same body, faster)
- search `components/`, `hooks/`, and client code to confirm nothing references `lifelands.ir`; only `lib/games-client.ts` and `lib/image.ts` hold the hosts

## decisions to confirm

- the media host `https://dl.lifelands.ir/` is taken from the site's own bundles and verified by HEAD requests; it is a constant in code rather than an env var because it is public and there are no secrets
- a malformed game is dropped rather than failing the whole page, and `receivedCount` carries the raw length so load more stays correct
- `getGamesPage` lives in `app/_data/` (not `lib/`) because `use cache` and `cacheLife` come from `next/cache`, and `lib/` stays free of framework imports
- the cache lifetime of 5 minutes revalidate, 1 hour expire, with a short lifetime for errors
- error codes and statuses: 400 for a bad `pageId`, 502 for upstream failures, with English developer messages and a Persian mapping in the UI later

## when to be done

- `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass
- the manual checks above pass against the dev server, and the malformed `pageId` cases return 400
- no `any`, `@ts-ignore`, or `as unknown as`; `lib/` has no React or `next` imports; no `console.log`
- `architecture.md` has the image base URL (replacing the open question), the validation rules, and the revalidate decision; the tracker has the step 06 entry, the closed open questions, and the AI usage note
