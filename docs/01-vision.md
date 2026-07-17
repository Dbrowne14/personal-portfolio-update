# Vision

This document is the project's primary source of truth. It assumes `creative-direction.md` and `content-brief.md` as read and does not restate positioning, audience, or tone. It states the narrative and visual doctrine that governs implementation — the answer to "does this belong on the site" for every decision made from here on.

The complete documentation set:

- `01-vision.md` — this document. Narrative and visual doctrine.
- `02-architecture.md` — technical doctrine derived from this document.
- `03-roadmap.md` — the milestone-by-milestone build plan.
- `04-non-negotiables.md` — the review checklist distilled from the other documents.
- `05-decisions.md` — the record of why each major decision was made.

All five are frozen and treated as a set. Where any document conflicts with this one, this document wins.

The central idea is stated by the site's structure before it is stated in words: analysis giving way to construction.

## The governing axis

The site moves along one axis: precision toward construction. Every section sits somewhere on it. Every future addition is tested against one question — does this feel analytical, or does it feel like building? A section that cannot answer that question does not belong on the site.

The axis has four distinct voices, not one uniform tone:

| Section | Speaks in |
|---|---|
| The chart | Data |
| About | Reasoning |
| Work | Evidence |
| Contact | Invitation |

## The five acts

### I — The Opening Position
**Purpose.** Prove precision before anything else is said.
**Effect.** Stillness. A held breath.
**Register.** The analytical pole of the site. No motion until the visitor acts.
**Transition.** The monument compresses into the masthead on scroll — the site's first physical movement, and the first sign that stillness is ending.

### II — The Inflection
**Purpose.** State the thesis as data, not adjective. The signature interaction; nothing else on the site rivals it.
**Effect.** The pivot. The one moment the site is permitted to surprise.
**Register.** The single full-bleed dark plate on the site. A hand-drawn curve resolves into quantized ticks at the 2025 switch — uncertainty becoming precision, rendered as a line, not asserted as a claim.
**Transition.** The final milestone is a claim ("full-stack product engineer"). Home closes on a brief proof-teaser, not a call to action — the ask belongs at the end of the journey, not the middle.

### III — The Decision
**Purpose.** Answer why, not what or who. The chart states the fact; this act states the reasoning.
**Effect.** The site's only moment of interiority — a human voice, first person, arguing rather than declaring.
**Register.** Between analysis and evidence. Reading-scale type, the closest the site comes to prose.
**Transition.** The decision has a causal consequence. Work is what the reasoning produced, not merely what comes next.

### IV — The Evidence
**Purpose.** Maximum contact with the real. Less abstraction, more product.
**Effect.** Momentum built from density and specificity, not from motion.
**Register.** The most "built" register on the site — real screenshots, real colour, the site's own palette discipline yielding to the colour of the work itself.
**Transition.** Hands off to Contact via the same tick motif that opened on the chart — the line is still running.

### V — The Open Position
**Purpose.** Close the loop the chart opened. Invitation, not solicitation.
**Effect.** Openness and warmth, not intensity — a change of address, not a peak.
**Register.** The calmest section outside the hero; the largest whitespace return on the site.
**Transition.** None. This is the end of the journey. The unfinished tick line is the last image the visitor carries.

## Interaction doctrine

- One signature interaction: the career chart. It is the only full-bleed colour plate, the only place canvas fully drives the composition, the only interaction with cross-page recurrence.
- Supporting interactions reinforce the register of their own act and never compete with the chart: hero entrance and compress, magnetic letters, hover states, the halftone portrait, gallery and page transitions.
- No supporting interaction runs on a persistent loop. Motion fires on load, on scroll, or on pointer input — never on a timer.
- Every motion answers one of the five questions in `creative-direction.md`'s motion principle. A motion that answers none of them does not ship, regardless of how it looks.

## Technology disclosure

There is no standalone skills or toolset grid. The stack surfaces three ways only, at three depths of attention:

- **The title block**, a single quiet line of mono type at the base of the hero, opposite the scroll cue, naming four or five core tools. Borrowed from the title block of an architectural drawing — scale, materials, drafter, present but never the subject. This is the one place the stack is *curated*, not computed: a deliberate identity statement, not an inventory. It carries no motion and no hover state — text, not a component — and it belongs to the hero alone; it does not repeat in the header or footer. It exists so the stack is legible within the first minute without becoming a section.
- **Per project**, as a short mono credit line attached to each case study — always tied to a specific shipped thing, never floating as an abstract claim.
- **In aggregate**, as a colophon closing the Work page — a quiet, bibliographic listing in the register of a printer's imprint, not a promotional section. It is computed from the same per-project data, never hand-maintained, so it cannot drift out of sync with what each case study actually claims.

The title block is chosen; the colophon is derived. Neither substitutes for the other.

## Visual rhythm

**Density.** Near-empty at the hero. A sharp, contained spike at the chart plate. Open again through the proof-teaser. Locally variable at the portrait, where density itself does figurative work. Sustained and high through Work — the densest, busiest stretch on the site, deliberately cluttered. Emptiest of all at Contact.

**Whitespace.** Most abundant at the hero, where it reads as poise. Generous and warm at About, scaled to a page of prose rather than a gallery wall. Tightest at Work, where gutters narrow and images approach full bleed. Most abundant again at Contact, where the same physical quantity now reads as openness rather than stillness.

**Typographic scale.** Largest at the hero. Widest range within a single section at the chart — one large headline against a scatter of very small annotations, nothing in between. Narrows toward reading scale at About. Recedes below the imagery at Work, where type serves evidence rather than making statements. Returns to its largest scale at Contact, rivalling the hero, the one deliberate bookend on the site.

**Linework.** Absent at the hero — pure typography, no structure yet visible. At its most expressive at the chart, where the line is the content, not decoration. Quiet and infrequent at About. Present at Work only as structural infrastructure, dividing dense content rather than composing it. A single line at Contact, fading toward the page edge, unfinished on purpose.

**Colour distribution.** Ivory and warm ink dominate throughout; bronze is a mark, never a field, except once. The hero spends it as a whisper. The chart plate is the one full colour event on the site. About uses it as a soft, intimate wash. Work cedes the site's own palette discipline to the uncontrolled colour of real product screenshots. Contact spends bronze at its highest concentration of the whole site, on the single largest word — the site's own colour, undiluted, saved for last.

**Compression and release.** The site breathes once. Near-silence, a sudden dark inhale at the chart, a slow exhale into intimacy at About, a long held breath of density through Work, and the fullest release of the sequence at Contact — paler, calmer, and warmer than the opening, closing on the one colour the site allowed itself to spend freely.

## Colour and material

- Light is the primary and only designed identity. Dark is derived from it, not designed alongside it.
- Only colour and material change between themes. Typography, spacing, hierarchy, and interaction timing are identical in both.
- Theme state is a `data-theme` attribute on `<html>`, set before first paint by an inline blocking script, driving CSS custom properties everywhere.
- Canvas-driven components — the chart, the portrait — are the only components that read theme state in JavaScript, each observing it independently. No other component branches on theme, and no shared hook or Context coordinates the two.

---

The site is not a portfolio that describes a transition. It is a transition, entered once per visit.
