import type { Project } from "@/lib/content/projects";
import { ProjectRow } from "./project-row";

// Server Component. A ruled list, ordered by each project's own `order`
// field rather than array position — the data stays the single source of
// truth for sequence, not incidental array ordering.
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const ordered = [...projects].sort((a, b) => a.order - b.order);

  return (
    <ol className="border-t border-ink/16">
      {ordered.map((project) => (
        <ProjectRow key={project.slug} project={project} />
      ))}
    </ol>
  );
}
