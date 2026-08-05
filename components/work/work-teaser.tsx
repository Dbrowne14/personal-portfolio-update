import Image from "next/image";
import Link from "next/link";
import { projects, type Project } from "@/lib/content/projects";
import { TechCredit } from "./tech-credit";

// Server Component, no interactivity beyond CSS. An asymmetric curated
// pairing, not a uniform grid: Default Social (the flagship, per
// content-brief.md) as a large editorial feature on the left (~62.5%
// width via lg:grid-cols-[5fr_3fr] — deliberately widened past a plain
// 60/40 split so the hierarchy reads as intentional), the other three
// featured projects stacked as a compact index on the right (~37.5%),
// each with number/stack/title/one-liner/thumbnail — the featured card is
// the only one with anything beyond the one-liner (detail and the
// featuredTags footer — see lib/content/projects.ts), which is what
// actually carries the hierarchy: extra copy on the flagship, not the
// presence/absence of the one-liner itself. This Portfolio breaks the
// image-led pattern entirely (PortfolioArtifactCard, below) — deliberate
// variety in the supporting column, not an oversight.
//
// Bronze is reserved for interaction only (project numbers, and anything
// under hover/focus-visible) — never a permanent colour on headline text,
// body copy, or structural rules. That includes the hover treatment
// itself: a near-invisible bg-accent/3 tint on the whole card (via a
// -mx/px pair that cancels out visually, existing only to give the tint
// a little room), a small image scale/contrast/brightness lift (bigger on
// the featured image than on supporting thumbnails), and "View case
// study →" picking up the same accent + a small translate nudge. No
// border, shadow, or rounded corner anywhere — the tint is the only card
// affordance, not a container.
//
// Whitespace, not rules, separates the three supporting entries (no
// divide-y between them, just generous py-12 per entry). The featured and
// supporting columns are separated by one genuinely thin vertical rule
// (lg:divide-x lg:divide-ink/20) — the only rule between the two
// structural halves; everything else in the section relies on spacing.
export function WorkTeaser() {
  const featured = projects
    .filter((project) => project.featured)
    .sort((a, b) => a.order - b.order);
  const [flagship, ...supporting] = featured;

  return (
    <section className=" bg-ivory px-7 py-24 md:py-28">
      <div className="mx-auto max-w-350">
        <div className="flex flex-col gap-8 pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:pb-2">
          <div>
            <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
              The work · Selected projects
            </p>
            <h2 className="mt-4 text-h2 font-bold text-ink">Selected work</h2>
          </div>
          {/* Grouped as one navigation element (bronze index label over a
              bolder black CTA), not a lone link floating beside the
              heading — the entrance into the full /work index, so it
              reacts a touch more than the per-project links: the same
              underline reveal, but font-bold (not semibold) and the
              largest arrow shift in the section (translate-x-1, 4px). */}
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
              04 — Index
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

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[5fr_3fr] lg:items-start lg:gap-14 lg:divide-x lg:divide-ink/20 pt-8 ">
          {flagship ? <ProjectCard project={flagship} featured /> : null}

          {supporting.length > 0 ? (
            <div className="flex flex-col lg:pl-12">
              {supporting.map((project) =>
                // The site you're already browsing doesn't need its own
                // screenshot — a link-only artefact layout in place of the
                // usual thumbnail (see PortfolioArtifactCard), the one
                // deliberate rhythm break in an otherwise uniform column.
                project.slug === "this-portfolio" ? (
                  <PortfolioArtifactCard key={project.slug} project={project} />
                ) : (
                  <ProjectCard key={project.slug} project={project} />
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      // -mx/px cancel out visually (no layout shift) — they exist only so
      // the hover/focus tint has a little room around the content instead
      // of hugging it, reading as "the whole project is one unit" rather
      // than a highlighted text block. bg-accent/3 is deliberately almost
      // nothing: this is a hover cue, not a card background.
      className={`group -mx-4 block px-4 transition-colors duration-300 ease-out hover:bg-accent/3 focus-visible:bg-accent/3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none md:-mx-6 md:px-6 ${
        featured ? "-my-3 py-3 md:-my-4 md:py-4" : "py-12 first:pt-0 last:pb-0"
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
          featured ? "mt-4 text-2xl md:text-3xl" : "mt-3 text-lg"
        }`}
      >
        {project.title}
      </h3>
      <p
        className={`text-ink/70 ${
          featured ? "mt-2 max-w-lg text-body" : "mt-1 max-w-sm text-body"
        }`}
      >
        {project.oneLiner}
      </p>
      {/* Featured-only: the extra paragraph that makes this read as the
          lead story rather than just a bigger card. Quieter than the
          one-liner above it (ink/55, not ink/70) — supporting context, not
          a second headline-weight claim. */}
      {featured && project.detail ? (
        <p className="mt-3 max-w-lg text-body text-ink/55">{project.detail}</p>
      ) : null}
      <div
        className={`relative overflow-hidden border border-ink/16 ${
          featured ? "mt-6 aspect-2/1" : "mt-4 aspect-5/2"
        }`}
      >
        <ProjectImage project={project} featured={featured} />
      </div>
      {/* Featured-only editorial footer, grouped into a clear hierarchy
          rather than five flat, disconnected labels: a group heading
          (featuredTags[0], no trailing period), the remaining tags
          clustered tightly beneath it, then "View case study →" set apart
          with the most space above it since it's the closing action. */}
      {featured && project.featuredTags && project.featuredTags.length > 1 ? (
        <div className="mt-8 font-mono text-meta uppercase tracking-widest">
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

// This portfolio's own entry: no thumbnail (redundant — the visitor is
// already on the site), and two real, independent destinations (the case
// study, and the public repo) rather than one shared click target, so —
// unlike every other entry — this isn't wrapped in a single outer <Link>.
// Reads as an engineering artefact (title, two-line description, a short
// stack of plain text links) rather than a smaller version of the
// image-led supporting cards beside it — the deliberate rhythm break in
// the column, not an inconsistency to fix.
function PortfolioArtifactCard({ project }: { project: Project }) {
  return (
    <div className="py-12 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-meta text-accent">
          {String(project.order).padStart(2, "0")}
        </span>
        <TechCredit stack={project.stack} />
      </div>
      <h3 className="mt-3 text-lg font-bold text-ink">{project.title}</h3>
      <div className="flex justify-between items-center mt-4">
        <p className="max-w-sm text-body text-ink/70">
          {project.oneLiner}
        </p>
        <div className=" flex items-center gap-4 font-mono text-meta font-semibold uppercase tracking-widest text-ink">
          <ArtifactLink href={`/work/${project.slug}`}>Case study</ArtifactLink>
          {project.links?.map((link) => (
            <ArtifactLink key={link.href} href={link.href} external>
              {link.label}
            </ArtifactLink>
          ))}
        </div>
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

function ProjectImage({
  project,
  featured,
}: {
  project: Project;
  featured: boolean;
}) {
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

  // The site's established placeholder treatment for missing imagery —
  // 45° hairlines, not a broken image or an empty box.
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]"
    >
      <span className="bg-ivory px-3 py-1.5 font-mono text-meta text-ink/62 uppercase tracking-[0.1em] transition-colors duration-300 group-hover:text-accent">
        Case study to follow
      </span>
    </div>
  );
}
