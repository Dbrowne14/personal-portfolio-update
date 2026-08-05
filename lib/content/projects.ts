export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  stack: string[];
  featured: boolean;
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
  confidential?: boolean;
  // A short second line of description, beyond the one-liner — used by
  // WorkTeaser wherever a project's homepage treatment has room for more
  // than one sentence (the featured card, and This Portfolio's link-only
  // artefact layout). Not every project needs one: evaluatorNote's
  // reflective, wry register doesn't fit a plain factual paragraph, and
  // highlights are sized for the full case-study page, not a homepage
  // aside.
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
    featured: true,
    order: 1,
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
    featured: true,
    order: 2,
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
    featured: true,
    order: 3,
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
    featured: true,
    order: 4,
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
    stack: ["Next.js", "PostgreSQL"],
    featured: false,
    order: 5,
    confidential: true,
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
    featured: false,
    order: 6,
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
