import Link from "next/link";
import type { Project } from "@/lib/content/projects";
import { TechCredit } from "../tech-credit";
import { ProjectImage } from "./project-image";

export function ProjectCard({
  project,
  variant = "compact",
}: {
  project: Project;
  variant?: "featured" | "compact";
}) {
  const featured = variant === "featured";

  return (
    <Link
      href={`/work/${project.slug}`}
      // -mx/px cancel out visually — they exist only to give the
      // hover/focus tint (bg-accent/3) room around the content instead of
      // hugging it, so the whole card reads as one hoverable unit.
      className={`group -mx-4 px-4 transition-colors duration-300 ease-out hover:bg-accent/3 focus-visible:bg-accent/3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none md:-mx-6 md:px-6 ${
        featured
          ? "-my-3 flex h-full flex-col py-3 md:-my-4 md:py-4"
          : "block py-12 first:pt-0 last:pb-0"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-meta text-accent">
          {String(project.order).padStart(2, "0")}
        </span>
        <TechCredit stack={project.stack} />
      </div>
      <h3
        className={`font-bold text-ink transition-colors duration-200 group-hover:text-accent ${
          featured ? "mt-5 text-2xl md:text-3xl" : "mt-3 text-lg"
        }`}
      >
        {project.title}
      </h3>
      <p
        className={`text-ink/70 ${
          featured ? "mt-3 max-w-lg text-body" : "mt-1 max-w-sm text-body"
        }`}
      >
        {project.oneLiner}
      </p>
      {featured && project.detail ? (
        <p className="mt-4 max-w-lg text-body text-ink/55">{project.detail}</p>
      ) : null}
      <div
        className={`relative overflow-hidden border border-ink/16 ${
          featured ? "mt-8 aspect-16/10" : "mt-4 aspect-5/2"
        }`}
      >
        <ProjectImage project={project} variant={variant} />
      </div>
      {/* mt-auto (card is flex-col + h-full, stretched by the parent grid)
          floats this footer to the bottom of whatever height the row ends
          up being, so the featured panel balances the supporting column's
          height without hardcoded spacing. pt-8 is the floor when there's
          no slack to absorb. */}
      {featured && project.featuredTags && project.featuredTags.length > 1 ? (
        <div className="mt-auto pt-8 font-mono text-meta uppercase tracking-widest">
          <span className="text-ink/70">{project.featuredTags[0]}</span>
          <div className="mt-2 flex flex-col gap-1">
            {project.featuredTags.slice(1).map((tag) => (
              <span key={tag} className="text-ink/55">
                {tag}
              </span>
            ))}
          </div>
          <span className="mt-5 inline-block border-b border-transparent pb-0.5 font-semibold text-ink transition-[color,border-color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:border-accent group-hover:text-accent motion-reduce:transition-none">
            View case study →
          </span>
        </div>
      ) : null}
    </Link>
  );
}
