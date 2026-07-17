# M0 — Summary

## Status

**Completed.**

The following work has been implemented:

* Created `lib/fonts.ts` using **Archivo** and **IBM Plex Mono** via `next/font/google`.
* Rewrote `app/globals.css` with the complete light-theme token surface, plus dark-theme placeholders (currently identical values, to be populated at **M8**) and a global `prefers-reduced-motion` safety net.
* Rewrote `app/layout.tsx` with production metadata and the new font configuration while keeping the layout chrome-free.
* Reduced `app/page.tsx` to a minimal placeholder.
* Updated `eslint.config.mjs` to exclude `docs/references/**`, preventing reference material from being linted as application code.

---

# Architectural Decisions

## Tailwind v4 token configuration

No separate Tailwind configuration file has been introduced.

This project uses **Tailwind CSS v4**, where design tokens are defined directly using an `@theme` block inside `app/globals.css` rather than `tailwind.config.ts`.

The roadmap's "Tailwind token configuration" therefore lives entirely within `app/globals.css`, reducing unnecessary project files.

---

## Theme architecture

No `dark:` variants are used.

Instead, semantic CSS custom properties are defined on:

* `:root`
* `:root[data-theme="dark"]`

Components consume only semantic utility classes (for example `bg-ivory` and `text-ink`), with the active attribute selector determining the resolved values.

This directly implements the architecture described in:

* `02-architecture.md`
* `05-decisions.md` (ADR-011)

No Tailwind dark-mode configuration is required.

---

## Colour token strategy

The initial design system defines six core semantic colour tokens:

* `ivory`
* `ivory-2`
* `card`
* `ink`
* `accent`
* `plate-accent`

Supporting colours are intentionally derived rather than duplicated.

Examples:

* Hairlines use utilities such as `border-ink/16`
* Secondary text uses `text-ink/70`

instead of introducing additional semantic tokens.

The chart's dark plate reuses the existing `ink` and `ivory` colours rather than creating visually redundant variants.

`plate-accent` is the single additional token because the bronze accent requires a lighter value to maintain sufficient contrast on the dark chart plate.

---

## Removal of Create Next App dark mode

The default Create Next App stylesheet included:

```css
@media (prefers-color-scheme: dark)
```

This has been removed because it implements operating-system-driven theming, which conflicts with the project's explicit attribute-driven theme architecture planned for **M8**.

Leaving it in place would have introduced competing theme mechanisms.

---

# Roadmap Alignment

No roadmap deviations were made within the scope of M0.

The reductions in token count and configuration files are implementation simplifications that preserve the roadmap's objectives without changing project scope.

---

# Notes for Review

## Tailwind `@theme` diagnostics

Some generic CSS tooling reports `@theme` as an unknown at-rule.

This is expected behaviour from tools that do not yet understand Tailwind CSS v4 syntax.

The project's PostCSS pipeline processes the rule correctly, confirmed by:

* successful `next build`
* working development server

No action required.

---

## Unused public assets

The default Create Next App SVG assets in `public/*.svg` are now unreferenced.

They have been intentionally left in place because their removal was outside the scope of M0.

---

## UI verification tooling

`chromium-cli` was unavailable in the implementation environment.

The Playwright CLI screenshot command was used instead, following the documented fallback procedure.

If UI verification becomes a recurring workflow, a project-specific setup generated via the recommended tooling may be worth considering in the future.

---

# Next Milestone

**Ready for M1 — Global Chrome and Route Skeleton.**
