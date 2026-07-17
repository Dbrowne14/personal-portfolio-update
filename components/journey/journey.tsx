import { journeyMilestones } from "@/lib/content/journey";
import { MilestoneList } from "./milestone-list";
import { JourneyCanvasLoader } from "./journey-canvas-loader";
import { TimelineActivator } from "./timeline-activator";

// Server Component. The signature interaction (01-vision.md, Act II): the
// site's one full-bleed colour plate, reserved for this section alone.
// Real, server-rendered text throughout — only JourneyCanvasLoader (and,
// conditionally, JourneyCanvas beneath it) is client-side, and it receives
// the milestone data as a prop rather than owning it.
export function Journey() {
  const firstYear = journeyMilestones[0]?.year;
  const lastYear = journeyMilestones[journeyMilestones.length - 1]?.year;

  return (
    <section className="relative min-h-screen bg-ink px-7 pt-24 pb-16 md:pt-28">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-350 flex-col">
        <div className="max-w-xl">
          <p className="font-mono text-meta text-plate-accent uppercase tracking-[0.14em]">
            The journey · {firstYear}–{lastYear}
          </p>
          <h2 className="mt-4 text-h2 font-bold text-ivory text-balance">
            From evaluating products to shipping them.
          </h2>
        </div>

        <div className="relative mt-12 min-h-105 flex-1 md:mt-16 md:min-h-120">
          <TimelineActivator>
            <MilestoneList milestones={journeyMilestones} />
          </TimelineActivator>
          <JourneyCanvasLoader milestones={journeyMilestones} />
        </div>
      </div>
    </section>
  );
}
