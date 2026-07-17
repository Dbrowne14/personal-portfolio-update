# Roadmap

This document assumes `01-vision.md`, `02-architecture.md`, and `04-non-negotiables.md` as read. It sequences implementation into small, reviewable milestones, each leaving the application in a working, deployable state. It is a living document — update it as milestones complete or as scope is revised, but changes to sequencing or scope should not contradict the frozen doctrine in the other three documents.

Milestones are ordered as vertical slices wherever possible: a section is taken from empty to complete before the next section begins. Two milestones are horizontal by necessity — the project substrate (M0) and dark mode (M8) — and are marked as such.

## Assumptions

- Deployment target is Vercel.
- No analytics tool is in scope. None will be introduced without a separate decision.
- The contact form requires a transactional email provider and a recipient address, confirmed before M7 begins.
- Final photography, project screenshots, and CV assets are content dependencies outside engineering scope. Milestones that need them use the established hairline placeholder pattern until assets are ready.

## Project data shape

Defined once, before the first milestone that consumes it, so later milestones extend data rather than restructure schema.

```ts
interface Milestone {
  year: number;
  label: string;               // e.g. "Investment banking — knowledge economy"
  value: number;                // 0–1, normalized position on the chart's vertical axis
  era: "banking" | "engineering";
  isSwitch?: boolean;            // marks the 2025 inflection point
}

interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  stack: string[];               // source for the project credit line and the colophon
  featured: boolean;              // homepage teaser inclusion
  order: number;
  heroImage: { src: string; alt: string };
  gallery?: { src: string; alt: string }[];
  evaluatorNote?: string;
  highlights?: { title: string; body: string }[];
  links?: { label: string; href: string }[];
  confidential?: boolean;         // gates the hairline placeholder treatment
}
```

`Milestone` is fully populated at M3. `Project` is fully typed at M4 but only populated for the four featured projects with the fields Home's teaser needs (`slug`, `title`, `oneLiner`, `stack`, `featured`, `order`, `heroImage`); M6 populates the remaining fields and the two non-featured projects. The type never changes shape between M4 and M6 — only the data does.

---

## M0 — Project substrate

**Objective.** A deployable, correctly typeset blank canvas. No content, no chrome, no interactivity.

**Components.** None — tooling and tokens, not UI.

**Files.** `app/layout.tsx` (bare shell), `app/globals.css` (reset and CSS custom properties, light values only), Tailwind token configuration, `lib/fonts.ts` (`next/font` for Archivo and IBM Plex Mono).

**Dependencies.** None.

**Risks.** None outside standard tooling setup.

**Architectural decisions.** CSS custom property *names* are defined now for both themes, including the dark-mode variables; only light *values* are filled in. The token surface does not change shape at M8 — only its values do.

**Acceptance criteria.** `next build` succeeds. The deployed root route renders an empty ivory page with both typefaces loading correctly. No console errors. A Lighthouse baseline is recorded as the zero point for later comparison.

---

## M1 — Global chrome and route skeleton

**Objective.** Every route exists and is navigable. Nothing 404s from this point forward.

**Components.** `Header` (server), `MobileMenu` (client), `Footer` (server).

**Files.** `components/chrome/header.tsx`, `components/chrome/mobile-menu.tsx`, `components/chrome/footer.tsx`, `app/layout.tsx` (chrome wired in), `app/page.tsx`, `app/about/page.tsx`, `app/work/page.tsx`, `app/contact/page.tsx` (each a minimal real heading, not final copy).

**Dependencies.** M0.

**Risks.** None significant.

**Architectural decisions.** No theme toggle in the header yet — dark mode does not exist until M8, and adding a toggle earlier would be dead UI. `MobileMenu` is the first genuine Client Component, justified by focus-trap and open/close state.

**Acceptance criteria.** All four routes reachable from the nav on desktop and mobile. Mobile menu opens and closes via mouse, keyboard, and `Escape`. Focus never escapes the open menu. Keyboard tab order is correct on every route.

---

## M2 — Hero, complete (Act I)

**Objective.** The Opening Position, fully realized.

**Components.** `Hero` (server), `HeroStage` (client, scroll-compress), `MagneticLetters` (client, fine-pointer only), the hero title block (static server-rendered text).

**Files.** `components/hero/hero.tsx`, `components/hero/hero-stage.tsx`, `components/hero/magnetic-letters.tsx`, edits to `components/chrome/header.tsx`.

**Dependencies.** M1.

**Risks.** Reduced-motion path needs an explicit test pass, not a follow-up: threshold swap instead of continuous transform, `MagneticLetters` not mounting at all.

**Architectural decisions.** The masthead name's fade-in is driven by `HeroStage` toggling a data attribute on `<html>` (e.g. `data-hero-compressed`) as scroll crosses the compress threshold; the masthead's CSS opacity is keyed to that attribute plus a `data-page="home"` marker, defaulting to visible on every other route. This coordinates two independently server-rendered regions — `Hero` and `Header` — without a React Context provider, consistent with `02-architecture.md`'s preference for DOM and CSS coordination over Context.

**Acceptance criteria.** Hero renders with no motion on first paint. Scroll-compress holds 60fps on a mid-tier device. Masthead name fade-in is correctly synced to compress progress. `prefers-reduced-motion: reduce` collapses both effects to instant states. Mobile drops magnetics but keeps scroll-compress. The title block is real, selectable text.

---

## M3 — Journey, complete (Act II)

**Objective.** The signature interaction, end to end. The highest-risk, highest-value milestone in the roadmap.

**Components.** `Journey` (server), `MilestoneList` (server, accessible), `JourneyCanvas` (client), the shared milestone-to-point geometry function.

**Files.** `lib/content/journey.ts` (first entry in the typed content layer, per the `Milestone` shape above), `components/journey/journey.tsx`, `components/journey/milestone-list.tsx`, `components/journey/journey-canvas.tsx`, `components/journey/geometry.ts`.

**Dependencies.** M2, for continuity of build order rather than a technical requirement.

**Risks.** Canvas resize and device-pixel-ratio handling needs verification on an actual high-DPI device, not only emulation.

**Architectural decisions.** `MilestoneList` is plain server-rendered markup, visually clipped (not `display: none`) on desktop viewports and visually promoted to primary content on narrow viewports — the same accessible source in both cases. `JourneyCanvas` is `aria-hidden`, since it is a decorative and interactive duplicate of information `MilestoneList` already provides. Year labels and the scrub tooltip are DOM elements positioned by the shared geometry function; text is never drawn into the canvas.

`JourneyCanvas` is loaded via a dynamic import gated on a client-side capability check (desktop-width viewport, fine pointer). This is a revision to the original framing of this milestone: the milestone content requires no client JavaScript to render or be read by assistive technology, but `JourneyCanvas`'s code still exists in the route's client bundle and is hydrated by React wherever it is rendered. Deferring its import keeps it out of the initial mobile bundle rather than claiming its code is entirely absent.

**Acceptance criteria.** Curve renders correctly at all viewport widths. Quantization at the 2025 milestone is visually unambiguous. Scrub works via mouse and touch. Every milestone is present as real text in the accessibility tree regardless of viewport. Reduced motion keeps scrubbing but drops the idle and entrance draw. `JourneyCanvas` is confirmed absent from the initial JavaScript payload on a mobile-width, coarse-pointer request via bundle inspection, not visual inspection alone.

---

## M4 — Home, complete

**Objective.** Close out the homepage. The first milestone where a full page matches `01-vision.md` end to end.

**Components.** `WorkTeaser` (server), the soft forward link replacing a hard call to action.

**Files.** `lib/content/projects.ts` (new, per the `Project` shape above — featured subset populated only), `components/work/work-teaser.tsx`, `app/page.tsx` (final assembly).

**Dependencies.** M3.

**Risks.** None significant.

**Architectural decisions.** The full `Project` type is defined now; only the fields the teaser needs are populated. Extending data at M6 rather than the type itself is a direct application of introducing reusable structure only once a second use case exists.

**Acceptance criteria.** Full homepage matches the density, whitespace, and compression-release doctrine in `01-vision.md`'s Visual Rhythm section on review. Grayscale-to-colour hover is pure CSS, confirmed by the absence of any attached event listener. No call-to-action button exists on this page. The page ends on a quiet forward link only.

---

## M5 — About, complete (Act III)

**Objective.** The site's only moment of interiority, built end to end.

**Components.** `DecisionIntro` (server), `HalftonePortrait` (client), a locally scoped scroll-entrance fade.

**Files.** `app/about/page.tsx`, `components/about/decision-intro.tsx`, `components/about/halftone-portrait.tsx`.

**Dependencies.** M3, for the credential line computed from `journey.ts`.

**Risks.** None significant.

**Architectural decisions.** The entrance-fade behaviour is built inline to this page rather than extracted into a shared component. A second use case does not yet exist; extraction happens at M6, when Work needs the same behaviour. `HalftonePortrait` renders a real `next/image` of the source photograph underneath the canvas with correct alt text, so accessibility does not depend on the canvas rendering at all.

**Acceptance criteria.** The credential line matches `journey.ts`'s first and last entries exactly, with no hand-typed duplicate string anywhere in the component. The portrait canvas is `aria-hidden`. The portrait draws once and stops under reduced motion or on coarse pointers, confirmed by no animation frame loop starting. No standalone toolset section exists on this page.

---

## M6 — Work, complete (Act IV)

**Objective.** The largest milestone in the roadmap: full case-study routing, the colophon, and extraction of the shared entrance primitive.

**Components.** `ProjectIndex` and `ProjectRow` (server), `CaseStudyHero`, `EvaluatorNote`, `CaseStudyBody`, `TechCredit` (all server), `ProjectGallery` (server-first, CSS scroll-snap), `Colophon` (server, computed), `Reveal` (extracted from About).

**Files.** `lib/content/projects.ts` (extended: highlights, gallery, evaluator's note, full stack, remaining projects), `app/work/page.tsx`, `app/work/[slug]/page.tsx` (including its own `generateStaticParams` and `generateMetadata` exports), `components/work/*`, `components/shared/reveal.tsx` (new, replacing the inline version built in M5).

**Dependencies.** M4 for the schema, M5 for `Reveal`.

**Risks.** Six case studies with real screenshots is the milestone most exposed to missing final assets; the hairline placeholder pattern should be ready per project rather than a late fallback.

**Architectural decisions.** `generateStaticParams` and `generateMetadata` are exported directly from `app/work/[slug]/page.tsx`, not defined in a separate file, per `02-architecture.md`. `ProjectGallery` defaults to a CSS scroll-snap strip with no client code; a client component is added only if an active-slide indicator proves genuinely necessary. The colophon is computed (`projects.flatMap(...)`, deduplicated), never hand-written, so it cannot drift from what each case study claims.

**Acceptance criteria.** All six case studies resolve via `generateStaticParams` with no runtime data fetching. Disabling JavaScript still renders full case-study content; only an optional gallery indicator, if built, may degrade. Editing one project's stack updates the colophon without a second edit. Back button and direct links to a case study both work correctly.

---

## M7 — Contact, complete (Act V)

**Objective.** The closing act, and the site's proof that it ships working, non-decorative infrastructure.

**Components.** `ContactForm` (server, Server Action), `SubmitStatus` (client), `ElsewhereCard` (server), the trailing tick-motif graphic (server, `aria-hidden`).

**Files.** `app/contact/page.tsx`, `app/actions/submit-contact-form.ts`, `components/contact/*`, environment variables for the email provider.

**Dependencies.** M1.

**Risks.** Requires a decision before this milestone starts: which email provider, and the recipient address. This is the only milestone introducing a secret into the project; confirm environment-variable handling before writing the action.

**Architectural decisions.** With client JavaScript available, `SubmitStatus` uses `useFormStatus`/`useActionState` to show inline pending, success, and error states without a full page reload. Without client JavaScript, the native `<form action={submitContactForm}>` still performs a real submission — the Server Action still executes and the message still sends — and confirmation is delivered through a server-rendered response (the action redirects to a confirmation state read from a search parameter, rendered server-side) rather than through client state. Client code enhances the feedback; it never gates the submission.

**Acceptance criteria.** Submitting the form with JavaScript disabled still sends the message and still shows a confirmation, via full navigation rather than inline state. A screen reader announces success or failure through the `aria-live` region without requiring manual focus movement. No `mailto:` link exists anywhere on this page. Malformed input is rejected server-side, not only client-side.

---

## M8 — Dark mode (horizontal)

**Objective.** Derive the dark theme from the finished light theme, sequenced last per `01-vision.md`.

**Components.** `ThemeToggle` (client, added to `Header`), the inline blocking theme script in `app/layout.tsx`.

**Files.** `app/globals.css` (dark values fill in the property names defined at M0), `components/chrome/theme-toggle.tsx`, edits to `journey-canvas.tsx` and `halftone-portrait.tsx` to redraw on theme change.

**Dependencies.** M0–M7 complete. This is the only horizontal milestone after M1, by design — it cannot be done credibly until there is a finished light site to derive from.

**Risks.** None significant, given the acceptance criteria below.

**Architectural decisions.** No React Context and no shared hook are introduced for theme state. Theme is a `data-theme` attribute on `<html>`, set before first paint by the inline script and mutated by `ThemeToggle`. Every component's colour is a CSS custom property keyed to that attribute; no component branches on theme in JavaScript except the two canvas components, which cannot use CSS variables for `ctx.fillStyle`. Each of those two components independently observes the attribute with its own `MutationObserver` and redraws on change. No shared event bus or context provider coordinates them.

**Acceptance criteria.** Theme persists across navigation and reload. No flash of incorrect theme on load. Both canvas components redraw correctly on toggle, each via its own observer. Toggle is keyboard-operable. A side-by-side comparison of every page in both themes shows no difference beyond colour and material — any difference in typography, spacing, or layout is a defect.

---

## M9 — Hardening and launch readiness

**Objective.** A cross-cutting quality pass verifying that discipline held across the previous eight milestones, not new feature work.

**Components.** `not-found.tsx`, `error.tsx`, `robots.ts`, `sitemap.ts`, `generateMetadata` per route, structured data (JSON-LD) for the person and for each case study.

**Files.** As above. No new UI components — this milestone touches configuration, metadata, and verification, not components.

**Dependencies.** M0–M8 complete.

**Risks.** None beyond the standard risk of finding defects during a hardening pass, which is the milestone's purpose.

**Architectural decisions.** None new. This milestone verifies existing decisions rather than introducing them.

**Acceptance criteria**, organized by area:

- **Accessibility.** Full keyboard-only walkthrough of all five acts. Screen reader spot-check of the hero, the chart's accessible milestone list, the portrait, and the contact form's live region. Zero critical automated-scan violations.
- **Performance.** Lighthouse run on every route, compared against the M0 baseline. Confirmed no regression in Largest Contentful Paint or Cumulative Layout Shift introduced by canvas components.
- **Metadata.** Every route has correct title, description, and Open Graph data, sourced from `lib/content/` where applicable rather than hand-duplicated.
- **Structured data.** Valid JSON-LD present for the person (home or about) and for each case study, verified against schema.org's validator.
- **Responsive QA.** Manual pass at mobile, tablet, and desktop breakpoints on every route, checked against the responsive behaviour specified per act in `01-vision.md`.
- **Reduced motion.** Every motion-bearing component confirmed to collapse to its static or threshold state under `prefers-reduced-motion: reduce`, re-tested here as a full-site pass rather than per-component.
- **Bundle review.** Client-side JavaScript inventory confirmed against the list of genuine Client Components in `02-architecture.md` — no undeclared client boundary has been introduced.
- **Error handling.** `not-found.tsx` and `error.tsx` match the site's visual language rather than framework defaults; a bad case-study slug and a failed form submission are both verified to degrade correctly.
- **Launch readiness.** `robots.ts` and `sitemap.ts` correctly reflect the final route set; environment variables for production are confirmed set in the deployment target; a full non-negotiables pass against `04-non-negotiables.md` is completed and recorded.

---

## Deferred enhancements (post-launch, not blocking M9)

- View Transitions API for the Work index-to-case-study image handoff, degrading to a plain navigation where unsupported.
- Build-time-precomputed static halftone image, removing client JavaScript from `HalftonePortrait` entirely for visitors without a fine pointer.
