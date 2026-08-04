import { journeyMilestones } from "@/lib/content/journey";
import { MilestoneList } from "./milestone-list";
import { JourneyInteraction } from "./journey-interaction";

export function Journey() {
  const firstYear = journeyMilestones[0]?.year;
  const lastYear = journeyMilestones[journeyMilestones.length - 1]?.year;

  return (
    <section className="relative border-t border-ink/16 bg-ivory px-7 py-28 md:py-36 h-full">
      <div className="mx-auto flex max-w-350 flex-col">
        <div className="max-w-[96ch]">
          <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
            The journey · {firstYear}–{lastYear}
          </p>
          <h2 className="mt-4 text-h2 font-bold text-ink text-balance">
            From evaluating products to shipping them.
          </h2>
        </div>

        <div className="mt-16 md:mt-20">
          <JourneyInteraction milestones={journeyMilestones}>
            <MilestoneList milestones={journeyMilestones} />
          </JourneyInteraction>
        </div>
      </div>
    </section>
  );
}
