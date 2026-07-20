import { journeyMilestones } from "@/lib/content/journey";
import { HalftonePortrait } from "./halftone-portrait";

// Server Component. Act III (01-vision.md): the chart already stated what
// happened; this states why. The site's only moment of interiority — a
// human voice, first person, arguing rather than declaring — so register
// stays quiet and reading-scale throughout, a release after the Journey
// plate's intensity rather than a second loud moment.
//
// HalftonePortrait is the only Client Component this page needs; it
// receives its content as props rather than owning it. No portrait
// photograph exists yet (see that component's own note) — src is
// deliberately omitted here rather than pointed at a placeholder path.
export function DecisionIntro() {
  const first = journeyMilestones[0];
  const last = journeyMilestones[journeyMilestones.length - 1];
  const credentialLine = `${first.year} — ${first.label} → ${last.year} — ${last.label}`;

  return (
    <section className="border-t border-ink/16 bg-ivory px-7 py-24 md:py-28">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-16 md:grid-cols-[3fr_2fr] md:items-start md:gap-20">
        <div className="reveal-on-scroll max-w-xl">
          <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
            The decision
          </p>
          <h1 className="mt-4 text-h1 font-bold text-ink text-balance">
            I wanted to understand how the products I was valuing were
            actually built.
          </h1>
          <div className="mt-8 flex flex-col gap-5 text-body text-ink/70">
            <p>
              For eight years, I advised technology companies from the other
              side of the table — modelling their businesses and sitting
              across from the founders and teams actually building the
              products I was pricing. By 2022 I&rsquo;d reached VP, advising
              purely on technology deals. The closer I got, the less
              advising on it felt like enough.
            </p>
            <p>
              So I learned to build. In 2025 I made the switch to
              engineering — properly, not as a side project. What carried
              over from banking wasn&rsquo;t the finance, but the judgment:
              how to scope what&rsquo;s actually worth building, and how to
              treat a product like it has to earn its keep.
            </p>
          </div>
          <p className="mt-8 font-mono text-meta text-ink/45 uppercase tracking-[0.08em]">
            {credentialLine}
          </p>
        </div>

        <div className="reveal-on-scroll">
          <HalftonePortrait alt="Portrait of David Browne" />
        </div>
      </div>
    </section>
  );
}
