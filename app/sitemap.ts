import type { MetadataRoute } from "next";
import { projects } from "@/lib/content/projects";

const SITE_URL = "https://davidbrowne.dev";

// M9. Case-study routes are computed from the same `projects` array
// generateStaticParams already uses (app/work/[slug]/page.tsx) — one
// source, per ADR-006, not a hand-maintained slug list that could drift.
// The confidential project keeps its page indexed: the page itself
// carries no confidential detail, only NDA-safe copy already meant to be
// public, so there's no reason to exclude it from discovery.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/work", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
  }));

  return [...staticRoutes, ...projectRoutes];
}
