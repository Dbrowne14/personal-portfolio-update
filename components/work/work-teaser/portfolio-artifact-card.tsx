import type { Project } from "@/lib/content/projects";
import { TechCredit } from "../tech-credit";
import { ArtifactLink } from "../artifact-link";

// No thumbnail (the visitor is already on the site) and two independent
// destinations (case study, public repo), so unlike ProjectCard this isn't
// wrapped in one outer <Link> — each action needs its own click target.
export const PortfolioArtifactCard = ({ project }: { project: Project }) => {
  return (
    <div className="first:pt-0 mt-4  bg-none lg:mt-none bg-accent/3 p-4 border border-accent/16 lg:mt-none">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-meta text-accent">
          {String(project.order).padStart(2, "0")}
        </span>
        <TechCredit stack={project.stack} />
      </div>
      <h3 className="mt-3 text-lg font-bold text-ink">{project.title}</h3>
      <div className="flex justify-between items-center pt-1">
        <p className="max-w-sm text-body text-ink/70">{project.oneLiner}</p>
        <p className="block font-mono text-meta text-accent uppercase tracking-[0.14em]">
          CURRENT SITE
        </p>
      </div>

      <div className="mt-3 pt-2 flex border-t border-ink/30 items-center gap-8 font-mono text-meta font-semibold uppercase tracking-widest text-ink">
        <ArtifactLink href={`/work#${project.slug}`}>Case study</ArtifactLink>
        {project.links?.map((link) => (
          <ArtifactLink key={link.href} href={link.href} external>
            {link.label}
          </ArtifactLink>
        ))}
      </div>
    </div>
  );
};
