"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// useEffect fires after the browser paints; combined with .masthead-name's
// CSS transition, that gap was long enough for the masthead to visibly
// flash in then fade out on every load — motion with no user action behind
// it, which Act I's own doctrine rules out. useLayoutEffect fires before
// paint instead. It has no effect during server rendering (React only warns
// about that if the component reads layout back out, which this doesn't:
// it only ever writes an attribute to <html>), so it's safe to use directly
// here without the usual SSR-safe fallback to useEffect.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Owns the hero's scroll-compress and the two DOM attributes Header's CSS
// reacts to (02-architecture.md: DOM/CSS coordination over React Context —
// see ADR-011). `data-page="home"` is set only while this component is
// mounted, which is only ever true on the home route, so no route-awareness
// is needed anywhere else. `data-hero-compressed` crosses on scroll and
// drives the masthead's opacity purely through CSS.
//
// Full motion: continuous transform tied to scroll position, tracked via
// direct DOM writes in a rAF-throttled scroll handler (no React re-renders
// per frame). Reduced motion: no continuous transform at all — a plain
// threshold swap between two instant states, per 03-roadmap.md's M2 risk
// note.
export function HeroStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    document.documentElement.dataset.page = "home";

    function setCompressed(compressed: boolean) {
      if (compressed) {
        document.documentElement.setAttribute("data-hero-compressed", "");
      } else {
        document.documentElement.removeAttribute("data-hero-compressed");
      }
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      const apply = () => {
        const compressed = window.scrollY > window.innerHeight * 0.5;
        setCompressed(compressed);
        el.style.opacity = compressed ? "0" : "1";
      };
      apply();
      window.addEventListener("scroll", apply, { passive: true });
      return () => {
        window.removeEventListener("scroll", apply);
        delete document.documentElement.dataset.page;
        setCompressed(false);
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
      setCompressed(progress > 0.78);
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
      delete document.documentElement.dataset.page;
      setCompressed(false);
    };
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center will-change-transform">
      {children}
    </div>
  );
}
