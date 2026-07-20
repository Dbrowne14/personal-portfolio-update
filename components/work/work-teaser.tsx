import Image from "next/image";
import Link from "next/link";
import { projects, type Project } from "@/lib/content/projects";

// Server Component, no interactivity beyond CSS. Grayscale-to-colour hover
// is a pure `filter` transition — there is no listener attached anywhere
// in this file. Case-study routes don't exist until M6, so every card
// links to /work for now; that's expected to sharpen into /work/[slug]
// once those routes are real, not a gap to fix here.
export function WorkTeaser() {
  const featured = projects
    .filter((project) => project.featured)
    .sort((a, b) => a.order - b.order);
  const [flagship, ...supporting] = featured;

  return (
    <section className="border-t border-ink/16 bg-ivory px-7 py-24 md:py-28">
      <div className="mx-auto max-w-350">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-h2 font-bold text-ink">Selected work</h2>
          <p className="font-mono text-meta text-ink/45 uppercase tracking-[0.1em]">
            {featured.length} projects
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          {flagship ? <ProjectCard project={flagship} flagship /> : null}
        </div>

        {supporting.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {supporting.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : null}

        <p className="mt-16 font-mono text-meta text-ink/45">
          <Link
            href="/work"
            className="border-b border-ink/16 pb-0.5 transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            View the complete work index →
          </Link>
        </p>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  flagship = false,
}: {
  project: Project;
  flagship?: boolean;
}) {
  return (
    <Link href="/work" className="group block">
      <div
        className={`relative overflow-hidden border border-ink/16 ${
          flagship ? "aspect-16/9" : "aspect-4/3"
        }`}
      >
        <ProjectImage project={project} flagship={flagship} />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3
          className={`font-bold text-ink ${flagship ? "text-h2" : "text-body"}`}
        >
          {project.title}
        </h3>
      </div>
      <p className="mt-1 max-w-md text-body text-ink/70">
        {project.oneLiner}
      </p>
      <p className="mt-3 font-mono text-meta text-ink/45 uppercase tracking-[0.08em]">
        {project.stack.join(" · ")}
      </p>
    </Link>
  );
}

function ProjectImage({
  project,
  flagship,
}: {
  project: Project;
  flagship: boolean;
}) {
  if (project.heroImage) {
    return (
      <Image
        src={project.heroImage.src}
        alt={project.heroImage.alt}
        fill
        sizes={
          flagship
            ? "(min-width: 1400px) 1350px, 100vw"
            : "(min-width: 640px) 33vw, 100vw"
        }
        className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0"
      />
    );
  }

  // The site's established placeholder treatment for missing imagery —
  // 45° hairlines, not a broken image or an empty box.
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]"
    >
      <span className="bg-ivory px-3 py-1.5 font-mono text-meta text-ink/45 uppercase tracking-[0.1em] transition-colors duration-300 group-hover:text-accent">
        Case study to follow
      </span>
    </div>
  );
}
