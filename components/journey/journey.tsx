import { journeyMilestones } from "@/lib/content/journey";
import { MilestoneList } from "./milestone-list";
import { JourneyCanvasLoader } from "./journey-canvas-loader";
import { TimelineActivator } from "./timeline-activator";

// Server Component. The site's one signature interaction (01-vision.md, Act
// II; ADR-013), built on the same ivory canvas as every other section — its
// weight comes from typographic hierarchy, whitespace, and the chart's own
// motion, not from a unique background. Real, server-rendered text
// throughout — only JourneyCanvasLoader (and, conditionally, JourneyCanvas
// beneath it) is client-side, and it receives the milestone data as a prop
// rather than owning it.
//
// The grid below is the site's primary responsive pattern for this section:
// single column below `md` (timeline only — JourneyCanvasLoader renders
// nothing, so the second cell collapses to zero height), both stacked
// between `md` and `lg` (chart reduced via `md:h-80`), and a permanent
// two-column composition at `lg` and up (timeline left, chart right, same
// row). The timeline is never a fallback the chart hides — it's always the
// visible, accessible content; the chart is its visual counterpart.
export function Journey() {
  const firstYear = journeyMilestones[0]?.year;
  const lastYear = journeyMilestones[journeyMilestones.length - 1]?.year;

  return (
    <section className="relative border-t border-ink/16 bg-ivory px-7 py-28 md:py-36">
      <div className="mx-auto flex max-w-350 flex-col">
        <div className="max-w-xl">
          <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
            The journey · {firstYear}–{lastYear}
          </p>
          <h2 className="mt-4 text-h2 font-bold text-ink text-balance">
            From evaluating products to shipping them.
          </h2>
        </div>

        <div className="mt-16 md:mt-20">
          <div className="grid grid-cols-1 gap-0 md:gap-16 lg:grid-cols-[minmax(24rem,2fr)_3fr] lg:gap-20">
            <TimelineActivator>
              <MilestoneList milestones={journeyMilestones} />
            </TimelineActivator>
            <div className="relative md:h-80 lg:h-auto lg:min-h-120">
              <JourneyCanvasLoader milestones={journeyMilestones} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
