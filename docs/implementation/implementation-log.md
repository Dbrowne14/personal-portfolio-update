# Implementation log

Running record of what was built per milestone, and why. Sequenced per `docs/03-roadmap.md`. Each section is append-only once written — later milestones correct factual errors in earlier sections if discovered, but do not rewrite or reformat them.

---

# M0 — Project substrate

## Status

**Completed.**

The following work has been implemented:

* Created `lib/fonts.ts` using **Archivo** and **IBM Plex Mono** via `next/font/google`.
* Rewrote `app/globals.css` with the complete light-theme token surface, plus dark-theme placeholders (currently identical values, to be populated at **M8**) and a global `prefers-reduced-motion` safety net.
* Rewrote `app/layout.tsx` with production metadata and the new font configuration while keeping the layout chrome-free.
* Reduced `app/page.tsx` to a minimal placeholder.
* Updated `eslint.config.mjs` to exclude `docs/references/**`, preventing reference material from being linted as application code.

---

## Architectural Decisions

### Tailwind v4 token configuration

No separate Tailwind configuration file has been introduced.

This project uses **Tailwind CSS v4**, where design tokens are defined directly using an `@theme` block inside `app/globals.css` rather than `tailwind.config.ts`.

The roadmap's "Tailwind token configuration" therefore lives entirely within `app/globals.css`, reducing unnecessary project files.

---

### Theme architecture

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

### Colour token strategy

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

### Removal of Create Next App dark mode

The default Create Next App stylesheet included:

```css
@media (prefers-color-scheme: dark)
```

This has been removed because it implements operating-system-driven theming, which conflicts with the project's explicit attribute-driven theme architecture planned for **M8**.

Leaving it in place would have introduced competing theme mechanisms.

---

## Roadmap Alignment

No roadmap deviations were made within the scope of M0.

The reductions in token count and configuration files are implementation simplifications that preserve the roadmap's objectives without changing project scope.

---

## Notes for Review

### Tailwind `@theme` diagnostics

Some generic CSS tooling reports `@theme` as an unknown at-rule.

This is expected behaviour from tools that do not yet understand Tailwind CSS v4 syntax.

The project's PostCSS pipeline processes the rule correctly, confirmed by:

* successful `next build`
* working development server

No action required.

---

### Unused public assets

The default Create Next App SVG assets in `public/*.svg` are now unreferenced.

They have been intentionally left in place because their removal was outside the scope of M0.

---

### UI verification tooling

`chromium-cli` was unavailable in the implementation environment.

The Playwright CLI screenshot command was used instead, following the documented fallback procedure.

If UI verification becomes a recurring workflow, a project-specific setup generated via the recommended tooling may be worth considering in the future.

---

## Ready for M1

**Ready for M1 — Global Chrome and Route Skeleton.**

---

# M1 — Global Chrome & Route Skeleton

## Status

**Completed.**

## What was built

* `components/chrome/nav-items.ts` — the shared `{ label, href }` list for About/Work/Contact, consumed by both `Header` and `MobileMenu` so the link set is defined once. Home is not in this list; it is reached via the masthead name, matching the reference material's own pattern.
* `components/chrome/header.tsx` — Server Component. Fixed, blurred, hairline-bottomed masthead bar: the name as the Home link on the left, the desktop About/Work/Contact nav on the right (`hidden md:flex`), and `<MobileMenu />` embedded at the end of the row.
* `components/chrome/mobile-menu.tsx` — the milestone's one genuine Client Component. Owns open/close state, a manual focus trap, `Escape`-to-close, body scroll lock while open, and focus restoration to the trigger button on close. The trigger button renders inline in Header's markup; the open dialog itself is rendered through a React portal to `document.body` (see Architectural decisions).
* `components/chrome/footer.tsx` — Server Component. Copyright (year computed, not hand-typed), coordinates, and GitHub/LinkedIn/CV links with placeholder `#` hrefs pending real URLs.
* `app/layout.tsx` — wired `<Header />` and `<Footer />` around `{children}`, with a `pt-16` wrapper so page content clears the fixed header's height.
* `app/page.tsx`, `app/about/page.tsx`, `app/work/page.tsx`, `app/contact/page.tsx` — each a real, minimal `<h1>` naming its act (e.g. "About — The Decision"), not placeholder or lorem-ipsum copy, each with its own `<title>` via `generateMetadata`/`export const metadata`.
* Also completed as the first step of this milestone, per the decision recorded at the end of the M0 chat session: a static typographic scale in `app/globals.css` (`monument`, `h1`, `h2`, `body`, `meta` — font-size, line-height, and letter-spacing bundled per role via Tailwind v4's paired `--text-*` tokens). Verified against compiled CSS output before use. This is not theme-swappable — typography is identical in both themes by non-negotiable — so it lives in a plain `@theme` block, separate from the colour tokens' theme-swappable indirection.

## Architectural decisions

**Client boundary held to `MobileMenu` alone (ADR-005).** `Header` and `Footer` are both Server Components. The only interactivity in this milestone — open/close state and the keyboard trap it requires — lives in one small, self-contained island, consistent with "Client Components exist only where behaviour genuinely requires them."

**No active-route highlighting.** The reference material colours the current page's nav link; M1's acceptance criteria don't require it, and a Server Component `Header` has no built-in access to the current pathname without either a client boundary or per-page prop-drilling that this milestone doesn't otherwise need. Deferred rather than built ahead of what's asked — not a deviation, since no frozen document mandates it.

**Mobile menu lists About/Work/Contact only, not a fourth "Home" row.** The reference implementation's full-screen takeover numbers all four routes including Home. Since the masthead name remains visible and tappable at all times (mobile included), Home is already reachable without a menu open, so the menu reuses `nav-items.ts` unchanged rather than adding a Home-specific entry solely for the menu.

**Dialog rendered via `createPortal` to `document.body` — found during verification, not planned.** `Header` sets `backdrop-blur-md`, and `backdrop-filter` creates a new containing block for `position: fixed` descendants per the CSS spec. With the dialog nested inside `Header`, its `fixed inset-0` resolved against Header's own 64px box instead of the viewport: the visible background only covered that top strip, and the nav list below it overflowed uncontained, with the actual page showing through beneath. A screenshot caught this; the automated interaction script did not, because it only asserted focus/keyboard behaviour, not layout. Portalling the open dialog to `document.body` keeps the trigger button inline in Header's flex row (it isn't position-fixed, so it's unaffected) while letting the dialog itself establish its own containing block at the document root. **Precedent for later milestones:** any future fixed-position overlay nested under an element with `backdrop-filter`, `transform`, `filter`, or `will-change: transform` needs the same treatment or the same bug recurs.

## Roadmap alignment

Matches `03-roadmap.md`'s M1 entry in full: all four routes exist and are navigable, `MobileMenu` is the sole Client Component, no theme toggle was added (correctly deferred to M8).

## Deviations (if any)

None from the frozen documents. `nav-items.ts` is an addition beyond the roadmap's literal file list, but it implements the same three required components without adding scope — see Architectural decisions.

## Notes for review

* The request that opened this milestone referenced `docs/architecture/01-vision.md` and a `03-non-negotiables.md`/`04-roadmap.md` numbering that doesn't exist in the repository. Proceeded against the actual files (`docs/01-vision.md` … `05-decisions.md`), confirmed identical in content to what this log and prior sessions already treat as canonical.
* Footer's GitHub/LinkedIn/CV links are `#` placeholders — real URLs are a content dependency, per `03-roadmap.md`'s stated assumptions, not an engineering gap.
* `public/*.svg` (unused Create Next App assets, noted in M0) remain unaddressed — still out of scope, not forgotten.

## Correction — navigation order

Post-handoff, before M2 began: the nav order as originally implemented was Work, About, Contact, copied from the reference material's own convention without checking it against the narrative order this project actually agreed on. `01-vision.md`'s Five Acts place About (the Decision) as Act III, before Work (the Evidence) as Act IV — the nav order should have followed that from the start.

Corrected to About, Work, Contact by reordering the single array in `components/chrome/nav-items.ts`; both `Header` and `MobileMenu` map over that array with no independent ordering logic, so no other file required a code change. Verified on both desktop and mobile after the fix. The three prose references to the old order elsewhere in this M1 section (in "What was built" and "Architectural decisions") have also been corrected in place, per this log's own rule of fixing factual inaccuracies rather than leaving them standing beside a contradicting note.

## Ready for M2

**Ready for M2 — Hero, complete (Act I).**
