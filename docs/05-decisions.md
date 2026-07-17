# Decisions

This document assumes `01-vision.md` and `02-architecture.md` as read. It is a lightweight architecture decision record — the history of why, not the doctrine itself. When a decision here and the doctrine in another document appear to disagree, the other document is current and this record is the explanation of how it got there.

Entries are numbered in the order the decisions were made, not by importance.

## ADR-001 — The career chart is the site's only signature interaction

**Decision.** One interaction on the entire site — the career chart on the homepage — carries full signature weight: the only full-bleed colour plate, the only canvas-driven composition, the only interaction with cross-page recurrence.

**Reason.** An earlier reference implementation treated four separate interactions as equally signature (hero lettering, chart, portrait, case-study expansion), which split visitor attention and diluted the site's central thesis. A single, load-bearing interaction gives the site one memorable moment instead of four competing ones.

**Consequences.** Every other interaction on the site is explicitly demoted to supporting status and is designed not to compete with the chart in visual weight, motion budget, or colour. See `01-vision.md`'s Interaction doctrine.

## ADR-002 — Dark mode is derived from the light theme

**Decision.** Light is the primary, fully designed identity. Dark mode is generated from it by changing colour and material only; typography, spacing, hierarchy, and interaction timing are identical in both.

**Reason.** Requested explicitly to prevent dark mode from becoming a second design effort competing with the light theme for design attention and implementation time.

**Consequences.** Dark-mode work is sequenced last in `03-roadmap.md` (M8), after the light theme is complete, rather than built in parallel. The two canvas components are the only ones that read theme state in JavaScript; every other component's theme response is CSS-only.

## ADR-003 — Technology disclosure follows Title Block → Project Credit Line → Colophon

**Decision.** The technology stack is disclosed at three depths of attention and nowhere else: a curated title block in the hero, a per-project credit line on each case study, and a computed colophon closing the Work page.

**Reason.** The stack needed to be discoverable within the first minute of a visit without a standalone skills section, which the project's design principles rule out as a generic pattern.

**Consequences.** The title block is authored and fixed; the colophon is computed from project data and cannot drift from it. No other location on the site lists technologies.

## ADR-004 — Server Components by default

**Decision.** Every component is a Server Component unless a specific interaction requirement — canvas, pointer tracking, form state, scroll listening — cannot be met otherwise.

**Reason.** Minimizes client-side JavaScript and keeps content server-rendered and directly indexable, consistent with the project's performance and simplicity goals.

**Consequences.** Each Client Component in the codebase should be traceable to a specific requirement in `02-architecture.md` or `03-roadmap.md`. A Client Component introduced for convenience rather than necessity is a defect, not a style choice.

## ADR-005 — Client Components exist only where behaviour genuinely requires them

**Decision.** A boundary is drawn at the smallest possible unit of interactivity — a single canvas, a single form's submit status, a single menu's open state — rather than at the page or section level.

**Reason.** Composition of small client islands inside server-rendered content keeps the client bundle minimal and keeps content server-owned even where a nearby element is interactive.

**Consequences.** Client components generally receive server-rendered content through `children` and props rather than owning that content themselves. See `HeroStage` wrapping `Hero`'s text in `03-roadmap.md`'s M2.

## ADR-006 — Content is derived from shared typed data

**Decision.** Projects and career milestones each have a single typed source (`lib/content/`). Every place the same information appears elsewhere — About's credential line, Work's colophon, the mobile timeline — is computed from that source, never re-authored.

**Reason.** An earlier reference implementation stated the same career timeline in three unrelated places by hand, which invited drift between them.

**Consequences.** The full data shape is defined before the first consuming page is built (`03-roadmap.md`'s Project data shape section), so later milestones extend data rather than restructure the type.

## ADR-007 — No standalone Skills or Toolset section

**Decision.** The site never presents technologies as a grid, list, or dashboard-style section on its own.

**Reason.** A dedicated skills section reads as a generic developer-portfolio pattern and was judged inconsistent with the project's editorial, evidence-led positioning.

**Consequences.** See ADR-003 for what replaces it.

## ADR-008 — Real routes instead of accordion state

**Decision.** Case studies are individual routes (`/work/[slug]`) rendered at build time, not rows that expand in place inside a single page.

**Reason.** An in-place expansion pattern in an earlier reference implementation required client-managed open/closed state, hash-based deep-linking, and manual focus management, all of which a real route provides natively through the browser.

**Consequences.** No accordion state, no manual focus trapping, and no custom deep-link handling exist in the Work section. Each case study is independently indexable and shareable.

## ADR-009 — One full-bleed colour plate only

**Decision.** The chart's ink plate is the only section on the entire site permitted a full-bleed colour field. Every other section is built on the ivory canvas with colour used as a mark, not a field.

**Reason.** Reserves the site's single largest visual gesture for its single most important interaction, rather than letting colour intensity recur and lose its impact.

**Consequences.** Any future section proposing a full-bleed colour treatment is inconsistent with this decision and should be challenged before being built.

## ADR-010 — Motion must always have narrative, usability, or feedback value

**Decision.** A motion or animation ships only if it reveals information, shows progression, connects two parts of the narrative, improves spatial understanding, or makes an interaction more direct.

**Reason.** Restates the motion principle in `creative-direction.md` as an implementation-time test rather than a design-time aspiration, so it applies equally to features added after launch.

**Consequences.** No animation on the site runs on a persistent timer. Every motion in `03-roadmap.md` is justified against this test in that milestone's architectural decisions.

## ADR-011 — Prefer DOM and CSS state over React Context for cross-component coordination

**Decision.** Where two components need to agree on a piece of state, the default mechanism is a DOM attribute observed via CSS or `MutationObserver`, not a React Context provider. Context is introduced only when no simpler mechanism exists.

**Reason.** Surfaced while confirming the dark-mode architecture (ADR-002): an earlier draft of the roadmap introduced a Context provider for both the hero-to-masthead visibility handoff and for theme state, neither of which needed shared React state once the coordination was expressed as a DOM attribute plus CSS.

**Consequences.** Theme state (M8) and the hero-to-masthead handoff (M2) are both implemented as DOM attributes read declaratively by CSS or observed imperatively by the two canvas components. No Context provider exists in the codebase as of this record; introducing one requires demonstrating that no DOM or CSS mechanism can do the job.
