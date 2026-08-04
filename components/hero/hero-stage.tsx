"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// useEffect fires after the browser paints, which would leave the hero
// briefly rendered at its default (unscrolled) opacity/transform before
// snapping to the correct scroll-derived state on mount — visible on any
// client-side navigation back to "/" at a scrolled position (e.g. the
// browser back button). useLayoutEffect fires before paint instead. It has
// no effect during server rendering (React only warns about that if the
// component reads layout back out, which this doesn't: it only ever writes
// styles to its own ref), so it's safe to use directly here without the
// usual SSR-safe fallback to useEffect.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Owns the hero's scroll-compress: a continuous transform/opacity tied to
// scroll position, applied via direct DOM writes rather than React state
// (no re-render per frame).
//
// Full motion: tracked via a rAF-throttled scroll handler. Reduced motion:
// no continuous transform at all — a plain threshold swap between two
// instant states, per 03-roadmap.md's M2 risk note.
export function HeroStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      const apply = () => {
        const compressed = window.scrollY > window.innerHeight * 0.5;
        el.style.opacity = compressed ? "0" : "1";
      };
      apply();
      window.addEventListener("scroll", apply, { passive: true });
      return () => {
        window.removeEventListener("scroll", apply);
      };
    }

    let raf = 0;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const vh = window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / (vh * 0.72), 0), 1);
      el.style.transform = `translateY(${(-progress * 26).toFixed(2)}vh) scale(${(1 - 0.6 * progress).toFixed(3)})`;
      el.style.opacity = String(1 - Math.max(0, progress - 0.55) / 0.45);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(apply);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center will-change-transform">
      {children}
    </div>
  );
}
