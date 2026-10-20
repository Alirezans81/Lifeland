# Server-rendered first page, game card, skeleton, and image fallback

## Scope

- Render the first page of real Lifelands games in the App Router using a Server Component.
- Fetch page 1 through the existing cached `getGamesPage` entry point in `app/_data/get-games-page.ts`. Do not fetch directly from the upstream API in a page or component.
- Render the game section inside `Suspense`, with a loading skeleton that matches the final card dimensions and grid layout closely enough to avoid layout shift.
- Introduce a reusable `GameCard` Server Component and a small client-side image fallback component.
- Configure `next/image` to accept the verified public media host.
- Keep search, filtering, sorting, favorites, and load-more interactions out of this step. Those belong to later features.

## Files and responsibilities

- `app/page.tsx`: the route entry point. It remains a Server Component and renders the page structure and game section.
- `app/_data/get-games-page.ts`: reuse the existing cached data entry point; do not duplicate fetching or caching logic.
- `components/games/games-section.tsx`: server-rendered section responsible for obtaining page 1 and rendering the initial collection of games.
- `components/games/game-card.tsx`: Server Component that renders a single game's content and visual structure.
- `components/games/games-grid.tsx`: reusable grid markup if the existing project structure benefits from separating the grid from the section. Avoid introducing a component that only adds indirection.
- `components/games/games-skeleton.tsx`: loading placeholder with the same grid columns, image aspect ratio, and card geometry as the final content.
- `components/games/game-image.tsx`: small Client Component that handles image loading failure and switches to a placeholder without changing the card's dimensions.
- `next.config.ts`: add the remote image configuration required by `next/image`.
- `context/progress-tracker.md`: record the implementation, actual verification results, decisions, and AI usage notes.
- `README.md` and `context/architecture.md`: update relevant decisions as they are confirmed.

Use the actual existing directory and naming conventions where they differ from these suggested paths. Do not create duplicate components if equivalent ones already exist.

## Data flow and server boundary

- The initial request fetches page 1 through `getGamesPage(1)`.
- The upstream API is accessed only by the server-side API client in `lib/games-client.ts`.
- The cached data entry point remains the shared boundary between the route handler and the server-rendered page.
- The browser must never fetch `https://lifelands.ir/api/v1/games` directly.
- The initial response contains at most 12 games, based on the verified `eachPerPage` value.
- Use the existing client-safe `Game` type from `types/game.ts`; do not define a second, inconsistent game type for the UI.
- The `creator` object and other unused upstream fields must never be forwarded to the client.
- The card consumes the mapped `Game` model, including the normalized vendor list.
- Use the actual page metadata returned by the data layer where needed; do not hardcode `total` or assume every future page contains exactly 12 valid games.

## Server Components and Suspense

- `app/page.tsx`, the game section, and the card remain Server Components by default.
- Do not add `'use client'` to the page or the entire game section.
- Keep client-side behavior limited to the image fallback or another genuinely interactive leaf component.
- Wrap the asynchronous game section in `Suspense` so the page can stream its surrounding structure while the data-dependent section is pending.
- The fallback should reproduce the final grid's responsive column structure and card dimensions.
- Skeleton cards must reserve the same image area and approximate text/statistic heights as the finished cards.
- Avoid arbitrary skeleton dimensions that cause the grid to jump when real data arrives.
- Decide whether a route-level `app/loading.tsx` is also needed. If it is added, document how it differs from the component-level `Suspense` fallback and verify that it does not duplicate or interfere with the intended loading behavior.
- Follow the installed Next.js documentation for the configured Cache Components behavior. Do not assume examples from older Next.js versions apply unchanged.

## GameCard requirements

- Render the game's image, title, company name, vendor badges, score, likes, and run statistics using the available fields in `Game`.
- Handle an empty company name without rendering misleading placeholder text or unnecessary empty space.
- Render only recognized vendors from the existing `Vendor` union.
- Use the project's theme tokens rather than hardcoded colors that duplicate the design system.
- Use `cn()` from `lib/cn.ts` when combining conditional or conflicting Tailwind classes.
- Use logical CSS properties and Tailwind utilities for RTL layouts: `ps-*`, `pe-*`, `ms-*`, `me-*`, `border-s-*`, and `text-start`. Do not use physical `left` or `right` positioning utilities.
- Follow the existing typography, spacing, border, radius, and surface conventions documented in `context/ui-context.md`.
- Keep the layout responsive and ensure long Persian titles and company names wrap or truncate without overflowing.
- Display numeric values using the project's Persian-friendly presentation conventions. Use tabular numerals where appropriate.
- Do not introduce favorite buttons, filter controls, search state, or client-side sorting in this step.
- Keep each card's layout stable when optional fields are empty.

## Image URL and fallback

- The verified media base URL is `https://dl.lifelands.ir/`.
- Game images contain relative paths in the upstream API response.
- Use the existing pure helper `resolveImageUrl` from `lib/image.ts` rather than reconstructing the base URL in the component.
- `resolveImageUrl` returns an absolute URL or `null` for unusable input.
- Configure `next/image` with a narrow `remotePatterns` entry for the verified media host in `next.config.ts`.
- Do not introduce a broad image-host wildcard.
- If the resolved URL is `null`, render the placeholder directly.
- If an image request fails, replace the image with a placeholder inside the same reserved image container.
- The fallback must not depend on hiding the failed image while leaving its layout space undefined.
- Preserve the card's image aspect ratio and dimensions in every state.
- Provide suitable alternative text for meaningful game artwork. If the image is purely decorative in context, use the appropriate empty alternative text.
- Avoid adding a third-party image or icon dependency for the fallback.

## Loading and error behavior

- The skeleton is for the pending state of the asynchronous game section.
- A failed image request is handled locally by the image fallback and must not cause the whole section to fail.
- A failure while obtaining the game page must not silently be represented as a successful empty catalog.
- Define the section's error behavior using the existing typed error handling and the project's established error-state conventions.
- Do not expose upstream response bodies, personal data, or internal exception details to the browser.
- Do not add `console.log` statements.
- If retry behavior is not part of this step, document the intended retry hook-up point rather than introducing a partially implemented client interaction.

## Styling and responsive behavior

- Use the existing Tailwind CSS v4 setup and theme tokens.
- Follow the visual direction documented in `context/ui-context.md`.
- Verify the grid at narrow, medium, and wide viewport sizes.
- The skeleton and real grid must use the same responsive column breakpoints.
- Images must maintain consistent aspect ratios, including when a URL is missing or broken.
- Long text, vendor badges, and statistics must not cause horizontal overflow.
- Maintain visible keyboard focus for any interactive element that is already present.
- Respect `prefers-reduced-motion` for any skeleton animation.
- Preserve both light and dark theme behavior as defined by the global CSS tokens.

## Tests

- Test the pure `resolveImageUrl` behavior through the existing `lib/image.test.ts`; do not duplicate the helper's tests inside the component.
- If a new pure helper is introduced for card presentation or data mapping, add focused unit tests under `lib/` where appropriate.
- If component tests are introduced, add the required DOM testing environment and dependencies only when needed; the existing Vitest configuration uses the `node` environment.
- Do not add a component test that merely repeats a type-level guarantee already covered by existing tests.
- Verify that the card accepts the existing `Game` type without introducing `any`, `@ts-ignore`, or `as unknown as`.
- Keep `lib/` free of React imports.
- If the image fallback is tested manually rather than through a component test, record the actual checks performed.

## Manual verification

- Run `npm run dev`.
- Open `/` and confirm that real games from page 1 are displayed.
- Confirm that the initial server response includes the rendered game content rather than an empty client-only shell.
- Confirm that no browser-side request is made directly to `https://lifelands.ir/api/v1/games`.
- Confirm that the first page displays no more than the returned page's available games.
- Inspect the loading state using throttled network conditions or another reliable way to observe the pending section.
- Confirm that the skeleton and final grid have matching column breakpoints and card dimensions.
- Test a valid image URL and confirm that it displays correctly.
- Test a missing or unusable image path and confirm that the placeholder is rendered.
- Test a broken remote image URL and confirm that the fallback appears without changing the card dimensions.
- Confirm that empty `companyName` values and empty vendor arrays do not break the card.
- Inspect the browser console and server output for errors.
- Test the layout in light and dark modes and at narrow and wide viewport sizes.
- Run `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

## Decisions to record

- Why the first page is fetched in a Server Component rather than through `useEffect`.
- Why the cached `getGamesPage` entry point is reused rather than introducing a second fetch path.
- Whether `Suspense` alone is sufficient or a route-level `loading.tsx` is also warranted.
- Which components remain Server Components and why the image fallback is a Client Component.
- How the skeleton preserves the final card dimensions and avoids layout shift.
- Why the image fallback keeps the image container's geometry stable.
- Which theme tokens and logical layout utilities are used.
- How loading and upstream errors differ from a valid empty page.
- Any deviations from the proposed file structure and why they were necessary.

## When to be done

- The first page renders real API data through the server-side data layer.
- The page and game cards remain Server Components; client behavior is limited to the necessary leaf components.
- The asynchronous section is wrapped in `Suspense` with a skeleton matching the final grid and card geometry.
- Valid images render and broken or missing images fall back without changing card dimensions.
- No upstream `creator` data or unused API fields are exposed to the client.
- `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.
- No `any`, `@ts-ignore`, `as unknown as`, `console.log`, or unnecessary dependencies are introduced.
- The progress tracker records the actual verification results, decisions, and AI usage notes.
