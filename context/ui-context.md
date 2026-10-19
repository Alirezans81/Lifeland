# UI Context

## Theme

Persian RTL game-discovery section. Light theme is required; dark mode is a bonus and needs proper contrast ratios. Clean card-based grid that foregrounds game artwork. Optional storytelling headline in Persian (e.g. "Discover your next favorite game").

## Language and Direction

- All UI copy is Persian; `<html lang="fa" dir="rtl">`.
- Use logical properties (`inline-start/end`) instead of left/right.
- Persian typography: proper font stack (e.g. Vazirmatn), generous line-height, consistent digit rendering (pick Persian or Latin digits for display and stay consistent).

## Colors

Define as CSS custom properties; components use tokens only. Final values are open (see progress tracker).

| Role            | CSS Variable       | Value    |
| --------------- | ------------------ | -------- |
| Page background | `--bg-base`        | `#[hex]` |
| Surface         | `--bg-surface`     | `#[hex]` |
| Primary text    | `--text-primary`   | `#[hex]` |
| Muted text      | `--text-muted`     | `#[hex]` |
| Primary accent  | `--accent-primary` | `#[hex]` |
| Border          | `--border-default` | `#[hex]` |
| Focus ring      | `--focus-ring`     | `#[hex]` |
| Error           | `--state-error`    | `#[hex]` |
| Success         | `--state-success`  | `#[hex]` |

## Typography

| Role    | Font               | Variable      |
| ------- | ------------------ | ------------- |
| UI text | Persian font (TBD) | `--font-sans` |

## Border Radius

To be defined (small for inputs/badges, medium for cards, large for overlays).

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
