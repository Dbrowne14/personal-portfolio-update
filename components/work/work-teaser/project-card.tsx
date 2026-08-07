import Link from "next/link";
import type { Project } from "@/lib/content/projects";
import { TechCredit } from "../tech-credit";
import { ProjectImage } from "./project-image";

export const ProjectCard = ({
  project,
  variant = "compact",
}: {
  project: Project;
  variant?: "featured" | "compact";
}) => {
  const featured = variant === "featured";
  const isFlagship = project.homepageRole === "flagship";

  if (featured && isFlagship) {
    return <FeaturedProjectCard project={project} />;
  }

  return <CompactProjectCard project={project} />;
};

function FeaturedProjectCard({ project }: { project: Project }) {
  const liveSite = project.links?.[0]?.href;
  const PREVIEW_SCALE = 0.6;
  const PREVIEW_SIZE = `${100 / PREVIEW_SCALE}%`;

  return (
    <article className="-my-3 flex h-full flex-col py-3 md:-my-4 md:py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-meta text-accent">
          {String(project.order).padStart(2, "0")}
        </span>

        <TechCredit stack={project.stack} />
      </div>

      <h3 className="mt-5 text-2xl font-bold text-ink md:text-3xl">
        {project.title}
      </h3>

      <p className="mt-3 max-w-lg text-body text-ink/70">{project.oneLiner}</p>

      {project.detail ? (
        <p className="mt-4 max-w-lg text-body text-ink/55">{project.detail}</p>
      ) : null}

      <div className="relative mt-8 aspect-16/10 overflow-hidden border border-ink/16">
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            transform: `scale(${PREVIEW_SCALE})`,
          }}
        >
          <iframe
            src={liveSite}
            title={`${project.title} live preview`}
            loading="lazy"
            className="h-full w-full border-0"
          />
        </div>
      </div>

      {project.featuredTags && project.featuredTags.length > 1 ? (
        <div className="mt-auto pt-8 font-mono text-meta uppercase tracking-widest">
          <span className="text-ink/70">{project.featuredTags[0]}</span>

          <div className="mt-2 flex flex-col gap-1">
            {project.featuredTags.slice(1).map((tag) => (
              <span key={tag} className="text-ink/55">
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/work#${project.slug}`}
            className="
              group mt-5 inline-flex items-baseline gap-1.5
              font-semibold text-ink
              transition-colors duration-200
              hover:text-accent
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-accent
            "
          >
            <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-accent">
              View case study
            </span>

            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function CompactProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work#${project.slug}`}
      className="
        group -mx-4 block px-4 py-12
        transition-colors duration-300 ease-out
        first:pt-0 last:pb-0
        hover:bg-accent/3
        focus-visible:bg-accent/3
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-accent
        motion-reduce:transition-none
        md:-mx-6 md:px-6
      "
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-meta text-accent">
          {String(project.order).padStart(2, "0")}
        </span>

        <TechCredit stack={project.stack} />
      </div>

      <h3 className="mt-3 text-lg font-bold text-ink transition-colors duration-200 group-hover:text-accent">
        {project.title}
      </h3>

      <p className="mt-1 max-w-sm text-body text-ink/70">{project.oneLiner}</p>

      <div className="relative mt-4 aspect-5/2 overflow-hidden border border-ink/16">
        <ProjectImage project={project} variant="compact" />
      </div>
    </Link>
  );
}
