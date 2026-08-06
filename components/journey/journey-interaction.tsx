"use client";

import { useEffect, useRef, useState } from "react";
import type { Milestone } from "@/lib/content/journey";
import { JourneyCanvasLoader } from "./journey-canvas-loader";

interface JourneyInteractionProps {
  milestones: Milestone[];
  children: React.ReactNode;
}

// Client Component. Owns the single shared active-milestone state for the
// Journey section — hoverIndex (timeline hover/focus, and JourneyCanvas's
// own pointer activity, reported back via onHoverIndexChange) and
// scrollIndex (the mobile IntersectionObserver "current reading
// position") — and derives activeIndex = hoverIndex ?? scrollIndex, the
// one value both the timeline DOM and JourneyCanvas render from. Plain
// React state and props, not a module-level DOM event bus: JourneyCanvas
// is a controlled component (activeIndex in, onHoverIndexChange out), the
// same shape as any other controlled input.
//
// Wraps MilestoneList's server-rendered output as children rather than
// owning the content itself (02-architecture.md) — this only ever
// reads/writes attributes on DOM nodes MilestoneList already rendered.
// JourneyCanvasLoader, by contrast, is rendered directly (not as children)
// because the graph needs activeIndex/onHoverIndexChange as real props,
// not inert markup to read data attributes off — so this component also
// owns the two-column grid that places the timeline and the graph side by
// side, rather than that grid living in journey.tsx.
//
// hoverIndex and scrollIndex are two independent sources feeding
// activeIndex, deliberately asymmetric by breakpoint — desktop has a
// precise pointer, so hover (and keyboard focus) is the only activator;
// touch devices have no hover, so scroll is:
// - hoverIndex: pointerenter/focus on a timeline `<li>` (every breakpoint),
//   or a graph pointer move (via onHoverIndexChange, `lg` and up only,
//   since JourneyCanvas never mounts below that) — always takes priority
//   when set.
// - scrollIndex: an IntersectionObserver-driven "current reading
//   position," but the observer is only ever created below `lg` (see
//   isDesktop in the mount effect) — starting at the first milestone,
//   since there's no hover there to drive it instead. On desktop the
//   observer is never created at all, not merely defaulted to neutral —
//   scrolling the section must never activate anything, and the section
//   must load, and stay, neutral until a visitor actually hovers or
//   focuses something.
//
// A pointer leaving the graph reports hoverIndex → null through
// onHoverIndexChange; it never touches scrollIndex, so activeIndex falls
// back to the mobile reading position on its own where that's relevant,
// rather than this component having to special-case which input cleared it.
export const JourneyInteraction = ({
  milestones,
  children,
}: JourneyInteractionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement[]>([]);
  const fillRef = useRef<HTMLElement | null>(null);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  // Lazy initializer, not a setState call inside the mount effect: mobile
  // starts on the first milestone (no hover to drive it instead), desktop
  // starts neutral. `typeof window` guards the SSR pass, where this always
  // resolves to null — harmlessly, since scrollIndex never drives any
  // server-rendered markup (data-active is applied imperatively below, not
  // via JSX), so there's nothing for the two passes to hydration-mismatch
  // on. The client's first render (hydration) re-runs this with the real
  // matchMedia value, same as the effect-based check used to.
  const [scrollIndex, setScrollIndex] = useState<number | null>(() =>
    typeof window !== "undefined" &&
    !window.matchMedia("(min-width: 1024px)").matches
      ? 0
      : null,
  );
  const activeIndex = hoverIndex ?? scrollIndex;

  // DOM wiring for the timeline: query the server-rendered items once,
  // attach hover/focus listeners and the reading-zone observer. Runs once
  // per mount — activeIndex changes are handled by the effect below, not
  // by tearing this down and setting it back up.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-timeline-item]"),
    );
    itemsRef.current = items;
    fillRef.current = container.querySelector<HTMLElement>(
      "[data-timeline-fill]",
    );
    if (items.length === 0) return;

    const updateFill = (index: number | null) => {
      const fill = fillRef.current;
      if (!fill || index === null) return;
      const activeRect = items[index].getBoundingClientRect();
      const containerRect = container!.getBoundingClientRect();
      const height =
        activeRect.top - containerRect.top + activeRect.height / 2;
      fill.style.height = `${Math.max(height, 0)}px`;
    };

    const hoverCleanups = items.map((item, i) => {
      const onEnter = () => setHoverIndex(i);
      const onLeave = () => setHoverIndex(null);
      item.addEventListener("pointerenter", onEnter);
      item.addEventListener("pointerleave", onLeave);
      item.addEventListener("focus", onEnter);
      item.addEventListener("blur", onLeave);
      return () => {
        item.removeEventListener("pointerenter", onEnter);
        item.removeEventListener("pointerleave", onLeave);
        item.removeEventListener("focus", onEnter);
        item.removeEventListener("blur", onLeave);
      };
    });

    // Scroll-driven activation is a mobile/tablet affordance only. Desktop
    // has a precise pointer, so hover and keyboard focus (wired above,
    // unconditionally) are the only activators there — the observer is
    // never created, so scrolling the section can never activate anything
    // and the resting state stays neutral until a visitor actually
    // engages, on both load and re-scroll.
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      return () => {
        hoverCleanups.forEach((cleanup) => cleanup());
      };
    }

    // scrollIndex's React state is already correctly seeded by the
    // useState initializer above (0 on mobile) — this just needs the fill
    // line's actual pixel height to match that on the very first paint.
    updateFill(0);

    // Reading-zone band roughly a third of the way down the viewport,
    // replacing the old activationY = innerHeight * 0.35 line with an
    // equivalent thin band expressed as rootMargin.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          if (index === -1) continue;
          updateFill(index);
          setScrollIndex(index);
        }
      },
      { rootMargin: "-30% 0px -65% 0px", threshold: 0 },
    );
    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      hoverCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  // Single render path for the timeline DOM: whatever set activeIndex —
  // local hover/focus/scroll, or JourneyCanvas's onHoverIndexChange — the
  // same data-active toggle applies here.
  useEffect(() => {
    itemsRef.current.forEach((item, i) => {
      item.toggleAttribute("data-active", i === activeIndex);
    });
  }, [activeIndex]);

  return (
    <div className="grid grid-cols-1 gap-0 md:gap-16 lg:grid-cols-[minmax(24rem,2fr)_3fr] lg:gap-20">
      <div ref={containerRef}>{children}</div>
      <div className="relative md:h-90 lg:h-auto lg:min-h-135">
        <JourneyCanvasLoader
          milestones={milestones}
          activeIndex={activeIndex}
          onHoverIndexChange={setHoverIndex}
        />
      </div>
    </div>
  );
};
