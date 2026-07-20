import type { Project } from "@/lib/content/projects";

// Server Component. The aggregate layer of Technology disclosure
// (01-vision.md): "a quiet, bibliographic listing in the register of a
// printer's imprint... computed from the same per-project data, never
// hand-maintained, so it cannot drift out of sync with what each case
// study actually claims." Deriving this from `projects` directly — not a
// second, separately-authored list — is what that guarantee actually
// rests on: edit one project's stack and this updates with it, with no
// second edit required anywhere.
export function Colophon({ projects }: { projects: Project[] }) {
  const stack = Array.from(new Set(projects.flatMap((p) => p.stack))).sort();

  return (
    <footer className="border-t border-ink/16 py-10">
      <p className="font-mono text-meta text-ink/45 uppercase tracking-[0.08em]">
        Built with {stack.join(" · ")}.
      </p>
    </footer>
  );
}
