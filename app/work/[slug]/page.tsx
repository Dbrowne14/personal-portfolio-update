import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/lib/content/projects";
import { CaseStudyHero } from "@/components/work/case-study-hero";
import { EvaluatorNote } from "@/components/work/evaluator-note";
import { CaseStudyBody } from "@/components/work/case-study-body";
import { ProjectGallery } from "@/components/work/project-gallery";

// Real routes, not client-managed in-place expansion (02-architecture.md,
// ADR-008) — generateStaticParams and generateMetadata exported directly
// from this file, not a separate convention file, per 02-architecture.md.
export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — David Browne`,
    description: project.oneLiner,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <CaseStudyHero project={project} />

      <section className="bg-ivory px-7 pb-24">
        <div className="mx-auto max-w-350">
          {project.evaluatorNote ? (
            <EvaluatorNote note={project.evaluatorNote} />
          ) : null}
          {project.highlights ? (
            <CaseStudyBody highlights={project.highlights} />
          ) : null}
          {project.gallery ? (
            <div className="py-6">
              <ProjectGallery images={project.gallery} />
            </div>
          ) : null}
          {project.links && project.links.length > 0 ? (
            <div className="flex flex-wrap gap-6 border-t border-ink/16 py-8">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-meta text-ink uppercase tracking-[0.1em] transition-colors duration-200 hover:text-accent"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
