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
  // fake path through next/image. Populated for real at M6.
  heroImage?: { src: string; alt: string };
  gallery?: { src: string; alt: string }[];
  evaluatorNote?: string;
  highlights?: { title: string; body: string }[];
  links?: { label: string; href: string }[];
  confidential?: boolean;
}

// content-brief.md confirms the four featured projects, their order, and
// that Default Social carries significantly more visual weight than the
// other three — nothing further about descriptions, images, or per-project
// stacks. One-liners here are deliberately factual and unspecific rather
// than inventing client details or integrations; stack tags are drawn only
// from content-brief.md's already-confirmed toolset, never a new addition.
// "This portfolio" is the one exception — its stack is exact, since it's
// this actual build.
export const projects: Project[] = [
  {
    slug: "default-social",
    title: "Default Social",
    oneLiner: "The flagship build — production, live, shipped.",
    stack: ["Next.js", "Sanity CMS", "Vercel"],
    featured: true,
    order: 1,
  },
  {
    slug: "staple",
    title: "Staple",
    oneLiner: "A complete daily game, not just an interface.",
    stack: ["React", "Supabase", "PostgreSQL"],
    featured: true,
    order: 2,
  },
  {
    slug: "10-songs",
    title: "10 Songs",
    oneLiner: "A playlist game, built around a daily habit.",
    stack: ["React", "Next.js", "TypeScript"],
    featured: true,
    order: 3,
  },
  {
    slug: "this-portfolio",
    title: "This portfolio",
    oneLiner: "The site you're looking at right now.",
    stack: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
    featured: true,
    order: 4,
  },
];
