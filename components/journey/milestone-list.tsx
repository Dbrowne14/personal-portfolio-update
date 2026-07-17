import type { Milestone } from "@/lib/content/journey";

interface MilestoneListProps {
  milestones: Milestone[];
}

// Server Component. The single accessible source for every milestone,
// regardless of viewport — JourneyCanvas is a decorative, aria-hidden
// duplicate of this, not the other way around. Visually clipped (Tailwind's
// sr-only, not display:none) when JourneyCanvas will mount — desktop-width
// viewport with a fine pointer — and visually promoted to a real vertical
// timeline otherwise. The two conditions are written identically (min-width
// 768px, matching Header's md breakpoint, and pointer: fine) so this and
// JourneyCanvasLoader's own JS capability check can never disagree about
// which one is the visible content for a given visitor.
//
// The fill line and each item's data-timeline-item/[data-active] styling
// are inert markup by default — real content and correct appearance with
// zero JavaScript. TimelineActivator (client), which wraps this component
// in journey.tsx, is what actually moves the fill and toggles the active
// state as the visitor scrolls; without it mounting, this renders as a
// plain static timeline, not a broken one.
export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <div className="relative [@media(min-width:768px)_and_(pointer:fine)]:sr-only">
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-0.75 w-px bg-ivory/20"
      />
      <div
        aria-hidden="true"
        data-timeline-fill
        className="absolute top-1 left-0.75 h-0 w-px bg-plate-accent transition-[height] duration-300 ease-out"
      />
      <ol
        aria-label={`Career timeline, ${milestones[0]?.year} to ${milestones[milestones.length - 1]?.year}`}
        className="flex flex-col gap-10 pl-8"
      >
        {milestones.map((milestone) => (
          <li
            key={milestone.year}
            data-timeline-item
            className="group relative"
          >
            <span
              aria-hidden="true"
              className={`absolute top-1.5 -left-8 h-1.5 w-1.5 rounded-full transition-all duration-300 group-data-active:h-2.5 group-data-active:w-2.5 ${
                milestone.isSwitch || milestone.era === "engineering"
                  ? "bg-plate-accent"
                  : "bg-ivory/60 group-data-active:bg-plate-accent"
              }`}
            />
            <p className="font-mono text-meta text-ivory/50 transition-colors duration-300 group-data-active:text-ivory">
              {milestone.year}
              {milestone.isSwitch ? " — the switch" : ""}
            </p>
            <p className="mt-1 font-sans text-body text-ivory">
              {milestone.label}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
