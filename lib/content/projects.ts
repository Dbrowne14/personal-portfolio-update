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
  // The project's own codebase — rendered in the /work accordion directly
  // below Highlights, for every project except disclosure === "nda" (an
  // NDA project's repo isn't public by definition). Separate from `links`
  // (Live Site / Source, rendered in the right column's Actions row)
  // because this always means the same specific thing: a link to the code.
  repoUrl?: string;
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
    stack: ["TypeScript", "Next.js", "React", "Sanity CMS", "NodeJs", "Vercel"],
    homepageRole: "flagship",
    order: 1,
    heroImage: {
      src: "/projects-Images/default-social-2.png",
      alt: "default social hero",
    },
    links: [
      { label: "live site", href: "https://default-social-ai.vercel.app/" },
    ],
    disclosure: "public",
    // Confirmed shareable — fill in the real repo URL.
    repoUrl: "https://github.com/Dbrowne14/Default_Social_AI",
    detail:
      "Built for a real client using Next.js, Sanity CMS and a modern editorial architecture. Designed, developed and shipped into production with accessibility, performance and maintainability as first-class priorities.",
    // First tag is the WorkTeaser footer's own group heading (no trailing
    // period, unlike the rest) — rendered separately from the tags that
    // follow it, not just another item in the same flat list.

    evaluatorNote:
      "Low technical risk, real client, real deadline — the kind of build that proves delivery discipline as much as craft.",
    highlights: [
      {
        title: "Content-first architecture",
        body: "Built a typed Sanity content model around reusable schemas, giving the client control of production content without coupling publishing to development.",
      },
      {
        title: "Production-grade Next.js",
        body: "Built with the App Router, Server Components and ISR, combining server-rendered performance with CMS content that updates without a full redeploy.",
      },
      {
        title: "Performance and accessibility",
        body: "Shipped with responsive image handling, semantic structure and production optimisation, reaching 100 Lighthouse accessibility and 96 performance.",
      },
      {
        title: "AI concierge — coming next",
        body: "Next phase adds an AI concierge using the Vercel AI SDK, turning the site's existing content architecture into a conversational product experience.",
      },
    ],
  },
  {
    slug: "staple",
    title: "Staple",
    oneLiner: "A complete daily game, not just an interface.",
    stack: ["TypeScript", "React", "Supabase", "NodeJs", "PostgreSQL"],
    homepageRole: "supporting",
    order: 2,
    heroImage: { src: "/projects-Images/playstaple.png", alt: "staple hero" },
    links: [{ label: "live site", href: "https://playstaple.app/" }],
    disclosure: "public",
    // Pending real repo URL.
    repoUrl: "",
    detail:
      "A daily puzzle game built end to end — real game logic and server-tracked state, not a static interface bolted onto someone else's backend.",
    evaluatorNote:
      "The riskiest of the four to build — a full game loop, not a CRUD app. Worth it as the clearest proof of full-stack ownership.",
    highlights: [
      {
        title: "Persistent game engine",
        body: "Built the game logic around PostgreSQL-backed state, preserving guesses and progress while enforcing the rules of a daily Wordle-style challenge.",
      },
      {
        title: "RESTful backend",
        body: "Designed Node.js and Express API endpoints for serving daily challenges, retrieving card data, validating guesses, and coordinating persisted game state.",
      },
      {
        title: "Automated daily rotation",
        body: "Implemented cron-based automation to select and rotate the daily card, turning the game into a self-running recurring experience rather than a manually managed demo.",
      },
      {
        title: "Interactive React frontend",
        body: "Built the responsive TypeScript and React interface in Tailwind, connecting real-time gameplay feedback to the API and underlying game state.",
      },
    ],
  },
  {
    slug: "10-songs",
    title: "10 Songs",
    oneLiner: "A playlist game, built around a daily habit.",
    stack: ["TypeScript", "React", "OAuth", "Tailwind CSS"],
    homepageRole: "supporting",
    order: 3,
    heroImage: { src: "/projects-Images/tenSongs.png", alt: "10 songs hero" },
    links: [{ label: "live site", href: "https://davejams.netlify.app/" }],
    disclosure: "public",
    // Pending real repo URL.
    repoUrl: "",
    detail:
      "A tightly scoped playlist game designed around a daily habit — small in scope, built for polish and repeat play rather than an open-ended feature set.",
    evaluatorNote:
      "Small scope, high polish — closer to a design portfolio piece than a commercial brief, and treated that way.",
    highlights: [
      {
        title: "Spotify OAuth integration",
        body: "Implemented Spotify’s OAuth 2.0 flow and token handling to authenticate users and securely access personalised Spotify data.",
      },
      {
        title: "Rule-based game engine",
        body: "Built dynamic TypeScript logic that turns Spotify data into structured playlist challenges, with game rules determining valid selections and progression.",
      },
      {
        title: "Live API-driven experience",
        body: "Integrated real-time Spotify API data into the React interface, translating external music data into responsive, interactive gameplay.",
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
        title: "Next.js architecture",
        body: "Built with the App Router, Server Components and typed content models, keeping content, presentation and client-side interaction cleanly separated.",
      },
      {
        title: "Purpose-built interactions",
        body: "Engineered custom interactions including the synchronized Journey timeline and graph, with shared React state coordinating hover, focus and mobile scroll behaviour.",
      },
      {
        title: "Responsive by composition",
        body: "Designed desktop and mobile experiences around the strengths of each viewport, adapting complex layouts and interactions rather than simply shrinking them.",
      },
      {
        title: "Performance and accessibility",
        body: "Built semantic navigation, keyboard and focus states, reduced-motion support and responsive image handling into the component system from the outset.",
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
    stack: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
    homepageRole: null,
    order: 6,
    heroImage: {
      src: "/projects-Images/weddingSD.png",
      alt: "sd wedding hero",
    },
    links: [
      {
        label: "live site",
        href: "https://sush-and-david-wedding.vercel.app/",
      },
    ],
    disclosure: "public",
    // Pending real repo URL.
    repoUrl: "",
    detail:
      "A personal project built for our wedding day, with a fixed deadline and no client to negotiate scope with but ourselves.",
    evaluatorNote:
      "Not a commercial brief — included because craft doesn't take a day off just because the stakes are personal.",
    highlights: [
      {
        title: "Information architecture for real users",
        body: "Structured complex event, travel, accommodation and destination information into a clear multi-page experience for an international guest list.",
      },
      {
        title: "Responsive content design",
        body: "Designed dense logistical content to remain easy to navigate on mobile, using adaptive layouts, collapsible sections and clear information hierarchy.",
      },
      {
        title: "Reusable Next.js system",
        body: "Built the platform around reusable typed components for events, travel guidance, contacts and destination content, keeping a content-heavy site consistent and maintainable.",
      },
      {
        title: "Production-ready delivery",
        body: "Deployed a complete guest-facing platform with responsive imagery, social sharing metadata and polished navigation designed for use throughout the wedding journey.",
      },
    ],
  },
];
