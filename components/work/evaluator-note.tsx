// Server Component. The device that reconnects Work back to the site's
// central thesis case by case, not just once in the About page: a margin
// note in the register of someone who used to evaluate work like this,
// now shipping it instead. An editorial device, not a claim — see
// lib/content/projects.ts's own note on this field.
export function EvaluatorNote({ note }: { note: string }) {
  return (
    <div className="border-y border-ink/16 py-6">
      <p className="font-mono text-meta text-accent uppercase tracking-[0.1em]">
        Evaluator&rsquo;s note
      </p>
      <p className="mt-3 max-w-xl text-body text-ink/70">{note}</p>
    </div>
  );
}
