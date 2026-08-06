import Image from "next/image";
import type { Project } from "@/lib/content/projects";

export function ProjectImage({
  project,
  variant,
}: {
  project: Project;
  variant: "featured" | "compact";
}) {
  const featured = variant === "featured";

  if (project.heroImage) {
    return (
      <Image
        src={project.heroImage.src}
        alt={project.heroImage.alt}
        fill
        sizes={
          featured
            ? "(min-width: 1024px) 63vw, 100vw"
            : "(min-width: 1024px) 38vw, 100vw"
        }
        className={`object-cover grayscale contrast-100 brightness-100 transition-[filter,transform] duration-300 ease-out motion-reduce:transition-none group-hover:grayscale-0 group-hover:brightness-105 group-focus-visible:grayscale-0 group-focus-visible:brightness-105 ${
          featured
            ? "group-hover:scale-[1.02] group-hover:contrast-110 group-focus-visible:contrast-110"
            : "group-hover:scale-[1.015] group-hover:contrast-105 group-focus-visible:contrast-105"
        }`}
      />
    );
  }

  // aria-hidden: decorative placeholder only — the card's own text content
  // (title, one-liner) already carries the accessible information here.
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]"
    >
      <span className="bg-ivory px-3 py-1.5 font-mono text-meta text-ink/62 uppercase tracking-widest transition-colors duration-300 group-hover:text-accent">
        Case study to follow
      </span>
    </div>
  );
}
