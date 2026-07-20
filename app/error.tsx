"use client";

import Link from "next/link";

// M9. Required to be a Client Component by Next's own error.tsx
// convention (it needs a reset() callback and must catch render errors
// client-side). No specific throw path in this app is currently expected
// to reach here — every Server Component renders from fully static,
// already-typed data (lib/content/), and the one place external I/O
// happens (the contact form's Server Action) already catches its own
// errors and returns state rather than throwing. This exists as a
// general safety net so an unexpected regression shows a page consistent
// with the site rather than the framework's default error screen, not
// because a specific failure is anticipated.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center border-t border-ink/16 bg-ivory px-7 py-32 text-center">
      <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
        Error
      </p>
      <h1 className="mt-4 text-h1 font-bold text-ink text-balance">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-md text-body text-ink/70">
        That wasn&rsquo;t supposed to happen. You can try again, or head back
        to the homepage.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="border border-ink px-7 py-3 font-mono text-meta text-ink uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-ink hover:text-ivory"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-ink px-7 py-3 font-mono text-meta text-ink uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-ink hover:text-ivory"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
