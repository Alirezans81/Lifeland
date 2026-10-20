# Hooks: debounce, URL state, and favorites

## Scope

- Implement three independent hooks: `useDebounce`, `useUrlState`, and `useFavorites`.
- Add pure serialization and storage helpers where they simplify testing and keep browser-specific logic out of shared utility code.
- Prepare the state-management foundation for the Game Explorer without implementing the complete search, filtering, sorting, or favorites UI.
- Keep the initial data fetch in a Server Component. These hooks must not replace or move the initial server fetch into `useEffect`.
- Follow the installed Next.js documentation for navigation APIs and the project's Cache Components configuration.

## Files and responsibilities

- `hooks/use-debounce.ts`: exports the generic `useDebounce<T>(value, delay)` hook.
- `hooks/use-url-state.ts`: exports `useUrlState<T>(key, defaultValue)` and integrates with the App Router's navigation APIs.
- `hooks/use-favorites.ts`: exports `useFavorites()` for persistent favorite IDs and a toggle operation.
- `lib/url-state.ts` or the project's chosen pure utility module: contains URL serialization and deserialization helpers if they are needed independently of React.
- `lib/favorites-storage.ts` or the project's chosen pure utility module: contains safe favorites parsing and serialization helpers if they are needed independently of React.
- Relevant test files: cover pure serialization and storage behavior using the existing Vitest `node` environment.
- `context/progress-tracker.md`: records the implementation and actual verification results.
- `README.md` and `context/architecture.md`: document the URL-state model and favorites persistence decisions when those decisions are confirmed.

Use the existing directory and naming conventions if the repository already uses different filenames. Do not create duplicate helpers or unnecessary abstraction layers.

## Hook independence

- Each hook must be independently understandable and must not import another hook's private implementation.
- Shared pure functions may be imported from `lib/`.
- `lib/` must contain no React imports.
- Keep browser-specific behavior inside hooks or explicitly browser-specific modules rather than introducing `window` or `localStorage` access into general-purpose data functions.
- Do not introduce a global state library or a new dependency for these three hooks.
- Keep each hook's API small and strongly typed.
- Do not use `any`, `@ts-ignore`, or `as unknown as`.

## `useDebounce<T>`

### API and behavior

- Signature: `useDebounce<T>(value: T, delay: number): T`.
- Accepts a value of any valid TypeScript type and returns the most recently committed value after the specified delay.
- When the input changes repeatedly before the delay expires, only the most recent value is committed.
- A later value change restarts the waiting period.
- The hook must clean up the pending timeout when the value or delay changes and when the component unmounts.
- The returned value initially matches the supplied value unless the implementation deliberately documents a different initial contract. Prefer the immediate initial value to avoid an unnecessary initial delay.
- The hook must not mutate the incoming value.
- The hook must not perform filtering, sorting, URL updates, or network requests itself.

### Integration expectations

- The search input will use local draft state for immediate typing responsiveness.
- `useDebounce` will delay committing the draft search value to the URL until the user pauses typing.
- The hook remains generic and unaware of Persian normalization or the Game model.
- Persian normalization belongs to the pure search/filter layer, not the debounce hook.

## `useUrlState<T>`

### API and behavior

- Signature: `useUrlState<T>(key: string, defaultValue: T): [T, (value: T) => void]`.
- Uses the Next.js App Router navigation APIs to read and update query-string state.
- The URL is the persistent source of truth for shareable search and filter state.
- If the key is absent, the hook returns the supplied default value.
- A valid query value is deserialized into the requested state representation.
- Missing or invalid values fall back safely to the default rather than crashing the page.
- Updating a value changes the corresponding query parameter without discarding unrelated query parameters.
- Setting a value equal to the default should remove the corresponding query parameter where appropriate, keeping shared URLs compact.
- Arrays and numbers must have an explicit, deterministic serialization format.
- Empty arrays, empty strings, and other default-equivalent values must have documented handling.
- URL serialization must be reversible for supported values: serializing a value and deserializing it should reproduce the same logical value.
- Preserve unrelated query parameters when updating one key.
- Do not overwrite the entire query string when changing a single filter.
- Do not perform navigation during render.
- Avoid navigation loops caused by repeatedly serializing a value that has already been committed to the URL.
- Use `replace` for high-frequency transient updates such as typing, and use `push` for changes that should create a navigable history entry. The chosen behavior must be explicit at the call site or clearly defined by the hook's API.
- Back and forward navigation must restore the corresponding URL-derived state.
- Read and write query parameters using the documented Next.js App Router APIs for the installed framework version.

### Type-safety considerations

- TypeScript's generic `T` does not, by itself, define a runtime parser for arbitrary values.
- Do not pretend that arbitrary JSON can safely be converted to every possible `T`.
- Use a documented serialization contract, a constrained supported-value type, or an explicitly typed parser/serializer configuration if the implementation requires runtime type information.
- Avoid unsafe casts when reading query parameters.
- If the existing project uses a generic hook API, keep its runtime assumptions narrow and documented.
- The URL state must remain compatible with the discriminated `FilterState` model defined in `types/filter.ts`.
- Invalid URL values must not create impossible filter states or invalid sort keys.

### URL and SSR behavior

- Do not read `window.location` during server rendering.
- Avoid a hydration mismatch between the server-rendered page and the client.
- Use the App Router's navigation hooks and handle the initial/default state according to the documented API.
- If `useSearchParams` requires a `Suspense` boundary in the installed Next.js configuration, document and implement the required boundary at the appropriate level.
- Keep URL state separate from the server-fetched first page of games.
- The hook must not fetch data from the Lifelands API.
- Do not treat browser history as a replacement for local draft state in a debounced input.

## `useFavorites`

### API and behavior

- Signature: `useFavorites()` returning `{ favorites: Set<string>; toggle }`, with the exact toggle signature documented in the implementation.
- Favorite identifiers are game IDs (`Game._id`), not titles, array indexes, or company names.
- Toggling an ID adds it when absent and removes it when already present.
- The returned favorites collection must be safe to consume as a read-only value; do not mutate a `Set` that belongs to a previous React state snapshot.
- Every update must produce a new state value so React can detect the change.
- Favorite IDs must persist in browser `localStorage`.
- The hook must remain usable during server rendering and must not access `localStorage` at module initialization or during render.
- The initial render must not depend on a browser-only storage read that the server cannot reproduce.
- Load persisted favorites after the component mounts, or use another explicitly documented SSR-safe approach.
- Avoid hydration mismatches when the server and browser have different access to local storage.
- If local storage is unavailable, blocked, malformed, or contains unexpected data, the hook must continue operating with a safe in-memory state.
- Invalid stored values must not crash rendering.
- Store only the minimal information required to identify favorites.
- Do not store full game objects, user information, or API responses in local storage.
- The hook does not render UI, add favorite buttons, or implement the favorites-only filter. Those belong to later steps.

### Storage contract

- Use a documented key name for the favorites entry.
- The stored representation must be deterministic and parseable.
- Parse stored data defensively: validate the outer structure and each ID rather than trusting parsed JSON.
- Treat missing, malformed, or unsupported stored values as an empty favorites collection unless a more appropriate recovery policy is explicitly documented.
- Catch storage access failures where necessary, including failures while reading or writing.
- Keep storage parsing and serialization in pure helpers where possible so they can be tested without a browser.
- Do not add a new dependency for storage management.

## Testing strategy

The current Vitest configuration uses the `node` environment and covers `lib/**/*.test.ts` and `types/**/*.test.ts`. Keep tests aligned with that setup.

### `useDebounce`

- Verify that the hook returns the current value initially.
- Verify that the committed value changes after the delay.
- Verify that a newer value supersedes an earlier value before the delay expires.
- Verify that changing the delay follows the documented timing behavior.
- Verify that pending timers are cleaned up when appropriate.
- If hook-level tests are required, add a DOM test environment and a suitable testing library deliberately; otherwise use a temporary harness and remove it before finishing.

### URL serialization and deserialization

- Missing query parameters return the configured default.
- Valid string values round-trip correctly.
- Numeric values round-trip correctly and reject invalid numeric input.
- Arrays round-trip correctly, including an empty array.
- Empty strings and default-equivalent values follow the documented canonical representation.
- Invalid values fall back safely instead of producing malformed filter state.
- Updating one parameter preserves unrelated parameters.
- Serializing a value and deserializing it reproduces the same logical state.
- Any special handling of duplicate query parameters must be documented and tested.
- Verify that URL state remains compatible with `FilterState` and `SortKey`.

### `useFavorites` and storage helpers

- Missing storage data produces an empty favorites collection.
- Valid stored IDs are restored correctly.
- Malformed JSON produces a safe fallback.
- A valid JSON value of the wrong shape is rejected safely.
- Non-string IDs and empty IDs are rejected.
- Toggling an absent ID adds it.
- Toggling an existing ID removes it.
- Storage parsing and serialization do not mutate their input.
- Storage failures do not prevent in-memory toggling from working.

### Test environment constraints

- Do not claim a React hook has been tested solely because its helper functions pass unit tests.
- If the hooks are tested with a temporary harness, remove that harness and record the actual checks performed.
- If proper hook tests are introduced, document any added dependencies and the reason they are necessary.
- Do not weaken TypeScript strictness to accommodate tests.

## Manual verification

- Run `npm run dev` and open the application.
- Confirm that the hooks do not move the initial game fetch from the server to the browser.
- Exercise `useDebounce` through a small temporary harness or the search UI once it is available.
- Confirm that rapid value changes result in only the final value being committed after the delay.
- Change URL state and confirm that unrelated query parameters remain intact.
- Refresh the page and confirm that supported URL values are restored.
- Use browser back and forward navigation and confirm that the displayed state follows the URL.
- Test absent, malformed, and default-equivalent query values.
- Confirm that array and numeric query parameters serialize and deserialize consistently.
- Confirm that favorite IDs persist across reloads.
- Confirm that toggling a favorite adds or removes the expected ID.
- Test with local storage cleared and with malformed stored JSON.
- Where practical, test behavior when browser storage access is unavailable.
- Inspect the browser console for hydration warnings and runtime errors.
- Run `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

## Decisions to record

- Why the three hooks are independent and which shared logic, if any, belongs in `lib/`.
- The debounce timing contract and cleanup behavior.
- The supported value types and serialization format for URL state.
- How default values are represented in the URL.
- Which updates use `replace` and which use `push`, and why.
- How back and forward navigation synchronizes the state.
- How the generic URL-state API preserves TypeScript safety without unsafe casts.
- The favorites storage key and stored representation.
- How initial favorites loading avoids server/client hydration mismatches.
- How malformed or unavailable storage is handled.
- Whether hook-level tests were added or only pure helpers were tested.
- Any implementation deviations from the proposed API and why they were necessary.

## When to be done

- `useDebounce<T>` delays updates correctly and cleans up pending timers.
- `useUrlState<T>` reads, serializes, and updates supported URL values without discarding unrelated query parameters.
- URL state survives refreshes and is restored by browser back and forward navigation.
- Invalid URL values safely fall back to defaults and cannot create impossible filter states.
- `useFavorites()` supports adding and removing IDs and persists them in local storage.
- The hooks remain independent and do not introduce unnecessary dependencies.
- Server rendering does not depend on browser-only APIs, and hydration remains consistent.
- `lib/` has no React imports.
- `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.
- No `any`, `@ts-ignore`, `as unknown as`, `console.log`, or dead code is introduced.
- The progress tracker records actual verification results, implementation corrections, and AI usage notes.
