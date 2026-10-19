# UI Context

## Theme

Persian RTL game-discovery section. Light theme is required; dark mode is a bonus and needs proper contrast ratios. Clean card-based grid that foregrounds game artwork. Optional storytelling headline in Persian (e.g. "Discover your next favorite game").

lifelands.ir itself is a dark, neon-purple gaming site (near-black backgrounds, violet/indigo accents, glow shadows). This project keeps that brand identity: the dark theme mirrors the site, and the light theme is a derived counterpart that keeps the same indigo-violet accent. The theme follows `prefers-color-scheme` through CSS variables only (no JS toggle yet).

## Source of Colors (lifelands.ir)

Extracted on 2026-10-19 from the site's CSS (`:root` custom properties and hero styles). Notable source values:

| Site variable / value                     | Hex       | Used here as                       |
| ----------------------------------------- | --------- | ---------------------------------- |
| `--main-color`                            | `#615ee1` | Light accent                       |
| `--neon-purple`                           | `#8b5cf6` | Dark accent family (lightened)     |
| `--primary` / `--primary-light`           | `#667eea` / `#7f9cf5` | Reference only         |
| `--dark-bg` / `--darker-bg`               | `#0a0a0f` / `#05050a` | Dark page background   |
| `--dark-card`                             | `#1a1a2e` | Dark surface                       |
| `--dark-border`                           | `rgba(102,126,234,.2)` | Dark border (solid equivalent) |
| `--success` / `--danger`                  | `#10b981` / `#ef4444` | State hues (adjusted)  |
| `--text-secondary` / `--text-muted`       | white at 70% / 40% | Dark muted text (adjusted) |

The site's raw values are not used verbatim where they fail WCAG AA (for example `#8b5cf6` on `#1a1a2e` is 4.0:1, and `#10b981` on white is below 4.5:1), so the tokens below are tuned versions of the same hues.

## Language and Direction

- All UI copy is Persian; `<html lang="fa" dir="rtl">`.
- Use logical properties (`inline-start/end`) instead of left/right.
- Persian typography: proper font stack (e.g. Vazirmatn), generous line-height, consistent digit rendering (pick Persian or Latin digits for display and stay consistent).

## Colors

Defined in `app/globals.css` as CSS custom properties on `:root` (light) and overridden inside `@media (prefers-color-scheme: dark)`. They are exposed to Tailwind through `@theme inline`; components use the Tailwind utilities or the variables, never hex values.

| Role              | CSS Variable          | Tailwind utility suffix | Light     | Dark      |
| ----------------- | --------------------- | ----------------------- | --------- | --------- |
| Page background   | `--bg-base`           | `base`                  | `#f6f6fb` | `#0a0a0f` |
| Surface           | `--bg-surface`        | `surface`               | `#ffffff` | `#1a1a2e` |
| Primary text      | `--text-primary`      | `primary`               | `#17181a` | `#f4f4fa` |
| Muted text        | `--text-muted`        | `muted`                 | `#5a5d6e` | `#a3a5b8` |
| Primary accent    | `--accent-primary`    | `accent`                | `#615ee1` | `#a78bfa` |
| Text on accent    | `--accent-foreground` | `accent-foreground`     | `#ffffff` | `#0a0a0f` |
| Border            | `--border-default`    | `border`                | `#d9dbe8` | `#34345a` |
| Focus ring        | `--focus-ring`        | `focus-ring`            | `#615ee1` | `#a78bfa` |
| Error             | `--state-error`       | `error`                 | `#c62828` | `#f87171` |
| Success           | `--state-success`     | `success`               | `#047857` | `#34d399` |

Usage examples: `bg-base`, `bg-surface`, `text-primary`, `text-muted`, `bg-accent text-accent-foreground`, `border-border`, `text-error`.

### Contrast (WCAG, measured)

| Pair                          | Light  | Dark   |
| ----------------------------- | ------ | ------ |
| Primary text on base          | 16.5:1 | 18.0:1 |
| Primary text on surface       | 17.8:1 | 15.6:1 |
| Muted text on base / surface  | 6.0 / 6.5:1 | 8.1 / 7.0:1 |
| Accent text on base / surface | 4.7 / 5.0:1 | 7.3 / 6.3:1 |
| Text on accent fill           | 5.0:1  | 7.3:1  |
| Error on base / surface       | 5.2 / 5.6:1 | 7.1 / 6.2:1 |
| Success on base / surface     | 5.1 / 5.5:1 | 10.3 / 8.9:1 |

The border is a decorative divider (about 1.3:1 light, 1.7:1 dark); anything that must be perceivable as a control boundary relies on the focus ring or a filled state instead.

## Typography

| Role    | Font      | Variable      |
| ------- | --------- | ------------- |
| UI text | Vazirmatn | `--font-sans` |

lifelands.ir uses the Vazir family (with IRANSans/YekanBakh fallbacks) and Persian digits via `tabular-nums`. Vazirmatn is the maintained successor of Vazir and is loaded through `next/font/google` as `--font-vazirmatn`. Body `line-height` is `1.8`.

## Border Radius

Tailwind utilities map to `@theme` tokens in `app/globals.css`. The site uses soft, rounded shapes (12-15px cards, 20px and pill buttons).

| Use                 | Utility        | Value     |
| ------------------- | -------------- | --------- |
| Inputs, badges      | `rounded-sm`   | `0.5rem`  |
| Cards               | `rounded-md`   | `0.875rem` |
| Overlays, dropdowns | `rounded-lg`   | `1.25rem` |
| Pills, chips        | `rounded-pill` | `999px`   |

## UI Principles (from lifelands.ir)

- **Immersive, art-first:** imagery and gradients lead; UI chrome stays quiet. Cards foreground the game artwork.
- **Neon accent, restrained use:** one violet/indigo accent family for primary actions, active states, and glow; neutrals everywhere else.
- **Soft depth over hard borders:** subtle surface contrast, translucent surfaces with `backdrop-filter: blur(...)`, and violet-tinted glow shadows (for example `0 0 10px` / `0 0 20px` glows) instead of heavy outlines. Keep glows light so contrast stays AA.
- **Rounded geometry:** 12-20px radii on cards and buttons, fully round pills for chips and badges.
- **Consistent motion:** short eased transitions (`250ms ease`) on `transform`, `border-color`, `box-shadow`, and `background`; hover lifts and glow. All animation is disabled under `prefers-reduced-motion` (global rule in `globals.css`).
- **RTL-first:** layouts mirror naturally; Persian copy, Persian font, logical properties only.
- **Persian tabular digits** for stats (score, like, run counts) so numbers align across cards.
- **Hierarchy through contrast:** high-contrast titles, muted secondary text (company, stats labels), accent only for interactive or highlighted items.
- **Visible focus:** a global `:focus-visible` outline (2px `--focus-ring`, 2px offset) is defined once in `globals.css`.

## Tailwind Setup

- Tailwind CSS v4 (`tailwindcss` and `@tailwindcss/postcss`), installed as in the Next.js 16 CSS docs (`node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`): the plugin is enabled in `postcss.config.mjs`, which Turbopack picks up automatically, and `app/globals.css` starts with `@import "tailwindcss"`. There is no `tailwind.config` file; theming lives in CSS (`@theme`, `@theme inline`).
- Tokens are defined once as variables, then mapped with `@theme inline` so utilities resolve to the active light or dark value at runtime.
- Conditional and merged class names go through `cn()` from `@/lib/cn` (`clsx` plus `tailwind-merge`).
- Always use `cn()` whenever classes need to be merged or applied conditionally (for example a component's base classes plus a `className` prop or state variants). Never concatenate class strings with template literals or `+`, so conflicting Tailwind utilities resolve correctly.

## Component Library

None. No full UI kit or dashboard template; hand-built components with Tailwind or CSS Modules.

## Layout Patterns

- Section header (title/story line) above a toolbar: search input, vendor multi-select, category filter, score range, sort select, favorites-only toggle.
- Responsive card grid; each card has a fixed image aspect ratio, title, company, vendor badges, score/like/run stats, and a favorite button.
- The skeleton grid reuses the exact card dimensions and grid columns to avoid CLS.
- Empty state: message plus a "reset filters" action. Error state: message plus retry (error boundary is a bonus).
- Load-more button below the grid with a loading state.

## Interaction and Accessibility

- Full keyboard support: logical Tab order, Escape closes dropdowns, visible focus rings.
- Proper labels/ARIA for search, dropdowns (combobox/listbox), and the favorite toggle (`aria-pressed`).
- Announce result-count changes (`aria-live="polite"`).
- Hover states and transitions are welcome; skeleton shimmer and favorite sound/haptics must respect `prefers-reduced-motion`.

## Images

- `next/image` with explicit width/height; lazy-load below the fold.
- The fallback placeholder keeps the card layout intact when an image 404s.

## Icons

Inline SVG or a small icon set (no UI kit); stroke-based, consistent sizes.
