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

---

# M3 — Journey, complete (Act II)

## Status

**Completed.**

## What was built

* `lib/content/journey.ts` — the typed content layer's first entry. Four milestones (see Architectural decisions for how this differs from the milestone content originally drafted): 2017 (technology investment banking, the derived start year), 2022 (VP — Technology Investment Banking), 2025 (the switch, `isSwitch: true`), and 2026 (Full-stack product engineer, the site's established "now").
* `components/journey/geometry.ts` — pure coordinate-mapping functions shared by the canvas draw calls and every DOM element positioned over it (year labels, scrub tooltip), so the two can never disagree.
* `components/journey/milestone-list.tsx` — the single accessible source for every milestone, server-rendered, visually clipped on desktop-with-fine-pointer and visually promoted to a real vertical timeline otherwise.
* `components/journey/journey-canvas.tsx` — the signature interaction itself: hand-drawn curve quantizing into ticks at the switch, pointer-driven scrub with a DOM tooltip, DOM year labels.
* `components/journey/journey-canvas-loader.tsx` — not named in `03-roadmap.md`'s file list, but required by its own architectural decision (capability-gated dynamic import); see below.
* `components/journey/journey.tsx` — the section shell: the ink plate, kicker, heading, and composition of the two components above.
* `app/page.tsx` — `<Journey />` added below `<Hero />`.

## Architectural decisions

**Narrative-weighted horizontal position, not chronological.** Originally implemented with three milestones (2017, 2025, 2026) positioned by a straightforward `(year − min) / (max − min)` calculation — a mathematically uniform timeline. Before approval, this was revised on review: a fourth milestone (2022, VP — Technology Investment Banking) was added as a deliberate bridge point, and the engineering phase (2025→2026) was given deliberately disproportionate visual weight — abandoning strict chronological spacing entirely. `Milestone` gained an authored `t` field (0–1, horizontal position) that `geometry.ts` now reads directly, instead of deriving position from `year`. The engineering phase occupies roughly half the graph's width (`t = 0.56` to `1.0`, plus a short tick overhang past it) despite covering the fewest real years of any phase — a visual argument for narrative importance over calendar-accurate proportion, which is explicitly what was asked for, not a compromise made for lack of a better option.

A brief detour worth recording: the same review pass also tried reframing this final milestone from a fixed "2026" to an open-ended "2025–Present" label, closer to `01-vision.md`'s Act V doctrine ("the next tick isn't drawn yet"). That version was reverted at the next checkpoint — the concrete 2026 year was preferred — while keeping the 2022 milestone and the narrative-weighted `t`-based spacing, which were separately confirmed as wanted. The revert happened through direct file edits outside this process and left `journey.ts` (fully reverted) briefly inconsistent with `geometry.ts` and `journey-canvas.tsx` (which still referenced fields — `t`, `yearLabel` — the reverted type no longer had); `tsc` caught the mismatch immediately, and the fix was to restore `t` and the 2022/2026 milestone set while dropping the now-unused `yearLabel` field entirely, rather than trying to reconcile two different final designs. `year` is retained on every milestone for both positioning-adjacent semantics and display.

**Content sourcing.** `lib/content/journey.ts` documents which facts are stated directly in the frozen docs (the 2025 switch year, itself only in `01-vision.md`) versus derived (2017, arithmetically, from "approximately eight years" plus the 2025 switch) versus established elsewhere in the shipped site (2026/"present", already consistent with Footer's `© 2026` and Hero's kicker). The 2022 VP milestone was supplied directly, not derived or invented. This is deliberately thinner than the reference material's multi-stage career narrative, which invents intermediate years and title changes nowhere stated in the canonical docs — the curve's hand-drawn quality comes from procedural wobble applied along its length, not from fabricating extra data points to make the line look busier.

**`JourneyCanvasLoader` exists because of the roadmap's own stated architecture, not by choice.** `03-roadmap.md`'s M3 entry specifies that `JourneyCanvas` loads via a dynamic import gated on a capability check. A capability check needs `window`/`matchMedia`, which only exists in a Client Component, and `next/dynamic`'s `ssr: false` option is only valid from one — so the gate cannot live inside the server-rendered `Journey` component. `useSyncExternalStore` is used rather than `useEffect` + `setState`: the lint rule `react-hooks/set-state-in-effect` correctly flagged the first attempt, and `useSyncExternalStore` is the more correct tool regardless — the server has no `window`, so `getServerSnapshot` returning a fixed `false` is what avoids a hydration mismatch, not an incidental side effect of dodging a lint error. The check is deliberately one-shot (no live resize-based re-evaluation): deciding whether to fetch a JS chunk at all should happen once, not re-fire as a visitor resizes their window mid-session.

**The capability gate's two conditions (desktop-width, fine pointer) are written identically in three places** — `JourneyCanvasLoader`'s JS check, and the CSS media condition on `MilestoneList` that decides whether it's clipped — so they can never disagree about which one is the visible content for a given visitor. This was a real edge case worth catching deliberately: a wide-viewport touch-only device (a touchscreen laptop, a tablet in landscape) would otherwise fail the JS gate (no fine pointer, no canvas) while also matching a plain `min-width` CSS breakpoint (list clipped, expecting canvas to be the visible content) — leaving nothing visible at all. Verified directly with a touch-emulated 812×375 context: canvas absent, list visible, as intended.

**Text never sits inside the canvas.** Year labels and the scrub tooltip are DOM elements, computed from the same `geometry.ts` functions the canvas itself draws from. Edge milestones (the first and last) needed their own alignment handling — center-anchoring a label at the graph's extreme edge risks clipping it off-canvas regardless of how long the label is, so labels within 5% of either edge switch to left- or right-anchored instead of centered. This held up as a generally useful rule even after the milestone content changed back — it isn't tuned to any one label's length.

**Wobble damps to zero at every real milestone.** Caught on review, after approval: the point markers didn't visually sit on the curve, and the switch-to-ticks handoff showed a small vertical jump. Both had the same root cause — the curve was drawn at `value + wobble(t)`, but the dot markers and the ticks were both drawn at the plain interpolated `value`, with no wobble. Wherever wobble happened to be non-zero at a milestone's own `t` (which was most of the time — the sine functions have no reason to land on zero at an arbitrary point), the dot floated visibly off the line passing through it, and at the switch specifically, the curve's last wobbled point didn't match the first (always unwobbled) tick. Fixed by damping the wobble amplitude to zero within a small radius (`0.05`) of every milestone's `t`, so the curve now passes exactly through each milestone's clean value — the dots needed no positional change at all once this was fixed, since they were already correct, only the curve was drifting away from them. This also gave each dot a thin outline in the plate's own background colour, so it reads as a distinct point marker rather than a thicker segment of the line.

**No entrance-draw or idle animation, in either motion state.** Consistent with M2's precedent and `01-vision.md`'s Act II register: the curve renders once, immediately, fully formed. Scrubbing remains available under reduced motion since it's user-initiated data inspection, not decoration — there was no separate reduced-motion code path to build for the drawing itself, since there was never an animated draw-in to gate in the first place.

## Roadmap alignment

Matches `03-roadmap.md`'s M3 entry: all four named components exist (plus the necessary loader), `Journey` and `MilestoneList` are server-rendered, `JourneyCanvas`/`JourneyCanvasLoader` are the only client additions, the dynamic-import gating matches the roadmap's own architectural decision precisely, and the acceptance criteria (curve renders at all viewport widths, quantization is unambiguous, scrub works via mouse and touch, every milestone is real accessible text, reduced motion keeps scrubbing, `JourneyCanvas` confirmed absent from the mobile bundle via bundle inspection rather than visual inspection alone) were each verified directly rather than assumed.

## Deviations

None from the frozen documents. The milestone content and its narrative-weighted spacing were a pre-approval revision to this milestone's own content, not a deviation from `01-vision.md`, `02-architecture.md`, or the roadmap — none of those documents specify exact milestone data, only that the interaction and its accessible fallback exist.

## Notes for review

* The real Hero-to-masthead compress transition was verified end-to-end on the actual homepage for the first time this milestone (Journey now provides ~1000px of real scroll runway) — full range confirmed correct: masthead hidden through roughly the first half of the scroll range, crossing to fully visible by 85–100%, matching the same thresholds verified with an artificial spacer in M2.
* Client-side navigation away from and back to Home was re-verified with Journey now in the page: `data-page`/`data-hero-compressed` are correctly cleared on navigating away and correctly re-established on return, with the masthead visibly transitioning back toward hidden rather than sticking at its previous state.
* The scrub tooltip's edge-clamping was initially a fixed 90px margin, which clipped the longer "2017 — Technology investment banking" label off the left edge — caught by direct visual inspection, not the automated script, which only asserted that a tooltip existed, not that it stayed within the viewport. Fixed by measuring the tooltip's actual rendered width at scrub time instead of guessing a constant.
* `MobileMenu`'s portal-based overlay was re-verified as a regression check (it renders no differently with Journey present, but M3 changed global page height and scroll behavior, which was worth confirming didn't affect it) — still fills the viewport correctly.
* Confirmed at four additional breakpoints beyond the standard desktop/mobile pair: a large desktop (1920×1080), a standard laptop (1366×768), and a genuinely touch-emulated landscape phone (812×375) — no horizontal overflow, no clipping, and the capability gate behaves correctly at the trickiest of these (the landscape case, above).
* Future milestones adding their own scroll-linked or pointer-driven interactions should follow the same pattern established here: direct DOM writes in a `ResizeObserver`/pointer-event handler, not React state per frame, and a shared pure geometry module if a canvas and DOM text ever need to agree on positions again.

## Post-approval addendum — dynamic highlighting

Two further refinements, added after the dot-alignment fix above and before final approval:

**Desktop: dot highlighting is now a continuous function of scrub distance, not fixed.** Each milestone's radius and glow now scale smoothly with how close the current scrub position is to it (`HIGHLIGHT_RADIUS = 0.07` in `t`-units), redrawn on every pointer-move frame — no separate eased/lerped state, no persistent animation loop, purely a function of where the pointer is right now. The year label brightens in step with its dot, both driven from the same per-milestone intensity value computed once per frame. This stayed within the existing input-driven-motion doctrine: nothing moves without a pointer event triggering a redraw.

**Mobile: the vertical timeline is now scroll-active, not static.** A new client component, `components/journey/timeline-activator.tsx`, wraps `MilestoneList`'s server-rendered output and tracks scroll position (not `IntersectionObserver` — with only four items, reading each one's `getBoundingClientRect()` against a fixed activation line on scroll is cheap and gives a precise "nearest" ranking that a visibility threshold can't express as simply). The nearest item to the activation line gets a `data-active` attribute, styled via Tailwind's `group-data-active:` variant (dot grows and switches to accent colour, text brightens); a second line element grows in height to visually "fill" up to the active point as a scroll-progress indicator.

This is a genuine, worth-flagging architecture change: M3's mobile experience was previously zero-JavaScript by design, explicitly documented as such. It no longer is. The trade-off was made deliberately, in response to a direct request for the mobile timeline to feel as alive as the desktop scrub interaction — a static list read acceptably but didn't meet that bar. `MilestoneList` itself is unchanged in structure and remains fully functional and accessible with no JavaScript at all (real content, correct semantics, a plain static timeline); `TimelineActivator` is additive behaviour layered on top via the same "client wraps server content as children" pattern used everywhere else, not a rewrite of the content layer. Unlike `JourneyCanvasLoader`, this component is not capability-gated behind a dynamic import — its runtime cost (one scroll listener, four bounding-rect reads per frame) is small enough that gating it added complexity without a meaningful benefit, including on desktop where it runs harmlessly against an invisible list.

## Ready for M4

**Ready for M4 — Home, complete.**
