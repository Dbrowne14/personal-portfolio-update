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

---

# M4 — Home, complete

## Status

**Completed.**

A note on sequencing: a prior commit was labeled "m4 complete" but contained no M4 work — only M3 cleanup (deleted temp verification scripts/screenshots) and a 10-line addition to this log's M3 section. Confirmed by inspecting the commit directly (`git show --stat`) before starting, since building M5 on a homepage that wasn't actually finished would have compounded the gap. This section is the real M4 implementation.

## What was built

* `lib/content/projects.ts` — the second entry in the typed content layer. Full `Project` interface per `03-roadmap.md`'s shape, with one deliberate deviation (see Architectural decisions). Four featured projects populated — `slug`, `title`, `oneLiner`, `stack`, `featured`, `order` only, exactly the fields the teaser needs, per the roadmap's own note that the type is fully defined now but the data isn't.
* `components/work/work-teaser.tsx` — Server Component. "Selected work" heading, Default Social rendered as a visually larger flagship block, the remaining three in an equal three-column row beneath it, and a quiet forward link to `/work` closing the section — no button, no call to action.
* `app/page.tsx` — `<WorkTeaser />` added below `<Journey />`. Home now runs Hero → Journey → WorkTeaser, matching `01-vision.md`'s Act I/II/proof-teaser structure for the first time.

## Architectural decisions

**`heroImage` made optional, against the roadmap's literal type shape.** `03-roadmap.md` specifies `heroImage: { src: string; alt: string }` as required. No real project screenshots exist in this repository. Forcing a required field would have meant either a fake path (breaking `next/image` or silently rendering nothing) or inventing a placeholder image asset that doesn't represent anything real. Made it optional instead; `WorkTeaser` falls back to the site's own established hairline-placeholder pattern (45° stripes, mono caption) whenever it's absent. Flagged before writing any code, not discovered after. `gallery`, `evaluatorNote`, `highlights`, `links`, and `confidential` remain exactly as specified — this is the one field the roadmap's shape didn't already anticipate needing a placeholder state for.

**Content sourcing, same discipline as M3.** `content-brief.md` confirms the four featured projects, their order, and that Default Social carries more visual weight — nothing else. It gives no descriptions, images, or per-project stacks. One-liners are deliberately factual and unspecific (no claimed client details, no asserted integrations) rather than inventing marketing copy; stack tags are drawn only from `content-brief.md`'s already-confirmed toolset, never a new addition. "This portfolio" is the one exception with a fully accurate stack, since it's this actual build. This is placeholder content in the ordinary sense — obviously the user's to refine — not fabricated factual claims about people or work.

**Case-study links point at `/work`, not `/work/[slug]`.** Those routes don't exist until M6. Every project card and the forward link resolve to the same index page for now; this is expected to sharpen once real case-study routes exist, not a defect to track.

**No new Client Components.** `WorkTeaser`, `ProjectCard`, and `ProjectImage` are all server-rendered. The grayscale-to-colour hover (for when real images replace the placeholder) is a pure CSS `filter` transition on `group-hover`/`group-focus-visible` — confirmed by inspecting the rendered page for attached listeners, not just by not having written any.

## Roadmap alignment

Matches `03-roadmap.md`'s M4 entry: `WorkTeaser` exists as a Server Component, the full `Project` type is defined now with only the teaser's fields populated (extending data rather than schema is deferred to M6, exactly as specified), and every acceptance criterion was verified directly — zero `<button>` elements anywhere on the page besides the always-present mobile-menu trigger, the page ends on a quiet link, and the section's density/whitespace was checked against `01-vision.md`'s Visual Rhythm doctrine (ivory canvas, generous whitespace, a real release after Journey's dark plate — not a dense card grid).

## Deviations

`heroImage` optional instead of required — see Architectural decisions. No other deviations.

## Notes for review

* Verified the real accessibility tree (`ariaSnapshot`), not just visible text: each project card's computed accessible name is clean and complete ("Default Social The flagship build — production, live, shipped. Next.js · Sanity CMS · Vercel"), correctly excluding the `aria-hidden` placeholder caption that a raw `textContent` check would have wrongly included. Heading hierarchy is correct throughout — h2 "Selected work", h3 per project, no skipped levels.
* Keyboard tab order confirmed correct end to end: masthead → nav → Default Social → Staple → 10 Songs → This portfolio → forward link → footer links, with a visible focus outline (`outline-style: auto`) at every stop.
* Mobile composition is a deliberate single-column stack, not a shrunk desktop grid — Default Social still leads, but the width-based hierarchy that distinguishes it on desktop doesn't apply; its position and identical content carry the same weight instead.
* All four routes (`/`, `/about`, `/work`, `/contact`) confirmed returning 200 and still navigable.

## Ready for M5

**Ready for M5 — About, complete (Act III).**

---

# M5 — About, complete (Act III)

## Status

**Completed.**

## What was built

* `components/about/decision-intro.tsx` — Server Component. The page's real content: kicker, the reasoning headline ("I wanted to understand how the products I was valuing were actually built."), two short paragraphs of first-person prose, and the credential line computed from `journeyMilestones`, not hand-typed.
* `components/about/halftone-portrait.tsx` — the milestone's one Client Component. Canvas dot-halftone rendering with cursor-scatter, gated on a fine pointer and no reduced-motion preference; a real `next/image` beneath the canvas whenever a photograph exists.
* `app/globals.css` — a small CSS-only scroll-entrance-fade utility (`.reveal-on-scroll`), applied directly in `decision-intro.tsx`.
* `app/about/page.tsx` — replaced the M1 placeholder heading with `<DecisionIntro />`.

## Architectural decisions

**No photograph exists yet — `heroImage`-equivalent optionality, same pattern as M4.** `03-roadmap.md`'s architecture note for this milestone assumes a source photograph already exists ("`HalftonePortrait` renders a real `next/image` of the source photograph"). None does. Rather than pointing `src` at a fake path, `HalftonePortrait`'s `src` prop is optional; absent, it renders the site's established hairline placeholder and mounts no canvas at all — not a canvas attempting to draw from nothing. The moment a real photo is added, the component's dot-rendering activates with no change needed at the call site. This mirrors M4's `heroImage` decision exactly, now established as a consistent pattern across the codebase for "the roadmap assumes an asset that doesn't exist yet."

**The gating logic was verified with a temporary, unshipped test image, not left as untested code.** The roadmap's acceptance criteria for this milestone are specifically about behaviour — `aria-hidden` on the canvas, no animation frame loop under reduced motion or a coarse pointer — not about the halftone algorithm's visual tuning, which can't be meaningfully judged without a real photograph anyway. Temporarily pointed `src` at an existing placeholder SVG, confirmed via canvas frame-diffing (not just reading the code) that: a fine pointer with full motion produces a canvas that visibly redraws on cursor movement; reduced motion and a coarse-pointer/touch context both produce a canvas that renders once and never changes again despite cursor or time passing. Reverted the test `src` immediately after. This is the same discipline as M2 and M3's browser-verified reduced-motion passes — asserting the mechanism works, not just that the code looks like it should.

**The entrance fade is pure CSS, not a Client Component.** `03-roadmap.md`'s file list for this milestone names exactly three files, with no fourth file for a fade behaviour — read as confirmation that this shouldn't be its own Client Component, consistent with the roadmap's own note that extraction into a shared `<Reveal>` component happens at M6, when a second use case exists. Used a CSS scroll-driven animation (`animation-timeline: view()`) instead, wrapped in `@supports` so unsupported browsers apply none of these properties at all — content renders at full opacity in its final position immediately, never stuck invisible. This keeps `DecisionIntro` entirely server-rendered; the reduced-motion requirement is met for free by the global rule already established in M0, which collapses this animation's duration the same way it does every other transition on the site.

**Content sourcing, same discipline as M3 and M4.** The reasoning headline and its framing come directly from work already done collaboratively earlier in this project — About was deliberately reframed from "meet the person" to "the decision," specifically built around this line's function of answering *why*, not *who*. The supporting prose draws only on facts already established elsewhere in this codebase (the 2017 start, the 2022 VP milestone, the 2025 switch — all already in `journey.ts`) plus the one directly-sourced sentence in `content-brief.md` ("working alongside founders and product teams"). Deliberately excluded any specific personal claim that isn't already established or sourced (no invented hobbies, no unverifiable present-tense claims about the user's life) — the reference material's version of this page includes exactly this kind of unsourced specific claim, which is exactly what's being avoided.

**Credential line, not duplicated.** `${first.year} — ${first.label} → ${last.year} — ${last.label}`, computed directly from `journeyMilestones[0]` and `journeyMilestones.at(-1)` inside `DecisionIntro`. No string matching this appears hand-typed anywhere in the component.

## Roadmap alignment

Matches `03-roadmap.md`'s M5 entry: all three named files exist, `DecisionIntro` is a Server Component, `HalftonePortrait` is the only Client Component, the entrance fade stayed local rather than being extracted, and every acceptance criterion was verified directly — the credential line matches `journey.ts`'s first and last entries exactly (confirmed via rendered text, not just code inspection), the canvas is `aria-hidden`, no animation frame loop starts under reduced motion or a coarse pointer (confirmed via frame-diffing), and no standalone toolset section exists anywhere on this page.

## Deviations

`HalftonePortrait`'s `src` optional instead of assumed-present — see Architectural decisions. No other deviations.

## Notes for review

* The portrait placeholder briefly looked absent on mobile during verification — a full-page screenshot appeared to show an empty gap between the credential line and the footer. Checked the element's actual computed bounding box before concluding anything: it was rendering correctly, at real dimensions, simply further down the page than an initial look at the screenshot suggested. Confirmed with a properly scrolled, cropped screenshot. Recorded here as a reminder that "the screenshot looks empty" is not the same as "the element is broken" — worth a second check before treating either as fact.
* Heading hierarchy on this page is a single `<h1>`, no `<h2>`/`<h3>` — correct and sufficient for this page's content, not a gap; there's no subsection structure here to warrant one.
* `journeyMilestones.length - 1` indexing (rather than `.at(-1)`) was used for the "last" entry to match the array-access style already established in `journey-canvas.tsx` and `milestone-list.tsx`, for consistency across the codebase rather than mixing idioms.

## Ready for M6

**Ready for M6 — Work, complete (Act IV).**

---

# M6 — Work, complete (Act IV)

## Status

**Completed.**

## What was built

* `lib/content/projects.ts` — extended, not restructured. The `Project` type from M4 already had every field this milestone needed (`highlights`, `gallery`, `evaluatorNote`, `links`, `confidential`); only the data changed — full content for the four featured projects, plus the two remaining projects from `content-brief.md`'s six-project list (an anonymised private-equity platform, marked `confidential: true`, and a personal wedding-website project).
* `components/work/tech-credit.tsx`, `project-row.tsx`, `project-index.tsx`, `colophon.tsx` — the Work index: a ruled list, not a card grid, ordered by each project's own `order` field.
* `components/work/case-study-hero.tsx`, `evaluator-note.tsx`, `case-study-body.tsx`, `project-gallery.tsx` — the case-study page's four named components, all server-rendered.
* `app/work/page.tsx` — rebuilt from the M1 stub into the real index.
* `app/work/[slug]/page.tsx` — new. `generateStaticParams` and `generateMetadata` exported directly from this file, per `02-architecture.md`.

## Architectural decisions

**No `components/shared/reveal.tsx` was created — the roadmap's premise for it no longer holds.** `03-roadmap.md` frames `Reveal` as something to be "extracted from About," assuming M5 built a JS-based entrance-fade component. It didn't: M5 used a pure CSS scroll-driven animation (`.reveal-on-scroll` in `globals.css`), specifically because the roadmap's own M5 file list had no room for a fourth file. There is no React component to extract, because none was ever built — the CSS utility class was already the shared mechanism, reusable by any server-rendered element simply by adding the class name. Work's pages apply the same `.reveal-on-scroll` class directly; no new file, no new abstraction, no Client Component. Raised this before writing any code, per this milestone's own instruction to explain such conflicts rather than silently extract or silently skip.

**Ruled index, not a card grid.** `01-vision.md`'s Visual Rhythm doctrine calls Work "the densest, busiest stretch on the site" with "gutters narrow[ing]... where images approach full bleed" — and `creative-direction.md` separately rules out generic card grids. Chose a hairline-ruled list (index number, title, one-liner, stack or "NDA," the whole row as one link) over an image-grid, for two reasons: it matches that denser, more evidentiary register more directly than a grid of cards would, and — practically — it doesn't need six thumbnail images to look complete. Six simultaneous hairline placeholders on one index page would read as obviously unfinished in a way a single placeholder per case study doesn't. The image-forward treatment lives on each case study's own `CaseStudyHero` instead, where "evidence" actually means something once real screenshots exist.

**Confidential projects get restraint at index level too, not just on their own page.** The fifth project shows "NDA" in place of a real stack line in `ProjectRow`, not just in its case study — `project.confidential` gates this consistently everywhere the project appears, rather than the restraint being a property of one page.

**Content sourcing, same discipline as M3–M5.** `evaluatorNote` is a new field this milestone actually populates — the "analyst's margin note" device raised during the earlier design conversation, now implemented. Every note is an editorial judgment, not a factual claim, and every other new field (`highlights`, the two new projects' full data) stays within what's directly sourced (`content-brief.md`'s six-project list and ordering) or safely generic (no specific client details, no invented metrics or integrations). `links` was left unpopulated for every project rather than filled with placeholder `#` hrefs — a fake-looking working link is worse than an absent one, and the case-study page already conditionally omits the links row entirely when empty.

**`sizes` added to every `next/image fill` usage in the codebase, not just this milestone's new ones.** Auditing this milestone's own images surfaced that `WorkTeaser` (M4) and `HalftonePortrait` (M5) had the same gap — no `sizes` prop, meaning Next.js would default to assuming each image spans the full viewport width regardless of its actual rendered size, downloading unnecessarily large images once real photographs exist. Fixed all four call sites (the two new to this milestone plus the two pre-existing ones), since "images load efficiently and responsively" is this milestone's own explicit QA requirement and leaving two already-shipped instances of the same bug in place while fixing only the new ones would have been inconsistent.

## Roadmap alignment

Matches `03-roadmap.md`'s M6 entry on every point that still applied after the `Reveal` premise was corrected: all named components exist and are server-rendered, `generateStaticParams`/`generateMetadata` are exported directly from `app/work/[slug]/page.tsx`, `ProjectGallery` is CSS scroll-snap with no client controller (none was needed), and the colophon is computed from `projects.flatMap(...)`, deduplicated — verified by editing one project's stack and confirming both the colophon and that project's own index row updated with no second edit, not just by reading the derivation and assuming it was correct.

## Deviations

No `components/shared/reveal.tsx` — see Architectural decisions. No other deviations.

## Notes for review

* `next/image`'s `sizes` gap (see above) was a real, if currently invisible, bug — invisible because no project has a real `heroImage` yet, so the affected `<Image>` components never actually mount during normal use. Worth remembering that "no visible symptom" isn't the same as "no bug" when an asset-gated code path is involved; this one was only caught by directly auditing every `fill` usage, not by anything a screenshot could have shown.
* Manual QA item "Colophon updates automatically when project metadata changes" was tested literally: temporarily added a marker string to one project's stack, confirmed it appeared in both the colophon and that project's index row, then reverted — not inferred from reading the derivation.
* Manual QA item "Case studies remain fully readable with JavaScript disabled" was tested with a JS-disabled browser context, confirming full text content (title, evaluator's note, both highlights, stack line) and plain-link navigation back to the index — not assumed from the Server Component architecture alone.

## Ready for M7

**Ready for M7 — Contact, complete (Act V).**

---

# M7 — Contact, complete (Act V)

## Status

**Completed.**

## What was built

* `app/actions/submit-contact-form.ts` — the Server Action. Validates `name`/`email`/`message` server-side regardless of how the form was submitted, checks a honeypot field, and — only on a fully confirmed successful send — redirects to `/contact?sent=true`. Validation failures and provider failures return `ContactFormState` instead of redirecting, so a hydrated form can show them inline without navigating away. Uses a raw `fetch` to Resend's REST API rather than installing `resend`'s SDK, per this milestone's "no new external dependencies unless genuinely required" — a single POST with a bearer token needed no SDK.
* `components/contact/submit-status.tsx` — the milestone's one Client Component. Binds `useActionState` to the Server Action and renders `<form action={formAction}>` around `children`, following the established client-wraps-server-content pattern (`HeroStage`, `TimelineActivator`). `useActionState`'s third return value supplies the pending boolean directly, so no separate `useFormStatus()` call — and no separate component boundary forced by React's rule that `useFormStatus` can't run in the component that renders its own enclosing `<form>`, since this component isn't using that hook at all. Also owns the honeypot field and the `aria-live="polite"` error region.
* `components/contact/contact-form.tsx` — server. The kicker, headline ("Open to what's next.", with "Open" in accent, per `01-vision.md`'s Act V doctrine that Contact spends the site's bronze accent "at its highest concentration... on the single largest word"), intro copy, and the three labeled fields (`name`, `email`, `message`), passed into `SubmitStatus` as children.
* `components/contact/elsewhere-card.tsx` — server. GitHub/LinkedIn/CV links using the same placeholder-`#`-href pattern already established in `Footer`, plus a "Currently open to" status line sourced from `content-brief.md`'s contact-language guidance (full-time roles, recruiter conversations, product/technical discussions, collaboration, occasional freelance work — none of the brief's banned sales phrases).
* `components/contact/tick-motif.tsx` — server, `aria-hidden`. A row of small accent-coloured dashes echoing the Journey chart's engineering-era ticks (`journey-canvas.tsx`'s `fillRect` dashes), fading in opacity and stopping short of the container's full width — Act V's linework doctrine calls this "a single line at Contact, fading toward the page edge, unfinished on purpose," and Act IV's transition note frames it as the same motif carrying over: "the line is still running."
* `app/contact/page.tsx` — rebuilt from the M1 stub. Awaits `searchParams` (Promise-based in this Next version, same pattern as `params` in `app/work/[slug]/page.tsx`) and renders a server-rendered confirmation in place of `ContactForm` when `sent=true`, alongside `ElsewhereCard` and `TickMotif`.

## Architectural decisions

**No per-field inline error text — a single combined message in one shared `aria-live` region instead.** The roadmap's component split (`ContactForm` server, `SubmitStatus` client) means the labeled inputs are static server-rendered markup passed as `children` into `SubmitStatus`; they exist before any client state does and have no mechanism to read `useActionState`'s `state` back out to position a message next to the specific field it belongs to, short of restructuring the RSC boundary around it. An earlier draft of this milestone exported a `fieldError()` helper assuming per-field lookup would be wired up later — it never could have been, given this structure, and was removed. `submitContactForm` instead joins every failing field's message into one sentence (e.g. "Enter a valid email address. Enter a message.") returned as `state.message`, rendered once inside the existing `role="alert"` region. The roadmap's own acceptance criteria only require that "a screen reader announces success or failure through the `aria-live` region" and that "every input has an associated label" — neither demands per-field inline text — so this is a simplification within the stated bar, not a shortfall against it.

**Native HTML validation (`required`, `type="email"`) is left enabled — no `noValidate`.** An earlier draft set `noValidate` on the form, reasoning that it would keep JS and no-JS behaviour identical. Removed it after empirical testing showed the opposite is true without cost: with `noValidate` absent, a no-JS visitor gets instant, zero-network, screen-reader-accessible feedback on empty required fields from the browser itself, and a JS-enhanced visitor gets the same free layer before ever hitting the network. Server-side validation in `submitContactForm` remains fully independent and authoritative regardless — confirmed directly (see Notes for review) by submitting values that satisfy native constraints but fail the server's own rules (an email with no dot, a message past `MESSAGE_MAX_LENGTH`), which the server still rejected inline with no redirect.

**Confirmation replaces the form rather than sitting beside it.** On `?sent=true`, `app/contact/page.tsx` swaps `ContactForm` out for a server-rendered confirmation block in the same grid position, rather than showing both. Once a message has been sent there is nothing left to submit, and Act V's doctrine calls this "the fullest release of the sequence" — a closing state, not a persistent form with a banner stacked on top.

**Recipient and provider.** Per this milestone's own flagged risk, both required a decision before implementation could start. Confirmed with the user: **Resend** as the email provider, **davidbrowne1992@gmail.com** as the recipient (hardcoded as `RECIPIENT` in the Server Action — a single fixed destination, not something that needed to be configurable). The `from` address uses Resend's zero-config sandbox sender (`onboarding@resend.dev`); a verified sending domain is needed before this goes to production (see Notes for review).

## Roadmap alignment

Matches `03-roadmap.md`'s M7 entry: `ContactForm` (server), `SubmitStatus` (client), `ElsewhereCard` (server), and the trailing tick-motif graphic (server, `aria-hidden`) all exist as named. With JavaScript, `SubmitStatus` shows inline pending/error state via `useActionState` with no full page reload. Without JavaScript, the native `<form action={submitContactForm}>` still performs a real submission and the Server Action still executes — confirmed directly via a JS-disabled Playwright context and via a raw `curl` POST replaying the form's own hidden `$ACTION_*` fields, both showing the server-validated error text present in the response HTML at the same URL, and a valid submission (bypassing the honeypot) reaching the "not configured" branch of the action rather than crashing. Confirmation on success is delivered through the server-rendered `?sent=true` state via a real redirect, not client state, matching the roadmap's explicit architectural decision. No `mailto:` link exists anywhere on the page — checked directly against the rendered HTML.

## Deviations

No `fieldErrors`/per-field inline error display — see Architectural decisions. No other deviations from the roadmap's stated components, files, or acceptance criteria.

## Deferred technical debt

* No real `RESEND_API_KEY` exists in this environment, so the actual successful-send path through Resend's API has not been exercised end-to-end — only the validation path and the graceful "provider not configured" failure path (the actual current real state of this deployment) have been verified directly. The success path's code (a single `fetch` call and a conditional `redirect()`) is straightforward, but it is unverified against the live Resend API and should be smoke-tested once a real key is set.
* The `from` address (`onboarding@resend.dev`) is Resend's shared sandbox sender. Before production launch this needs a verified sending domain in Resend, or messages may land in spam or be rate-limited more aggressively than a verified domain would be.

## Environment variables required

* `RESEND_API_KEY` — Resend API key, read via `process.env.RESEND_API_KEY` in `app/actions/submit-contact-form.ts`. Not set in this environment. Without it, the form still functions correctly end-to-end (validates, rejects malformed input, degrades gracefully) but does not send — every otherwise-valid submission returns "This form isn't fully configured yet — please email hello@davidbrowne.dev directly instead." rather than sending and redirecting. Must be set in the Vercel deployment target before launch.

## Notes for review

* The no-JS validation-error path was genuinely uncertain going in (flagged in this milestone's own planning) and was tested empirically rather than assumed: a raw `curl -X POST` replaying the form's server-rendered `$ACTION_REF_1`/`$ACTION_1:0`/`$ACTION_1:1`/`$ACTION_KEY` hidden fields confirmed the server returns the validation error text embedded in the same-URL response body; a Playwright context with `javaScriptEnabled: false` confirmed the same behaviour through an actual browser form submission.
* Server-side validation was confirmed independently authoritative, not just a mirror of the native browser constraints: submitted `email=a@b` (passes native `type="email"`, which per the WHATWG spec doesn't require a dot) and a 4001-character message (no `maxlength` attribute exists to block it natively) with JS disabled — the server rejected both with its own specific messages, at the same URL, no redirect.
* A real bug was found and fixed during this milestone's own verification, not by inspection: `<span className="text-accent">Open</span> to what's next.` — a `<span>` followed by plain text on the same JSX line — rendered with the space between them silently stripped (`Opento`, confirmed via raw SSR HTML and a Playwright bounding-box check), rather than the expected `Open to`. This is a JSX/SWC whitespace-collapsing edge case, not a CSS issue. Fixed by replacing the implicit space with an explicit `{" "}` expression in both `contact-form.tsx`'s headline and `app/contact/page.tsx`'s confirmation headline (the only two places in the codebase with this exact pattern — checked via a full-codebase grep for `</span>` immediately followed by inline text, which found no other instances).
* Keyboard-only navigation was tested directly (Tab sequence capture): focus moves through nav → name → email → message → submit → the Elsewhere links, with the honeypot field never receiving focus (`tabIndex={-1}`), confirmed rather than assumed from the markup alone.
* Honeypot behaviour was tested directly: filling the hidden `company` field and submitting with JS enabled produces the same `?sent=true` redirect as a genuine send, with no indication to the submitter that anything was detected.
* Confirmed no `mailto:` link exists anywhere on the rendered page via a direct HTML search, not by code inspection alone.
* Confirmed the page loads and renders correctly under `prefers-reduced-motion: reduce` (the only motion on this page is the existing CSS-only `.reveal-on-scroll` entrance, already established and reduced-motion-safe from M5/M6 — no new motion was introduced this milestone).

## Ready for M8

**Ready for M8 — Dark mode (horizontal).**

---

# M8 — Dark mode (horizontal)

## Status

**Completed.**

## What was built

* `app/globals.css` — real dark values for the six custom properties M0 defined (`ivory`, `ivory-2`, `card`, `ink`, `accent`, `plate-accent`), plus CSS-only show/hide rules for `ThemeToggle`'s two text labels, keyed to `data-theme` the same way `.masthead-name` is keyed to `data-page`/`data-hero-compressed`.
* `app/layout.tsx` — a second inline blocking script in `<head>`, alongside M2's existing `data-page` one. Resolves `data-theme` from `localStorage`, falling back to `prefers-color-scheme` when nothing is stored, before first paint.
* `components/chrome/theme-toggle.tsx` — new. The milestone's one Client Component: a click handler that flips `document.documentElement.dataset.theme` and persists the choice to `localStorage`. Holds no React state; both text labels ("Dark"/"Light") always render, and `globals.css` decides which is visible.
* `components/chrome/header.tsx` — renders `<ThemeToggle />`, always visible (not hidden at any breakpoint), between the desktop nav and the mobile hamburger.
* `components/journey/journey-canvas.tsx`, `components/about/halftone-portrait.tsx` — a `MutationObserver` on `data-theme` added to each, calling the same draw/render function each component already calls on mount and resize. Both already read colour via `getComputedStyle` at draw time (established in M3/M5), so this was the only code either needed.

## Architectural decisions

**No React Context, no shared hook, no component-level theme branching beyond the two canvas components — matches ADR-002/ADR-011 exactly.** Theme is a `data-theme` attribute on `<html>`, written once by the blocking script before first paint and thereafter only by `ThemeToggle`. Every other component's theme response — including `ThemeToggle`'s own visible label — is plain CSS keyed to that attribute.

**The journey plate inverts brightness in dark mode, not just recolours.** `journey.tsx`'s plate section uses `bg-ink` directly. Because `ink` has to swap from near-black to a warm off-white for its primary role (body text, borders, icon lines) to work in dark mode, the plate's background inherits that swap: a dark panel on a light page in light mode becomes a light panel on a dark page in dark mode. Raised this before writing any code (see the conversation preceding implementation) rather than silently deciding it. Chose to let it happen rather than introduce a dedicated `plate` background token to keep it dark in both themes, since the roadmap's file list authorizes filling in the six property names M0 already defined, not adding a seventh, and `journey-canvas.tsx`'s colour-selection logic (which reads the same two tokens for both the plate's background and the marks drawn on it) stays internally consistent with zero changes either way.

**`--color-plate-accent` no longer equals `--color-accent` in either theme — a real, measured accessibility bug, not a stylistic choice.** Verifying dark mode's contrast empirically (see Notes for review) surfaced that the plate's kicker text was badly under-contrast against its own background in *both* themes, not just the new one: `plate-accent` always sits on `--color-ink` (the plate's own background), and because `ink` inverts in the opposite direction from `ivory` between themes, a single bronze tone tuned for one polarity fails badly against the other. Pre-fix light-mode contrast measured 2.45:1 (fails WCAG AA's 4.5:1); the naive dark-mode equality measured 2.24:1. Fixed by having each theme's `plate-accent` reuse the *other* theme's `accent` lightness — the tone already proven, by direct measurement, to read well against a background of that opposite polarity. Post-fix: 6.77:1 (light) and 6.20:1 (dark), both comfortably passing. This was flagged and fixed within this milestone rather than deferred, since M8 is exactly the milestone responsible for this token set and the defect was found while doing M8's own verification work, not a pre-existing issue rediscovered by accident later.

**Toggle labels current the state, not the destination.** The visible label ("Dark" while in light mode, "Light" while in dark mode) is decided purely by CSS reading `data-theme`, with no React state and therefore no possible hydration mismatch — the same reasoning `app/layout.tsx`'s existing `suppressHydrationWarning` on `<html>` already covers for `data-page`.

**Toggle reachable everywhere via one shared component, not duplicated into the mobile-menu dialog.** Placed in `Header` unconditionally visible at every breakpoint (not `hidden md:flex`, not `md:hidden`), rather than adding a second instance inside `MobileMenu`'s full-screen dialog. The only stated acceptance criterion is keyboard-operability, which this satisfies directly — confirmed the toggle is the second Tab stop on mobile (right after the masthead link, since the desktop nav is hidden there) and lands with a normal visible focus ring.

## Roadmap alignment

Matches `03-roadmap.md`'s M8 entry: `ThemeToggle` (client, added to `Header`) and the inline blocking script exist as named. No Context or shared hook introduced. The two canvas components are the only ones that branch on theme in JavaScript, each via its own independent `MutationObserver` — no shared event bus. Verified directly, not assumed: theme persists across a client-side navigation and a real reload; no flash of the wrong theme (checked by forcing a stored preference before the very first `goto` and reading `data-theme` immediately after — already correct, no post-load flip); both canvas components' pixels changed after toggling, confirmed via `canvas.toDataURL()` frame-diffing (the same technique used in M3's verification); toggle is keyboard-operable (`Tab` reaches it, `Enter` activates it); every page was screenshotted in both themes and compared — the only difference beyond colour is the journey plate's brightness inversion, which is a deliberate, understood consequence of the colour derivation itself (see Architectural decisions), not a typography, spacing, or layout defect.

## Deviations

`--color-plate-accent` diverges from `--color-accent` in both themes, where M0 had them equal — see Architectural decisions. This is a bug fix surfaced by this milestone's own verification, not a deviation from anything the roadmap specified (the roadmap only says dark values fill in the *existing* six property names; it says nothing about `accent` and `plate-accent` needing to stay equal). No other deviations.

## Deferred technical debt

None identified. `--color-card` (one of the six M0 tokens) still has no consumer anywhere in the codebase — filled in with a mechanically-derived dark value for completeness and consistency with the other five, but it remains unverified visually since nothing renders it yet, same as its light-mode value has been since M0.

## Notes for review

* Contrast was measured directly, not assumed: resolved every theme colour to sRGB via a canvas `fillStyle` round-trip (`oklch()`/`lab()` don't parse with a simple regex) and computed WCAG relative-luminance contrast ratios in-browser. Every text/background pairing in both themes: `ink`-on-`ivory` ≈ 16:1, `accent`-on-`ivory` ≈ 7:1, `plate-accent`-on-`ink` ≈ 6.2–6.8:1 — all comfortably clear of the 4.5:1 AA threshold for this text's size.
* The no-flash claim was tested, not assumed: forced a stored dark preference via `addInitScript` (so it exists before the very first navigation), then read `data-theme` immediately after `goto` resolved — already `"dark"`, meaning the blocking script had already run and there was nothing for React or any later script to correct.
* System-preference fallback was tested in both directions with `page.emulateMedia({ colorScheme })`: no stored preference plus `colorScheme: "light"` resolves to light; no stored preference plus `colorScheme: "dark"` resolves to dark. (One iteration of this test was itself wrong — `page.addInitScript` re-runs on every navigation for the page it's registered on, which silently re-clobbered a later `localStorage.removeItem` call in the same test and produced a false failure. Caught by re-testing the same assertion in isolation on a page with no init script registered, which passed — a reminder that a failing empirical check can be the test's own bug, not the app's, and needs the same scrutiny as a passing one before either is trusted.)
* The journey plate's brightness inversion (see Architectural decisions) was confirmed to look intentional rather than broken by reviewing full-page screenshots of every route in both themes side by side — in dark mode the plate reads as a light "spike" against the dark page, the same structural role the dark spike plays against the light page, not a rendering defect.
* Two things that looked like bugs in an early dark-mode screenshot were checked directly against computed styles rather than accepted at face value: the header's masthead name appeared faint in a downscaled full-page screenshot (confirmed via `getComputedStyle` to be `opacity: 1` at the correct off-white colour — a screenshot-compression artifact, not a real dim state) and the "About" nav link appeared permanently accent-highlighted across three different routes' dark screenshots (confirmed to be `:hover`'s CSS pseudo-class, not an unintended active-route indicator — Playwright's virtual cursor stayed at the same screen coordinates across navigations, and the header is fixed-position and identical on every route, so the same coordinates kept landing on that link).

## Ready for M9

**Ready for M9 — Hardening and launch readiness.**

---

# M9 — Hardening and launch readiness

## Status

**Completed.**

## What was built

* `app/robots.ts`, `app/sitemap.ts` — sitemap computed from the same `projects` array `generateStaticParams` already uses (ADR-006), not a hand-maintained slug list.
* `app/not-found.tsx`, `app/error.tsx` — styled to match the site rather than left as framework defaults. `error.tsx` is a general safety net; no specific throw path in the app is currently expected to reach it (every Server Component renders from static, typed `lib/content/` data, and the contact form's Server Action already catches its own errors and returns state).
* `app/opengraph-image.tsx` — a generated, typographic social-preview card (`next/og`'s `ImageResponse`), applied site-wide via Next's file-convention inheritance. No real project photography exists yet, so a generated card was the honest choice over faking a screenshot.
* `app/layout.tsx` — `metadataBase`, full Open Graph/Twitter defaults, Person + WebSite JSON-LD, and a skip-navigation link (WCAG 2.4.1) targeting a newly-focusable `#main-content`.
* `app/about/page.tsx`, `app/work/page.tsx`, `app/contact/page.tsx` — `alternates.canonical` and per-page Open Graph/Twitter metadata added, each reusing the page's own existing title/description rather than re-authoring copy.
* `app/work/[slug]/page.tsx` — `generateMetadata` extended with canonical/OG/Twitter; CreativeWork + BreadcrumbList JSON-LD added, computed from `project` data with no invented claims (confidential projects get exactly their existing public copy, nothing more).
* `components/chrome/header.tsx` — a `<noscript>` fallback nav, fixing a real gap: `MobileMenu` is entirely `onClick`-driven, so with client JavaScript unavailable there was previously no way to reach About/Work/Contact below the `md` breakpoint at all.
* `components/chrome/theme-toggle.tsx` — touch target expanded from 30.8×11px to 30.8×27px via padding (invisible; the visible text is unchanged) to clear the 24×24 CSS px minimum.
* 18 call sites across 12 files — `text-ink/45` raised to `text-ink/62` (ADR-012).
* `components/hero/magnetic-letters.tsx` — the letters' spring-physics loop now stops scheduling frames once settled and the pointer is away, restarting only on the next `pointermove`/`pointerleave`, instead of running `requestAnimationFrame` forever.
* `components/contact/tick-motif.tsx` — `overflow-hidden` added, fixing a real page-level horizontal-scroll bug on narrow viewports.
* `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — removed. Unused `create-next-app` scaffold, confirmed unreferenced anywhere in the codebase.

## Architectural decisions

**Structured data omits `sameAs`.** GitHub/LinkedIn are still placeholder `#` hrefs (`components/chrome/footer.tsx`, `components/contact/elsewhere-card.tsx`); emitting them as `Person.sameAs` would be false structured data. Add once those are real URLs.

**One shared `opengraph-image.tsx`, not per-route variants.** Keeps this milestone's scope to hardening rather than opening a new per-page design surface; every route inherits the same generated card via Next's file-convention. Uses system fonts, not the site's own Archivo/IBM Plex Mono — `ImageResponse` needs font data as a fetched binary, not `next/font`'s React components, and fetching one for a single static image wasn't judged worth the added complexity. Documented as a deliberate, accepted trade-off, not an oversight.

**The confidential project stays indexable.** `app/sitemap.ts` includes `/work/private-equity-platform` like every other case study — the page itself carries no confidential detail, only NDA-safe copy already meant to be public, so there's no reason to exclude it from discovery.

**Tertiary text opacity raised, `text-ink/45` → `text-ink/62` (ADR-012).** A genuine, measured, pre-existing WCAG AA contrast failure (2.87:1 light / 4.09:1 dark, both under 4.5:1), not a stylistic preference — see ADR-012 for the full measurement and reasoning. This is the same category of finding as M8's `plate-accent` fix: caught by this milestone's own rigor, not inherited from a prior milestone's review.

**The magnetic-letters idle loop is a non-negotiables violation, not a style nit.** `04-non-negotiables.md` states plainly: "No idle-looping animation." The pre-fix code called `requestAnimationFrame(tick)` unconditionally at the end of every frame, forever, from mount — confirmed empirically at 120 calls/second while completely idle (two frames' worth of scheduling overlap during the fix's verification, since the very first tick already begins winding down). Fixed rather than left as a known issue, since it directly contradicts an explicit rule this project holds itself to, not a soft aspiration.

## Roadmap alignment

Matches `03-roadmap.md`'s M9 entry across every listed area — see the completion report delivered alongside this entry for the full measured results (build/typecheck/lint, contrast, bundle size, Core Web Vitals, responsive sweep, internal-link validation). Two of M9's own listed components (`not-found.tsx`, `error.tsx`) exist; `loading.tsx` was deliberately not added anywhere, per the roadmap's own instruction to avoid loading UI on fully static routes without genuine need — none of this site's routes have an async data-fetching boundary that would benefit from one.

## Deviations

None from the roadmap's stated scope. The `text-ink/62` change and the `magnetic-letters.tsx` idle-loop fix touch code approved in earlier, already-reviewed milestones (M2, and the meta-text pattern established from M1 onward) — flagged explicitly here and in the completion report rather than folded in silently, since both are genuine bug fixes surfaced by this milestone's own verification, not new work outside its scope.

## Notes for review

* Every finding in this milestone was caught by direct measurement, not code review: contrast via canvas-composited pixel readback (not regex-parsed computed styles, which produced false results on a first pass — see the completion report), idle-loop cost via monkey-patched `requestAnimationFrame` counting, layout overflow via `document.documentElement.scrollWidth` across five real breakpoints, JS bundle size via Chrome DevTools Protocol's `encodedDataLength` (actual compressed wire bytes, not decompressed body size, which a first pass over-reported by roughly 3-4x).
* One verification false alarm worth recording: after fixing the idle-loop bug, an initial retest showed the hover interaction itself appeared to stop working entirely. Traced to a stale `next start` process left bound to the test port from before the fix, serving mismatched chunk references after the rebuild (visible as 500s on `_next/static/chunks/*`) — not a regression in the fix. Caught by checking for HTTP errors directly rather than trusting an unexplained result, and re-verified cleanly against a freshly-started production server.

## Ready for launch

**M0–M9 complete.** Launch readiness is conditional on the environment/deployment checklist in the M9 completion report (production domain, `RESEND_API_KEY`, Vercel environment variables) — not on any further implementation work.
