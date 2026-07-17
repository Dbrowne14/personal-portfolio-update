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

---

# M2 — Hero, complete (Act I)

## Status

**Completed.**

## What was built

* `components/hero/hero.tsx` — Server Component. Every word is real, server-rendered text: the kicker ("Full-stack product engineer · London"), the monument name, the tagline (content-brief.md's core positioning line, verbatim: "From evaluating products to shipping them."), and the hero title block (content-brief.md's Core/Backend/Data tools, curated to five: TypeScript, React, Next.js, Node, PostgreSQL).
* `components/hero/hero-stage.tsx` — the milestone's first client component. Owns the scroll-compress effect and the two DOM attributes (`data-page`, `data-hero-compressed`) that coordinate with Header, per the roadmap's specified mechanism.
* `components/hero/magnetic-letters.tsx` — the second client component. Per-letter cursor physics on the monument name, entirely decorative (`aria-hidden`, with the real accessible name — "David Browne" — carried by the parent `<h1>`'s `aria-label`). No-ops completely (no listeners, no rAF loop) on coarse pointers or under reduced motion.
* `components/chrome/header.tsx` — added the `masthead-name` class to the masthead link; no other change. Header still has no knowledge of the hero, the route, or scroll state — the CSS rule reading the attributes lives entirely in `globals.css`.
* `app/globals.css` — the masthead-visibility CSS rule, plus a `:focus-visible` override discovered necessary during verification (see below).
* `app/layout.tsx` — a small inline blocking script setting `data-page="home"` before hydration on the initial document load, plus `suppressHydrationWarning` on `<html>` (see Architectural decisions).
* `app/page.tsx` — now renders `<Hero />` in place of the M1 placeholder heading.

## Architectural decisions

**No entrance animation on load.** The reference material staggers the kicker/name/tagline in with fade-and-rise animations on page load. `01-vision.md`'s Act I register is explicit — "No motion until the visitor acts" — and the acceptance criteria states this directly: "Hero renders with no motion on first paint." Skipped the entrance choreography entirely rather than softening it; everything is at full, final opacity and position in the very first frame. This is adherence to the frozen documents over the non-binding reference, not a deviation from either.

**Two bugs found only by visual/browser verification, not the automated build.** Both are recorded in detail because they're the kind of defect that's invisible in code review and would have shipped unnoticed:

1. *Masthead flash on load.* `HeroStage` originally set `data-page="home"` in `useEffect`, which fires after paint. Combined with `.masthead-name`'s `transition: opacity 0.3s`, this produced a real, visible ~300ms fade-out on every load — motion with no user action behind it, directly contradicting Act I's doctrine. Switching to `useLayoutEffect` (via a small inline isomorphic-effect fallback, since `useLayoutEffect` needs a browser to do anything) didn't fully fix it: CSS transitions animate from whatever value was resolved in the *first* style pass, and since the server-rendered HTML never has `data-page` at all, the browser resolves `.masthead-name` to its default `opacity: 1` before any client JS runs, regardless of how early that JS executes afterward. The actual fix is the same pattern already planned for M8's dark-mode flash: a small inline `<script>` in `<head>`, run before hydration, that sets `data-page="home"` synchronously when `location.pathname === "/"`. That script only covers the initial document load, so `HeroStage`'s own mount-time attribute-setting is still needed for client-side navigation *into* Home from another route — the two mechanisms cover different cases, not the same one twice. The inline script causes an expected hydration mismatch warning (React sees an attribute on `<html>` it didn't render server-side), silenced with `suppressHydrationWarning` on `<html>` — the same standard, targeted fix theme-switching scripts use for this exact category of intentional pre-hydration mismatch.
2. *Invisible keyboard focus.* With the masthead hidden by default on Home, tabbing to it produced no visible focus indicator at all — a real WCAG 2.4.7 failure for a sighted keyboard user, not just a theoretical edge case (confirmed by screenshot: pressing Tab on load showed nothing happening). Fixed with a `:focus-visible` override at matching specificity to the hiding rule, forcing the masthead to full opacity whenever it holds genuine keyboard focus, regardless of hero-compression state.

**Client boundaries.** `HeroStage` and `MagneticLetters` are the only two Client Components added this milestone, both exactly where the roadmap specifies. `Hero` itself stays a Server Component; both client pieces receive content as children/props rather than owning it.

**Responsive decisions.** The bottom row (title block + "Scroll ↓") wraps and centers on narrow viewports rather than staying a strict `justify-between` row, and the scroll cue hides below `sm` — redundant on touch, where scrolling is the only available input anyway. Magnetics drop via `MagneticLetters`' own `pointer: fine` check; scroll-compress is untouched by viewport and still runs on mobile, matching the roadmap's explicit "mobile drops magnetics but keeps scroll-compress."

**Hero height.** `min-h-[calc(100vh-4rem)]`, not `min-h-screen` — the layout's `pt-16` wrapper already accounts for the fixed header's height, so the hero's own box plus that padding together equal exactly one viewport, matching the rhythm doctrine's "heroes claim 100vh."

## Roadmap alignment

Matches `03-roadmap.md`'s M2 entry: all four named components exist, `Hero` is server-rendered, `HeroStage`/`MagneticLetters` are the only client additions, the masthead-coordination mechanism matches what the roadmap specified almost exactly (DOM attributes on `<html>`, read only by CSS). The one addition beyond the roadmap's literal file list — the inline script and `suppressHydrationWarning` in `app/layout.tsx` — exists only because verification surfaced the flash bug described above; the roadmap's own M2 risk note anticipated that the reduced-motion path specifically would need "an explicit test pass, not a follow-up," which is exactly what caught this (a related, but distinct, timing issue on the non-reduced-motion path).

## Deviations (if any)

None from the frozen documents.

## Notes for review

* Verified with the page's actual current content (Hero + empty space + Footer, since Journey/Act II doesn't exist until M3) by injecting a temporary spacer element in the test harness only, to exercise the full 0→1 compress range that the real page can't yet produce on its own. Nothing was added to the shipped app to manufacture scroll runway — that's M3's job.
* Full compress-range behavior confirmed correct at both extremes and the midpoint: monument fully visible until ~55% of the compress range, fully faded by ~72%; masthead stays hidden until the same ~72–78% point, then crosses to fully visible by ~90–100%, with a brief intentional overlap rather than a gap.
* Confirmed `data-page`/`data-hero-compressed` are correctly removed on unmount — navigating from Home to another route via client-side routing leaves neither attribute behind.
* The dev-mode Next.js indicator badge appears in every local screenshot bottom-left; confirmed absent in a production build in M1 and not re-verified against production this milestone, since nothing about this milestone's chrome would plausibly change that.
* Reduced motion hides the hero's content via opacity alone, without collapsing its height — the monument's full-height box remains in the document flow, just invisible, once compressed. This is an instant *state* swap as required, not an instant *layout* swap; worth knowing if a future milestone's reduced-motion work assumes hidden sections also lose their height.

## Ready for M3

**Ready for M3 — Journey, complete (Act II).**
