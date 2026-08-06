import Link from "next/link";
import type { Project } from "@/lib/content/projects";
import { TechCredit } from "../tech-credit";

// No thumbnail (the visitor is already on the site) and two independent
// destinations (case study, public repo), so unlike ProjectCard this isn't
// wrapped in one outer <Link> — each action needs its own click target.
export function PortfolioArtifactCard({ project }: { project: Project }) {
  return (
    <div className="py-12 first:pt-0 last:pb-0">
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
        <ArtifactLink href={`/work/${project.slug}`}>Case study</ArtifactLink>
        {project.links?.map((link) => (
          <ArtifactLink key={link.href} href={link.href} external>
            {link.label}
          </ArtifactLink>
        ))}
      </div>
    </div>
  );
}

// Plain typeset link — no icon, no boxed button — shared by the case
// study and GitHub entries above so the underline/arrow/colour treatment
// only exists in one place.
function ArtifactLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const linkProps = external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <Link
      href={href}
      {...linkProps}
      className="group inline-flex items-baseline gap-1.5 transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="border-b border-transparent transition-colors duration-200 group-hover:border-accent">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
