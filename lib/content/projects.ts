export type ProjectDisclosure = "public" | "nda";

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  stack: string[];
  // Homepage inclusion and role, explicit and independent of `order` (which
  // stays a pure display-order field, also used by /work's full index).
  homepageRole: "flagship" | "supporting" | null;
  order: number;
  // Optional here, unlike the roadmap's original shape: no real project
  // screenshots exist yet. WorkTeaser falls back to the site's hairline
  // placeholder pattern whenever this is absent, rather than forcing a
  // fake path through next/image. Populated for real once assets exist.
  heroImage?: { src: string; alt: string };
  gallery?: { src: string; alt: string }[];
  evaluatorNote?: string;
  highlights?: { title: string; body: string }[];
  links?: { label: string; href: string }[];
  // Selects the /work accordion's right-column variant: "nda" swaps the
  // image + Technologies panel for a text-led facts panel (see `nda`
  // below) instead of the image-placeholder pattern used elsewhere.
  disclosure: ProjectDisclosure;
  // Populated only when disclosure === "nda". Not enforced at the type
  // level (no discriminated union) — there's exactly one NDA project today,
  // so that complexity isn't earning its cost yet. Every field is optional
  // and simply doesn't render its row if absent.
  nda?: {
    sector?: string;
    projectType?: string;
    role?: string;
    delivery?: string;
    outcome?: string;
    disclosureNote?: string;
  };
  // A short second line of description, beyond the one-liner — used by
  // WorkTeaser's featured card and the /work index's expanded-row overview.
  detail?: string;
  // Short factual tags for the featured project's editorial footer on the
  // homepage (e.g. "Live.", "Commercial client.") — kept as data rather
  // than hardcoded JSX so a future featured project swap doesn't leave
  // Default Social's specifics behind in the component.
  featuredTags?: string[];
}

// content-brief.md confirms all six projects, their order, that Default
// Social carries significantly more visual weight than the rest, and that
// the fifth is anonymised. It gives no descriptions, images, or
// per-project stacks beyond that. Every field below is either directly
// sourced, computed from data already established elsewhere in this
// codebase (journey.ts's milestones), or deliberately generic, factual,
// and unspecific rather than inventing client details, metrics, or
// integrations that can't be verified. evaluatorNote is an editorial
// device, not a factual claim — a margin note in the register of the
// person who used to evaluate work like this, now shipping it instead.
export const projects: Project[] = [
  {
    slug: "default-social",
    title: "Default Social",
    oneLiner: "The flagship build — production, live, shipped.",
    stack: ["Next.js", "Sanity CMS", "Vercel"],
    homepageRole: "flagship",
    order: 1,
    disclosure: "public",
    detail:
      "Built for a real client using Next.js, Sanity CMS and a modern editorial architecture. Designed, developed and shipped into production with accessibility, performance and maintainability as first-class priorities.",
    // First tag is the WorkTeaser footer's own group heading (no trailing
    // period, unlike the rest) — rendered separately from the tags that
    // follow it, not just another item in the same flat list.
    featuredTags: [
      "Production build",
      "Commercial client.",
      "Editorial CMS.",
      "Accessible.",
      "Live.",
    ],
    evaluatorNote:
      "Low technical risk, real client, real deadline — the kind of build that proves delivery discipline as much as craft.",
    highlights: [
      {
        title: "Content-first architecture",
        body: "Built on a headless CMS so the client can publish without a developer in the loop.",
      },
      {
        title: "Shipped to a deadline",
        body: "Scoped, staged, and delivered as a real commercial engagement, not an open-ended side project.",
      },
    ],
  },
  {
    slug: "staple",
    title: "Staple",
    oneLiner: "A complete daily game, not just an interface.",
    stack: ["React", "Supabase", "PostgreSQL"],
    homepageRole: "supporting",
    order: 2,
    disclosure: "public",
    detail:
      "A daily puzzle game built end to end — real game logic and server-tracked state, not a static interface bolted onto someone else's backend.",
    evaluatorNote:
      "The riskiest of the four to build — a full game loop, not a CRUD app. Worth it as the clearest proof of full-stack ownership.",
    highlights: [
      {
        title: "A real game loop",
        body: "Daily puzzle mechanics with server-tracked state, not a static interface wrapped around content.",
      },
      {
        title: "Full-stack, not just front-of-house",
        body: "Database design and game logic owned end to end, not bolted onto someone else's backend.",
      },
    ],
  },
  {
    slug: "10-songs",
    title: "10 Songs",
    oneLiner: "A playlist game, built around a daily habit.",
    stack: ["React", "Next.js", "TypeScript"],
    homepageRole: "supporting",
    order: 3,
    disclosure: "public",
    detail:
      "A tightly scoped playlist game designed around a daily habit — small in scope, built for polish and repeat play rather than an open-ended feature set.",
    evaluatorNote:
      "Small scope, high polish — closer to a design portfolio piece than a commercial brief, and treated that way.",
    highlights: [
      {
        title: "Small, deliberate scope",
        body: "A tightly scoped daily game rather than an open-ended feature set.",
      },
      {
        title: "Built for replay",
        body: "Designed around a repeatable daily habit, not a one-time interaction.",
      },
    ],
  },
  {
    slug: "this-portfolio",
    title: "This portfolio",
    oneLiner: "The site you're browsing now.",
    stack: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
    homepageRole: "supporting",
    order: 4,
    disclosure: "public",
    detail:
      "Built in public. Design system, architecture and implementation documented.",
    // The one project that links off-site — WorkTeaser's link-only
    // artefact layout (no thumbnail; showing a screenshot of the site
    // you're already on is redundant) renders these alongside the usual
    // case-study link.
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Dbrowne14/personal-portfolio-update",
      },
    ],
    evaluatorNote:
      "The one project where the deliverable and the pitch are the same object — the site is its own case study.",
    highlights: [
      {
        title: "Documented as it was built",
        body: "Every milestone recorded in an implementation log — architectural decisions, not just outcomes.",
      },
      {
        title: "Built on real constraints",
        body: "Server Components by default, accessibility and reduced motion treated as requirements, not polish.",
      },
    ],
  },
  {
    slug: "private-equity-platform",
    title: "Private equity platform",
    oneLiner: "A confidential client platform — details under NDA.",
    stack: ["React", "Wordpress"],
    homepageRole: null,
    order: 5,
    disclosure: "nda",
    nda: {
      sector: "Private equity",
      projectType: "Client platform",
      role: "Lead developer",
      delivery: "Production build",
      disclosureNote:
        "Client identity, product imagery and commercially sensitive details withheld under NDA.",
    },
    detail:
      "A confidential platform built and shipped for a real client under NDA — the value here is delivery discipline under real constraints, not the specifics.",
    evaluatorNote:
      "Confidential by necessity — the value here is delivery under real client constraints, not the specifics.",
    highlights: [
      {
        title: "Delivered under NDA",
        body: "Built and shipped for a real client; details withheld by agreement, not by choice.",
      },
    ],
  },
  {
    slug: "our-wedding-website",
    title: "Our wedding website",
    oneLiner: "A personal project — built for our wedding, not a client brief.",
    stack: ["React", "Next.js"],
    homepageRole: null,
    order: 6,
    disclosure: "public",
    detail:
      "A personal project built for our wedding day, with a fixed deadline and no client to negotiate scope with but ourselves.",
    evaluatorNote:
      "Not a commercial brief — included because craft doesn't take a day off just because the stakes are personal.",
    highlights: [
      {
        title: "Built for one day, not iterated forever",
        body: "A fixed deadline, with no client to negotiate scope with but ourselves.",
      },
    ],
  },
];
