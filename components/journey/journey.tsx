import { journeyMilestones } from "@/lib/content/journey";
import { MilestoneList } from "./milestone-list";
import { JourneyCanvasLoader } from "./journey-canvas-loader";
import { TimelineActivator } from "./timeline-activator";

export function Journey() {
  const firstYear = journeyMilestones[0]?.year;
  const lastYear = journeyMilestones[journeyMilestones.length - 1]?.year;

  return (
    <section className="relative border-t border-ink/16 bg-ivory px-7 py-28 md:py-36 h-full">
      <div className="mx-auto flex max-w-350 flex-col">
        <div className="max-w-[76ch]">
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
