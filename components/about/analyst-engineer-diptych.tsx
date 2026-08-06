import Image from "next/image";

// Server Component — no interaction beyond the existing site-wide
// .reveal-on-scroll (scroll-linked, respects prefers-reduced-motion
// globally already). Deliberately not HalftonePortrait: this section
// isn't a second signature interaction, just a quieter supporting reveal.
// No portrait photograph exists in the repo yet — src stays undefined,
// same discipline as DecisionIntro's own portrait note, rather than
// pointing at a placeholder path.
const PORTRAIT_SRC: string | undefined = undefined;

const ANALYST = {
  range: "2017 — 2025",
  title: "The Analyst",
  copy: "Priced the companies. Modelled the businesses. Sat across the table from the people building the thing.",
};

const ENGINEER = {
  range: "2025 — NOW",
  title: "The Engineer",
  copy: "Now I build the thing. Same judgment — what's worth building — pointed at code instead of deals.",
};

// One shared set of DOM nodes for both breakpoints — grid-cols-1 on mobile
// stacks the three items (Analyst block, portrait, Engineer block) in DOM
// order; lg:grid-cols-[1fr_auto_1fr] auto-places the same three items into
// columns left to right. No duplicated copy, no second layout branch.
export function AnalystEngineerDiptych() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col border-t border-ink/16 bg-ivory px-7 py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-350 flex-1 flex-col">
        {/* flex-1 is what actually gives this the drama: the rule and the
            portrait span this row's real height, not just a compact block
            floating in a tall, mostly-empty section. Text stays pinned to
            the top (place-content-start) rather than centred with it —
            the portrait is the only thing centred on the full span, via
            its own absolute positioning below, decoupled from row height. */}
        <div className="relative grid flex-1 grid-cols-1 place-content-center gap-y-14 lg:grid-cols-[1fr_13rem_1fr] lg:place-content-start lg:gap-x-12 lg:pt-16 xl:gap-x-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/16"
          />

          <div className="reveal-on-scroll mr-auto max-w-[85%] lg:col-start-1 lg:mr-0 lg:max-w-none">
            <p className="font-mono text-meta text-ink/50 uppercase tracking-[0.14em]">
              {ANALYST.range}
            </p>
            <h2 className="mt-4 text-h1 font-bold text-balance text-ink/55">
              {ANALYST.title}
            </h2>
            <p className="mt-8 max-w-sm text-body text-ink/60">
              {ANALYST.copy}
            </p>
          </div>

          {/* In flow (centred by place-content-center) on mobile, same as
              Analyst/Engineer; absolutely positioned at lg: so it centres
              on the row's full flex-1 height instead of its own short
              auto height — that's what makes it the hinge of the whole
              span, not just of the text blocks either side of it. */}
          <div className="reveal-on-scroll relative z-10 mx-auto [animation-delay:150ms] lg:absolute lg:top-1/2 lg:left-1/2 lg:mx-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <div className="relative h-40 w-40 overflow-hidden rounded-full border border-ink/16 bg-ivory sm:h-48 sm:w-48">
              {PORTRAIT_SRC ? (
                <Image
                  src={PORTRAIT_SRC}
                  alt="Portrait of David Browne"
                  fill
                  sizes="(min-width: 640px) 12rem, 10rem"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]">
                  <span className="bg-ivory px-2 py-1 text-center font-mono text-meta text-ink/62 uppercase tracking-[0.08em]">
                    Portrait
                    <br />
                    to follow
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="reveal-on-scroll ml-auto max-w-[85%] text-right [animation-delay:300ms] lg:col-start-3 lg:ml-0 lg:max-w-none">
            <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
              {ENGINEER.range}
            </p>
            <h2 className="mt-4 text-h1 font-bold text-balance text-ink">
              {ENGINEER.title}
            </h2>
            <p className="mt-8 ml-auto max-w-sm text-body text-ink/70">
              {ENGINEER.copy}
            </p>
          </div>
        </div>

        <div className="reveal-on-scroll border-t border-ink/16 pt-10 pb-6 text-center">
          <p className="text-2xl font-bold text-ink md:text-3xl">
            Both halves compound.
          </p>
        </div>
      </div>
    </section>
  );
}
