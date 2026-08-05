"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Past this many pixels of scroll, the name swaps in for the monogram.
const SCROLL_THRESHOLD = 24;

// Narrow client boundary for the logo/name crossfade — Header stays a
// Server Component for everything else, the same "deliberately narrow"
// pattern NavLinks and MobileMenu already use (ADR-005).
//
// Both links are stacked in the same grid cell (rather than one being
// conditionally rendered) so the crossfade doesn't shift layout, and so
// there's always exactly one focusable, non-hidden "home" link for
// keyboard/AT users regardless of scroll position.
//
// The scroll listener is rAF-throttled since `scroll` fires far more often
// than the browser can paint; passive: true keeps it off the scrolling
// thread's critical path.
export function Masthead() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScrolled = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrolled);
      }
    };

    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="grid h-10 items-center">
      <Link
        href="/"
        aria-label="David Browne — home"
        aria-hidden={scrolled}
        tabIndex={scrolled ? -1 : 0}
        // hover:bg-ink/hover:text-ivory (not bg-black/text-white) so the
        // fill inverts correctly in dark mode too — ink and ivory swap
        // values per theme, whereas hardcoded black landed almost on top
        // of the already-dark header background there.
        className={`col-start-1 row-start-1 flex h-10 w-10 items-center justify-center rounded-full border border-ink font-mono text-xs font-semibold text-ink transition-[opacity,transform] duration-300 ease-out hover:bg-ink hover:text-ivory motion-reduce:transition-none ${
          scrolled
            ? "pointer-events-none -translate-y-1 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        DB
      </Link>
      <Link
        href="/"
        aria-label="David Browne — home"
        aria-hidden={!scrolled}
        tabIndex={scrolled ? 0 : -1}
        className={`col-start-1 row-start-1 font-mono text-[12px] text-ink transition-[opacity,transform] duration-300 ease-out hover:text-accent motion-reduce:transition-none ${
          scrolled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        David Browne
      </Link>
    </div>
  );
}
