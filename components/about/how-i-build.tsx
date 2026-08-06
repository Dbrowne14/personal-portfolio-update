import { InPracticeToggle } from "./in-practice-toggle";

interface Principle {
  headline: string;
  body: string;
  inPractice: string;
}

// Every "in practice" claim below is traceable to something real elsewhere
// in this codebase or in lib/content/projects.ts — not invented specifics.
// Server Components, the shared `projects` schema and the client-boundary
// discipline are this site's own architecture (verifiable throughout
// components/); the Sanity CMS / editor-ownership claims are Default
// Social's own established highlights, not new claims made up for this
// section.
const PRINCIPLES: Principle[] = [
  {
    headline: "Features are investments.",
    body: "Every feature I ship carries a cost that outlasts the sprint it was built in — someone has to read it, extend it, and eventually explain it to somebody else. I try to price that in before I write the first line, not after.",
    inPractice:
      "On Default Social, that meant a shared Sanity content model instead of a bespoke API route for every page — less surface area to maintain, and content changes that don't need a redeploy. On this site, it's one typed project schema driving the homepage, the work index and every case study, rather than three copies of the same data slowly drifting apart.",
  },
  {
    headline: "Performance changes behaviour.",
    body: "A slow interface doesn't just feel bad — it changes what people do. They stop scrolling, stop reading, stop trusting the thing enough to finish the form. I treat performance as a UX decision, not a scorecard to chase after the fact.",
    inPractice:
      "This site respects prefers-reduced-motion everywhere motion appears, rather than assuming everyone wants it. Images are served through next/image with real responsive sizes instead of one oversized file for every viewport, and interactivity is kept to the smallest client boundary it can be — the Work page's accordion, for instance, is the only thing on that entire page that ships JavaScript at all.",
  },
  {
    headline: "Software should survive its author.",
    body: "Clever code that only makes sense to the person who wrote it is a liability, not a flex. I'd rather write something a stranger — or me, in six months — can pick up without an explanation.",
    inPractice:
      "TypeScript runs in strict mode across the whole codebase. Components are organised by domain rather than by type, and a small set of shared primitives — a typed content schema, one link component, a consistent Server/Client boundary — get reused rather than reinvented section by section.",
  },
  {
    headline: "Technology should empower the people using it.",
    body: "The best technical decision is sometimes the one that gets me out of the way entirely. If a client needs a developer every time they want to change a sentence, I've built them a dependency, not a product.",
    inPractice:
      "Default Social runs on a Sanity Studio content model built around reusable blocks rather than hard-coded page templates — the client edits and publishes pages directly, with no deploy and no call to me in the loop.",
  },
];

// Server Component. Deliberately not four identical boxed accordion rows:
// a persistent mono numeral per principle is the whole visual device —
// hierarchy, spacing and a thin rule between entries carry the rhythm,
// nothing else. InPracticeToggle is the only client piece, used four times.
export const HowIBuild = () => {
  return (
    <section className="border-t border-ink/16 bg-ivory px-7 py-24 md:py-28">
      <div className="mx-auto max-w-350">
        <div>
          <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
            Chapter 01
          </p>
          <p className="mt-1 font-mono text-meta text-ink/50 uppercase tracking-[0.14em]">
            How I build
          </p>
          <h2 className="mt-4 text-h1 max-w-2xl font-bold text-balance text-ink">
            Where the two halves actually meet.
          </h2>
          <div className="mt-6 max-w-[100ch] text-body text-ink/70 space-y-2">
            <p>
              For eight years, I advised technology companies from the other
              side of the table — modelling their businesses and sitting across
              from the founders and teams actually building the products I was
              pricing. By 2022 I’d reached VP, advising purely on technology
              deals. The closer I got, the less advising on it felt like enough.
            </p>
            <p>
              So I learned to build. In 2025 I made the switch to engineering —
              properly, not as a side project. What carried over from banking
              wasn&rsquo;t the finance, but the judgment: how to scope
              what&rsquo;s actually worth building, and how to treat a product
              like it has to earn its keep.
            </p>
          </div>
        </div>

        <ol className="mt-16 border-t border-ink/16 md:mt-20">
          {PRINCIPLES.map((principle, i) => (
            <li
              key={principle.headline}
              className="grid grid-cols-[3rem_1fr] gap-x-6 border-b last:border-none border-ink/16 py-12 md:grid-cols-[4rem_1fr] md:gap-x-10 md:py-16"
            >
              <span
                aria-hidden="true"
                className="font-mono text-h2 text-accent"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-h2 font-bold text-balance text-ink">
                  {principle.headline}
                </h3>
                <p className="mt-4 max-w-xl text-body text-ink/70">
                  {principle.body}
                </p>
                <InPracticeToggle>{principle.inPractice}</InPracticeToggle>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
