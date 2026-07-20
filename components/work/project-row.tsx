import Link from "next/link";
import type { Project } from "@/lib/content/projects";
import { TechCredit } from "./tech-credit";

// Server Component, no interactivity beyond CSS. The whole row is the
// link. A ruled row, not a card — hairline dividers, no border, no
// rounded corners, no shadow, matching the site's established structural
// language. Confidential projects show "NDA" in place of a real stack
// line, keeping the restraint consistent at index level, not just on the
// case-study page itself.
export function ProjectRow({ project }: { project: Project }) {
  return (
    <li className="border-b border-ink/16">
      <Link
        href={`/work/${project.slug}`}
        className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-2 py-6 transition-colors duration-200 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-x-8"
      >
        <span className="font-mono text-meta text-accent">
          {String(project.order).padStart(2, "0")}
        </span>

        <span className="col-start-2">
          <span className="block text-h2 font-bold text-ink transition-colors duration-200 group-hover:text-accent">
            {project.title}
          </span>
          <span className="mt-1 block max-w-lg text-body text-ink/70">
            {project.oneLiner}
          </span>
        </span>

        <span className="col-span-2 col-start-2 sm:col-span-1 sm:col-start-3 sm:text-right">
          {project.confidential ? (
            <span className="font-mono text-meta text-ink/45 uppercase tracking-[0.08em]">
              NDA
            </span>
          ) : (
            <TechCredit stack={project.stack} />
          )}
        </span>
      </Link>
    </li>
  );
}
