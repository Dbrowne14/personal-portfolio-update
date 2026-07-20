interface Highlight {
  title: string;
  body: string;
}

// Server Component. Numbered highlights — real content carrying the
// section's density, per Act IV's doctrine, rather than decorative
// structure around an absence of content.
export function CaseStudyBody({ highlights }: { highlights: Highlight[] }) {
  return (
    <ol className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2">
      {highlights.map((highlight, i) => (
        <li key={highlight.title} className="flex gap-4">
          <span className="font-mono text-meta text-ink/62">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-semibold text-ink">{highlight.title}</p>
            <p className="mt-1 text-body text-ink/70">{highlight.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
