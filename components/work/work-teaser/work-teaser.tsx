import Link from "next/link";
import { projects } from "@/lib/content/projects";
import { ProjectCard } from "./project-card";
import { PortfolioArtifactCard } from "./portfolio-artifact-card";

// Asymmetric pairing, not a uniform grid: the flagship as a large editorial
// feature on the left (lg:grid-cols-[5fr_3fr]), the supporting projects
// stacked as a compact index on the right. Homepage role/order come from
// lib/content/projects.ts — this file only composes and lays out.
export const WorkTeaser = () => {
  const flagship = projects.find(
    (project) => project.homepageRole === "flagship",
  );
  const supporting = projects
    .filter((project) => project.homepageRole === "supporting")
    .sort((a, b) => a.order - b.order);

  return (
    <section className=" bg-ivory px-7 py-24 md:py-28">
      <div className="mx-auto max-w-350">
        <div className="flex flex-col gap-8 pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:pb-6">
          <div>
            <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
              The work · Selected projects
            </p>
            <h2 className="mt-4 text-h2 font-bold text-ink">Selected work</h2>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <span className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
              01 — Work
            </span>
            <Link
              href="/work"
              className="group inline-flex items-baseline gap-1.5 font-mono text-meta font-bold text-ink uppercase tracking-widest transition-colors duration-200 hover:text-accent focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-accent">
                All projects
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[5fr_3fr] lg:items-stretch lg:gap-14 pt-4 sm:pt-8 border-t border-accent/20 sm:border-none">
          {flagship ? (
            <ProjectCard project={flagship} variant="featured" />
          ) : null}

          {supporting.length > 0 ? (
            <div className="flex flex-col lg:pl-12 ">
              {supporting.map((project) =>
                project.slug === "this-portfolio" ? (
                  <PortfolioArtifactCard key={project.slug} project={project} />
                ) : (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    variant="compact"
                  />
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
