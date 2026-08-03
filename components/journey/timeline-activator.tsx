"use client";

import { useEffect, useRef } from "react";

// Drives the one shared "active milestone" state consumed by both
// MilestoneList's own data-active styling and JourneyCanvas's matching
// graph emphasis (via the "journey:active" CustomEvent below) — the DOM-
// event mechanism ADR-011 prefers over React Context for cross-component
// coordination. Wraps MilestoneList's server-rendered output as children
// rather than owning the content itself (02-architecture.md): this only
// ever reads/writes attributes on DOM nodes MilestoneList already rendered.
//
// Two independent sources feed the same effectiveIndex:
// - hoverIndex: pointerenter/focus on a `<li>` (every breakpoint) — always
//   takes priority when set. This is what makes desktop's sync interaction
//   (JourneyCanvas) event-conditioned: nothing is active at rest.
// - scrollIndex: an IntersectionObserver-driven "current reading position",
//   but only below `lg` (see isDesktop) — the always-on "current chapter"
//   feel the brief asks for on mobile/tablet, where there's no hover to
//   drive it instead. At `lg` and up scrollIndex stays inert (-1), so
//   desktop's resting state is neutral until a visitor actually engages.
//
// IntersectionObserver, not scroll + rAF + getBoundingClientRect: the
// callback only fires on actual threshold crossings (a handful of times
// per visit for four items), never on a continuous per-frame poll. The fill
// line's height is still a real pixel measurement, but only taken once per
// crossing, not once per scroll event.
//
// Deliberately not capability-gated the way JourneyCanvasLoader is. That
// gate exists to keep a genuinely heavy chunk (canvas drawing, resize
// handling, pointer tracking) out of the initial bundle for visitors who
// will never see it. This component's runtime cost — one IntersectionObserver
// and a handful of pointer/focus listeners for four items — is small enough
// that skipping the gate is simpler and not a meaningful cost even where
// nothing is listening (mobile, where JourneyCanvas never mounts).
export function TimelineActivator({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-timeline-item]"),
    );
    const fill = container.querySelector<HTMLElement>("[data-timeline-fill]");
    if (items.length === 0) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    let hoverIndex = -1;
    let scrollIndex = isDesktop ? -1 : 0;

    function applyEffective() {
      const effectiveIndex = hoverIndex >= 0 ? hoverIndex : scrollIndex;
      items.forEach((item, i) => {
        item.toggleAttribute("data-active", i === effectiveIndex);
      });
      container!.dispatchEvent(
        new CustomEvent("journey:active", {
          detail: { index: effectiveIndex },
          bubbles: true,
        }),
      );
    }

    function updateFill(index: number) {
      if (!fill || index < 0) return;
      const activeRect = items[index].getBoundingClientRect();
      const containerRect = container!.getBoundingClientRect();
      const height =
        activeRect.top - containerRect.top + activeRect.height / 2;
      fill.style.height = `${Math.max(height, 0)}px`;
    }

    updateFill(scrollIndex);
    applyEffective();

    // Reading-zone band roughly a third of the way down the viewport,
    // replacing the old activationY = innerHeight * 0.35 line with an
    // equivalent thin band expressed as rootMargin.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          if (index === -1) continue;
          scrollIndex = index;
          updateFill(index);
          applyEffective();
        }
      },
      { rootMargin: "-30% 0px -65% 0px", threshold: 0 },
    );
    items.forEach((item) => observer.observe(item));

    const hoverCleanups = items.map((item, i) => {
      const onEnter = () => {
        hoverIndex = i;
        applyEffective();
      };
      const onLeave = () => {
        hoverIndex = -1;
        applyEffective();
      };
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

    return () => {
      observer.disconnect();
      hoverCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
