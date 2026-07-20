import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content/projects";
import { TechCredit } from "./tech-credit";

// Server Component. No image asset exists for any project yet — the
// hairline placeholder (same pattern as WorkTeaser's, M4) stands in until
// real screenshots exist, rather than a fake path or a broken image.
export function CaseStudyHero({ project }: { project: Project }) {
  return (
    <section className="reveal-on-scroll border-t border-ink/16 bg-ivory px-7 pt-24 pb-12 md:pt-28">
      <div className="mx-auto max-w-350">
        <Link
          href="/work"
          className="font-mono text-meta text-ink/45 uppercase tracking-[0.1em] transition-colors duration-200 hover:text-accent"
        >
          ← All work
        </Link>

        <h1 className="mt-6 text-h1 font-bold text-ink text-balance">
          {project.title}
        </h1>
        <p className="mt-4 max-w-xl text-body text-ink/70">
          {project.oneLiner}
        </p>
        <div className="mt-4">
          {project.confidential ? (
            <p className="font-mono text-meta text-ink/45 uppercase tracking-[0.08em]">
              NDA
            </p>
          ) : (
            <TechCredit stack={project.stack} />
          )}
        </div>

        <div className="relative mt-10 aspect-16/9 w-full overflow-hidden border border-ink/16">
          {project.heroImage ? (
            <Image
              src={project.heroImage.src}
              alt={project.heroImage.alt}
              fill
              priority
              sizes="(min-width: 1400px) 1350px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]">
              <span className="bg-ivory px-3 py-1.5 font-mono text-meta text-ink/45 uppercase tracking-[0.1em]">
                {project.confidential
                  ? "Under NDA — no imagery"
                  : "Case study imagery to follow"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
