"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import type { Project } from "@/lib/content/projects";
import { TechCredit } from "./tech-credit";
import { ArtifactLink } from "./artifact-link";

const subscribeToHash = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};
const getHash = () => {
  return window.location.hash.slice(1);
};
const getServerHash = () => {
  return "";
};

// The one client boundary for the whole index (ADR-005 precedent, see
// MobileMenu): only one project may be expanded at a time, so the open/
// closed state has to live above the individual rows. Everything else in
// components/work stays a Server Component.
export const ExpandableProjectList = ({ projects }: { projects: Project[] }) => {
  const ordered = [...projects].sort((a, b) => a.order - b.order);

  // Deep-linkable rows: /work#staple opens that project pre-expanded,
  // restoring the shareability that separate project pages used to give.
  // useSyncExternalStore (not an effect) is what keeps this hydration-safe:
  // it reads "" to match the server-rendered (closed) markup on first
  // paint, then re-syncs to the real hash right after.
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const hashSlug = ordered.some((project) => project.slug === hash) ? hash : null;

  // undefined = "no manual toggle yet" — defer to the URL hash until the
  // visitor actually clicks a row, then manual state takes over completely.
  const [manualOpenSlug, setManualOpenSlug] = useState<string | null | undefined>(
    undefined,
  );
  const openSlug = manualOpenSlug === undefined ? hashSlug : manualOpenSlug;

  const handleToggle = (slug: string) => {
    const current = manualOpenSlug === undefined ? hashSlug : manualOpenSlug;
    const next = current === slug ? null : slug;
    window.history.replaceState(
      null,
      "",
      next ? `#${next}` : window.location.pathname + window.location.search,
    );
    setManualOpenSlug(next);
  };

  return (
    <ol className="border-t border-ink/16">
      {ordered.map((project) => (
        <ExpandableProjectRow
          key={project.slug}
          project={project}
          isOpen={openSlug === project.slug}
          onToggle={handleToggle}
        />
      ))}
    </ol>
  );
};

const ExpandableProjectRow = ({
  project,
  isOpen,
  onToggle,
}: {
  project: Project;
  isOpen: boolean;
  onToggle: (slug: string) => void;
}) => {
  const triggerId = `${project.slug}-trigger`;
  const panelId = `${project.slug}-panel`;

  return (
    <li id={project.slug} className="border-b border-ink/16">
      <h2 className="m-0">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(project.slug)}
          className="group -mx-4 grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-2 px-4 py-6 text-left transition-colors duration-200 hover:bg-accent/3 focus-visible:bg-accent/3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none sm:grid-cols-[2.5rem_1fr_auto_auto] sm:gap-x-8 md:-mx-6 md:px-6"
        >
          <span className="col-start-1 row-start-1 font-mono text-meta text-accent">
            {String(project.order).padStart(2, "0")}
          </span>

          <span className="col-start-2 row-start-1">
            <span
              className={`block text-h2 font-bold transition-colors duration-200 ${
                isOpen ? "text-accent" : "text-ink group-hover:text-accent"
              }`}
            >
              {project.title}
            </span>
            <span className="mt-1 block max-w-lg text-body text-ink/70">
              {project.oneLiner}
            </span>
          </span>

          <span className="col-span-2 col-start-2 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:text-right">
            {project.disclosure === "nda" ? (
              <span className="font-mono text-meta text-ink/62 uppercase tracking-[0.08em]">
                NDA
              </span>
            ) : (
              <TechCredit stack={project.stack} />
            )}
          </span>

          <span
            aria-hidden="true"
            className={`col-start-3 row-start-1 self-center justify-self-end font-mono text-xl leading-none text-ink transition-[transform,color] duration-300 ease-out group-hover:text-accent motion-reduce:transition-none sm:col-start-4 ${
              isOpen ? "rotate-45 text-accent" : ""
            }`}
          >
            +
          </span>
        </button>
      </h2>

      {/* grid-template-rows 0fr/1fr: height animates without measuring the
          content in JS and without any bounce. inert removes the closed
          panel from the tab order and accessibility tree while it stays in
          the DOM (needed for the CSS transition — display:none can't
          animate). */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`transition-opacity duration-300 ${
              isOpen ? "opacity-100 delay-150" : "opacity-0"
            }`}
          >
            <ExpandedProjectContent project={project} />
          </div>
        </div>
      </div>
    </li>
  );
};

// Mechanical categorisation of each project's own `stack` entries — not
// hand-authored per project, so it can't drift out of sync the way a
// second, separately-maintained field could (same reasoning as Colophon).
const TECH_CATEGORIES: Record<string, string> = {
  "Next.js": "Frontend",
  React: "Frontend",
  TypeScript: "Frontend",
  "Tailwind CSS": "Frontend",
  "Sanity CMS": "CMS",
  Supabase: "Deployment",
  PostgreSQL: "Database",
  Vercel: "Deployment",
  NodeJs: "Backend"
};
const CATEGORY_ORDER = ["Frontend", "Backend", "CMS", "Database", "Deployment"];

const groupStack = (stack: string[]) => {
  const groups = new Map<string, string[]>();
  for (const tech of stack) {
    const category = TECH_CATEGORIES[tech] ?? "Other";
    groups.set(category, [...(groups.get(category) ?? []), tech]);
  }
  return [...groups.keys()]
    .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
    .map((category) => ({ category, items: groups.get(category)! }));
};

// Reading width for narrative copy (Overview, Highlights) — the left
// column is 3fr (~60% of the row), too wide for comfortable line length
// on its own.
const READING_WIDTH = "max-w-[540px]";

const SectionLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
      {children}
    </p>
  );
};

// The right column's metadata rows: a muted grey label next to its value,
// both on one line — deliberately not the bronze section-label treatment,
// since these are facts, not narrative sections. Shared by the standard
// Technologies panel and the NDA facts panel below.
const FactRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="grid grid-cols-[6rem_1fr] items-baseline gap-x-6">
      <span className="font-mono text-meta text-ink/62 uppercase tracking-[0.08em]">
        {label}
      </span>
      <span className="text-body font-semibold text-ink">{value}</span>
    </div>
  );
};

// NDA projects replace the image + Technologies panel with this text-led
// facts panel — no lock icons, no blurred/placeholder imagery, just the
// same row primitive used elsewhere, grouped into three clusters
// (engagement, stack, outcome) by whitespace alone, matching the
// engagement facts / tech facts / outcome facts split in the approved
// content model.
const NdaFactsPanel = ({ project }: { project: Project }) => {
  const nda = project.nda ?? {};
  return (
    <div>
      <SectionLabel>NDA Project</SectionLabel>

      <div className="mt-4 flex flex-col gap-3">
        {nda.sector ? <FactRow label="Sector" value={nda.sector} /> : null}
        {nda.projectType ? (
          <FactRow label="Project type" value={nda.projectType} />
        ) : null}
        {nda.role ? <FactRow label="Role" value={nda.role} /> : null}
        {nda.delivery ? <FactRow label="Delivery" value={nda.delivery} /> : null}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <FactRow label="Stack" value={project.stack.join(" · ")} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {nda.outcome ? <FactRow label="Status" value={nda.outcome} /> : null}
        {nda.disclosureNote ? (
          <FactRow label="Disclosure" value={nda.disclosureNote} />
        ) : null}
      </div>
    </div>
  );
};;

const ExpandedProjectContent = ({ project }: { project: Project }) => {
  // Only the flagship gets a dedicated case-study page from here — every
  // other project's actions are inline Live Site / Source links.
  const isFlagship = project.homepageRole === "flagship";

  if (project.slug === "this-portfolio") {
    return (
      <div className={`${READING_WIDTH} pt-12 pb-12`}>
        <SectionLabel>Overview</SectionLabel>
        <p className="mt-3 text-body text-ink/70">{project.detail}</p>

        <p className="mt-14 font-mono text-meta text-accent uppercase tracking-[0.14em]">
          Current Site
        </p>
        {project.links && project.links.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-8 font-mono text-meta font-semibold uppercase tracking-widest text-ink">
            {project.links.map((link) => (
              <ArtifactLink key={link.href} href={link.href} external>
                {link.label}
              </ArtifactLink>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-10 pt-12 pb-12 lg:pl-17 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-14">
      <div>
        <SectionLabel>Overview</SectionLabel>
        <p className={`${READING_WIDTH} mt-3 text-body text-ink/70`}>
          {project.detail}
        </p>

        {project.highlights ? (
          <div className="mt-14">
            <SectionLabel>Highlights</SectionLabel>
            <ol className={`${READING_WIDTH} mt-4 flex flex-col gap-5`}>
              {project.highlights.map((highlight, i) => (
                <li key={highlight.title}>
                  <p className="flex items-baseline gap-2 font-semibold text-ink">
                    <span className="font-mono text-meta font-normal text-ink/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {highlight.title}
                  </p>
                  <p className="mt-1.5 pl-6 text-body text-ink/70">
                    {highlight.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* Every project's own codebase, directly below Highlights — never
            rendered for disclosure === "nda", since an NDA project's repo
            isn't public by definition. */}
        {project.repoUrl ? (
          <div className="mt-14">
            <SectionLabel>Source</SectionLabel>
            <div className="mt-4 font-mono text-meta font-semibold uppercase tracking-widest text-ink">
              <ArtifactLink href={project.repoUrl} external>
                GitHub
              </ArtifactLink>
            </div>
          </div>
        ) : null}

        {/* Default Social is the only project with featuredTags today —
            this is what gives the flagship "slightly more" without
            hardcoding by slug. */}
        {project.featuredTags && project.featuredTags.length > 1 ? (
          <div className="mt-14">
            <SectionLabel>{project.featuredTags[0]}</SectionLabel>
            <div className={`${READING_WIDTH} mt-3 flex flex-col gap-1 font-mono text-meta uppercase tracking-widest text-ink/55`}>
              {project.featuredTags.slice(1).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* One coherent information column, not two unrelated blocks:
          image, technologies and actions share a tighter mt-8 rhythm here
          rather than the left column's generous mt-14 between narrative
          sections. NDA projects swap this whole column for NdaFactsPanel —
          no image, no lock icons, no "image unavailable" messaging, just a
          text-led facts panel using the same FactRow primitive. */}
      <div>
        {project.disclosure === "nda" ? (
          <NdaFactsPanel project={project} />
        ) : (
          <>
            <div className="relative aspect-4/3 overflow-hidden border border-ink/16">
              {project.heroImage ? (
                <Image
                  src={project.heroImage.src}
                  alt={project.heroImage.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]"
                >
                  <span className="bg-ivory px-3 py-1.5 font-mono text-meta text-ink/62 uppercase tracking-widest">
                    Case study imagery to follow
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8">
              <SectionLabel>Technologies</SectionLabel>
              <div className="mt-4 flex flex-col gap-3">
                {groupStack(project.stack).map((group) => (
                  <FactRow
                    key={group.category}
                    label={group.category}
                    value={group.items.join(" · ")}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {isFlagship || (project.links && project.links.length > 0) ? (
          <div className="mt-8 flex flex-wrap items-center gap-8 font-mono text-meta font-semibold uppercase tracking-widest text-ink">
            {project.links?.map((link) => (
              <ArtifactLink key={link.href} href={link.href} external>
                {link.label}
              </ArtifactLink>
            ))}
            {isFlagship ? (
              <ArtifactLink href={`/work/${project.slug}`}>
                View full case study
              </ArtifactLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
