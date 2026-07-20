import Link from "next/link";

// M9. Server Component — a 404 is a normal, fully static render, not an
// interactive state, so it needs no client boundary. Styled to match the
// rest of the site (same kicker/h1/body pattern as every other page)
// rather than left as Next's unstyled default.
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center border-t border-ink/16 bg-ivory px-7 py-32 text-center">
      <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
        404
      </p>
      <h1 className="mt-4 text-h1 font-bold text-ink text-balance">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="mt-4 max-w-md text-body text-ink/70">
        The page you&rsquo;re looking for isn&rsquo;t here — it may have moved, or
        the link may be wrong.
      </p>
      <Link
        href="/"
        className="mt-8 border border-ink px-7 py-3 font-mono text-meta text-ink uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-ink hover:text-ivory"
      >
        Back to home
      </Link>
    </main>
  );
}
