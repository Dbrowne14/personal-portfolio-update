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
// zero JavaScript. TimelineActivator (client), which wraps this component
// in journey.tsx, is what actually moves the fill and toggles the active
// state as the visitor scrolls, and (at `md` and up, where the chart
// exists) dispatches the hover/focus event JourneyCanvas listens for to
// glow the matching point on the graph. Without it mounting, this renders
// as a plain static timeline, not a broken one.
//
// Each `<li>` is a `tabIndex={0}` focus target purely so keyboard users get
// the same graph-highlight affordance as a mouse hover — a deliberate
// exception to leaving static content unfocusable, not an oversight.
export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <div className="relative max-w-md lg:max-w-none">
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
        {milestones.map((milestone) => (
          <li
            key={milestone.year}
            data-timeline-item
            tabIndex={0}
            className="group relative outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span
              aria-hidden="true"
              className={`absolute top-1.5 -left-10 h-2 w-2 rounded-full transition-all duration-300 group-data-active:h-3 group-data-active:w-3 ${
                milestone.isSwitch || milestone.era === "engineering"
                  ? "bg-accent"
                  : "bg-ink/35 group-data-active:bg-accent"
              }`}
            />
            <p className="font-mono text-meta text-ink/50 transition-colors duration-300 group-data-active:text-ink">
              {milestone.year}
              {milestone.isSwitch ? " — the switch" : ""}
            </p>
            <p className="mt-2 max-w-lg font-sans text-body text-ink/70 transition-colors duration-300 group-data-active:text-ink">
              {milestone.label}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
