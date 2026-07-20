// Server Component. The per-project layer of Technology disclosure
// (01-vision.md): "a short mono credit line attached to each case study —
// always tied to a specific shipped thing, never floating as an abstract
// claim." Used on both the index row and the case-study page — two real
// call sites, not spun out speculatively.
export function TechCredit({ stack }: { stack: string[] }) {
  return (
    <p className="font-mono text-meta text-ink/45 uppercase tracking-[0.08em]">
      {stack.join(" · ")}
    </p>
  );
}
