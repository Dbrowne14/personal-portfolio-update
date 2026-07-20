import { HeroStage } from "./hero-stage";
import { MagneticLetters } from "./magnetic-letters";

// Server Component. Every word here is real, server-rendered text; only
// HeroStage (scroll-compress) and MagneticLetters (cursor physics) are
// client-side, and both receive this content as children/props rather than
// owning it — see 02-architecture.md.
export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-7 pb-10">
      <HeroStage>
        <p className="mb-6 font-mono text-meta uppercase tracking-[0.14em] text-accent">
          Full-stack product engineer · London
        </p>

        <h1 aria-label="David Browne" className="flex flex-col items-center">
          <MagneticLetters
            lines={[
              { text: "DAVID", variant: "solid" },
              { text: "BROWNE", variant: "outline" },
            ]}
          />
        </h1>

        <p className="mt-8 max-w-md text-center font-mono text-meta uppercase tracking-[0.04em] text-ink/62">
          From evaluating products to shipping them.
        </p>
      </HeroStage>

      <div className="absolute inset-x-7 bottom-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center font-mono text-meta text-ink/62 sm:justify-between sm:text-left">
        <span>TypeScript · React · Next.js · Node · PostgreSQL</span>
        <span aria-hidden="true" className="hidden sm:inline">
          Scroll ↓
        </span>
      </div>
    </section>
  );
}
