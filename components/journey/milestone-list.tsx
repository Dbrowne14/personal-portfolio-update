import type { Milestone } from "@/lib/content/journey";

interface MilestoneListProps {
  milestones: Milestone[];
}

// Server Component. The permanent, always-visible timeline — the site's
// primary responsive pattern for this section (journey.tsx), not a fallback
// the chart hides. Below `md` it's the entire Journey experience, sized and
// spaced for an unhurried editorial read; at `md` and up it's the compact
// left-hand column of a composition the chart (JourneyCanvas, an aria-hidden
// visualisation of this same data — never a second source of information)
// sits beside or below. Both scales share one set of markup; only spacing
// and dot size change per breakpoint.
//
// The fill line and each item's data-timeline-item/[data-active] styling
// are inert markup by default — real content and correct appearance with
// zero JavaScript. JourneyInteraction (client), which wraps this component
// in journey.tsx, is what actually moves the fill and toggles the active
// state as the visitor scrolls, and (at `lg` and up, where the chart
// exists) feeds the same active index to JourneyCanvas as a prop to glow
// the matching point on the graph. Without it mounting, this renders as a
// plain static timeline, not a broken one.
//
// Two colour palettes, one per era — not tied to the removed "switch"
// annotation, just the marker/year treatment itself:
// - Pre-2025 (isPostSwitch false): grey at rest, black/ink on activation —
//   never bronze. The halo and the dot's active fill both use ink, so the
//   "highlight" colour matches across every layer for this group.
// - 2025/2026 (isPostSwitch true): permanently bronze, muted at rest
//   (bg-accent/55, text-accent/70) and strengthening to full bronze on
//   activation — still a visibly distinct "active" state even though the
//   resting colour is already bronze.
// Each `<li>` is a `tabIndex={0}` focus target purely so keyboard users get
// the same graph-highlight affordance as a mouse hover — a deliberate
// exception to leaving static content unfocusable, not an oversight.
export function MilestoneList({ milestones }: MilestoneListProps) {
  const switchIndex = milestones.findIndex((m) => m.isSwitch);

  return (
    <div className="relative h-full max-w-md lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-0.75 w-px bg-ink/16"
      />
      <div
        aria-hidden="true"
        data-timeline-fill
        className="absolute top-1 left-0.75 h-0 w-px bg-accent transition-[height] duration-300 ease-out"
      />
      <ol
        aria-label={`Career timeline, ${milestones[0]?.year} to ${milestones[milestones.length - 1]?.year}`}
        className="flex flex-col gap-14 pl-10"
      >
        {milestones.map((milestone, index) => {
          const isPostSwitch = switchIndex !== -1 && index >= switchIndex;
          return (
            <li
              key={milestone.year}
              data-timeline-item
              tabIndex={0}
              className="group relative outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {/* Paper wash: not a background, a suggestion of warm light
                  behind the active chapter's text — 2-4% accent opacity,
                  a soft radial fading fully to transparent, plus a blur
                  pass so there is no edge at all to spot. First child (so
                  it paints under everything else) and reads
                  var(--color-accent) directly, which is already a lighter,
                  less saturated bronze in dark mode (globals.css) rather
                  than needing a separate dark-mode rule of its own.
                  Smaller radius below `md` (~96px vs ~130px) — the same
                  treatment, just proportioned to the narrower mobile
                  column rather than the wider desktop one; this is also
                  the one milestone-list.tsx element with a breakpoint
                  variant, since every group-data-active rule elsewhere is
                  unconditional (mobile scroll and desktop hover/focus
                  resolve to the same styling through the same activeIndex,
                  by construction, not by duplicating a class set). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-10 left-12 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-accent/4 to-transparent opacity-0 blur-xl transition-opacity duration-500 ease-out group-data-active:opacity-100 motion-reduce:transition-none md:h-65 md:w-65"
              />
              <span
                aria-hidden="true"
                className="absolute -left-10 top-1.5 flex h-2 w-2 items-center justify-center"
              >
                {/* Local rail emphasis: a short vertical bar centred on the
                    same point as the marker, invisible at rest and fading
                    in on activation — the marker reads as anchored to the
                    rail rather than floating on it. Deliberately scoped to
                    this milestone's own marker position, not a shared
                    element positioned via JS measurement (a global,
                    per-milestone-position "seam" was tried and reverted
                    earlier in this timeline's history). */}
                <span
                  className={`absolute h-8 w-0.5 opacity-0 transition-opacity duration-300 ease-out group-data-active:opacity-100 motion-reduce:transition-none ${
                    isPostSwitch ? "bg-accent/45" : "bg-ink/45"
                  }`}
                />
                {/* Same two-layer family as the graph's active point
                    (JourneyCanvas): a solid core outlined in the page
                    background (ring-ivory, echoing the canvas's bgColor
                    stroke) plus a soft blurred bloom behind it — just at
                    timeline scale, so growth here is a precise transform
                    (scale-[1.12], ~12%) rather than the graph's larger
                    radius jump. Ink for the pre-2025 palette, bronze for
                    2025/2026, matching each group's own active colour. */}
                <span
                  className={`absolute h-2 w-2 scale-0 rounded-full opacity-0 blur-[3px] transition-[transform,opacity] duration-300 ease-out group-data-active:scale-[2.2] group-data-active:opacity-25 motion-reduce:transition-none ${
                    isPostSwitch ? "bg-accent" : "bg-ink"
                  }`}
                />
                <span
                  className={`relative h-2 w-2 rounded-full ring-2 ring-ivory transition-all duration-300 ease-out group-data-active:scale-[1.12] motion-reduce:transition-none ${
                    isPostSwitch
                      ? "bg-accent/55 group-data-active:bg-accent"
                      : "bg-ink/35 group-data-active:bg-ink"
                  }`}
                />
              </span>
              {/* Very short hairline bridging marker and text — extends
                  from just past the marker toward the content, stopping
                  well short of it (it's a connector, not a divider).
                  scale-x from a left origin so it visibly grows outward
                  from the marker on activation rather than just fading in
                  place. Reconsider/remove if it reads as clutter rather
                  than connective tissue once seen live. */}
              <span
                aria-hidden="true"
                className={`absolute -left-8 top-2.5 h-px w-5 origin-left scale-x-0 opacity-0 transition-[transform,opacity] duration-300 ease-out group-data-active:scale-x-100 group-data-active:opacity-100 motion-reduce:transition-none ${
                  isPostSwitch ? "bg-accent/25" : "bg-ink/20"
                }`}
              />
              <p
                className={`font-mono flex gap-2 text-meta transition-colors duration-300 group-data-active:font-extrabold ${
                  isPostSwitch
                    ? "text-accent/70 group-data-active:text-accent"
                    : "text-ink/50 group-data-active:text-ink"
                }`}
              >
                {milestone.year}<span className={`uppercase ${milestone.isSwitch ? "block": "hidden"}`}>- the switch</span>
              </p>
              {/* Bronze on activation is deliberately scoped to the headline
                  alone — the subtitle below stays in the ink family even
                  when active, so the chapter title is the one thing that
                  reads as "current." Resting opacity is deliberately quieter
                  (ink/45, not /60) — the active headline gets its presence
                  from contrast against duller siblings, not from getting
                  louder itself; font-bold is one step up from the resting
                  font-semibold, a subtle weight bump rather than a jump to
                  extrabold. */}
              <p className="mt-3 max-w-lg font-sans font-semibold tracking-tight text-ink/45 transition-[color,font-weight] duration-300 md:text-2xl group-data-active:font-bold group-data-active:text-ink">
                {milestone.headline}
              </p>
              {/* The factual role/title — hidden at rest so the resting
                  timeline is just year + headline, revealed underneath the
                  headline once this item is active. Stays in the neutral ink
                  family even when active (never bronze): supporting context
                  for the headline, not a second one.
                  grid-rows-[0fr] -> [1fr] on the wrapper animates height
                  smoothly without measuring/animating an explicit px value;
                  padding (not margin) carries the gap from the headline so
                  nothing peeks out of the overflow-hidden clip while
                  collapsed. */}
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-data-active:grid-rows-[1fr] motion-reduce:transition-none">
                <div className="overflow-hidden">
                  <p className="max-w-lg translate-y-1 pt-1.5 font-sans text-body text-ink/60 opacity-0 transition-[opacity,transform] duration-200 ease-out group-data-active:translate-y-0 group-data-active:opacity-100 motion-reduce:transition-none">
                    {milestone.subtitle}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
