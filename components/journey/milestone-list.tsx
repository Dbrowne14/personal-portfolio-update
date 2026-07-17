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
export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <div className="relative [@media(min-width:768px)_and_(pointer:fine)]:sr-only">
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-[3px] w-px bg-ivory/20"
      />
      <ol
        aria-label={`Career timeline, ${milestones[0]?.year} to ${milestones[milestones.length - 1]?.year}`}
        className="flex flex-col gap-10 pl-8"
      >
        {milestones.map((milestone) => (
          <li key={milestone.year} className="relative">
            <span
              aria-hidden="true"
              className={`absolute top-1.5 -left-8 h-1.5 w-1.5 rounded-full ${
                milestone.isSwitch || milestone.era === "engineering"
                  ? "bg-plate-accent"
                  : "bg-ivory/60"
              }`}
            />
            <p className="font-mono text-meta text-ivory/50">
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
