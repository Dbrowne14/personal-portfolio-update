import type { Metadata } from "next";
import { projects } from "@/lib/content/projects";
import { ProjectIndex } from "@/components/work/project-index";
import { Colophon } from "@/components/work/colophon";

const TITLE = "Work — David Browne";
const DESCRIPTION =
  "Six shipped projects, each chosen to prove something different.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/work" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

// Server Component throughout. Act IV (01-vision.md): "maximum contact
// with the real" — the ruled index below is deliberately denser and
// less airy than earlier sections, matching the Visual Rhythm doctrine's
// "densest, busiest stretch on the site."
export default function WorkPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="reveal-on-scroll border-t border-ink/16 bg-ivory px-7 pt-24 pb-16 md:pt-28">
        <div className="mx-auto max-w-350">
          <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
            The evidence
          </p>
          <h1 className="mt-4 text-h1 font-bold text-ink text-balance">
            Six projects, each proving something different.
          </h1>
        </div>
      </section>

      <section className="bg-ivory px-7 pb-16">
        <div className="mx-auto max-w-350">
          <ProjectIndex projects={projects} />
          <Colophon projects={projects} />
        </div>
      </section>
    </main>
  );
}
