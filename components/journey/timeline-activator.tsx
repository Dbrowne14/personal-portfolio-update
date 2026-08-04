"use client";

import { useEffect, useRef } from "react";
import { onActiveMilestone, setActiveMilestone } from "./active-milestone";

// Drives MilestoneList's own data-active styling from the one shared active
// milestone model in active-milestone.ts. Wraps MilestoneList's
// server-rendered output as children rather than owning the content itself
// (02-architecture.md): this only ever reads/writes attributes on DOM nodes
// MilestoneList already rendered.
//
// Two independent local sources feed effectiveIndex and are dispatched via
// setActiveMilestone — but rendering (the data-active toggle below) happens
// exclusively inside the onActiveMilestone subscription, not inline in the
// handlers that compute effectiveIndex. That's what makes a graph-hover-
// driven index light up a timeline item exactly the same way a local hover
// does: one render path, regardless of which input last wrote the shared
// value.
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
// per visit per milestone), never on a continuous per-frame poll. The fill
// line's height is still a real pixel measurement, but only taken once per
// crossing, not once per scroll event. The fill stays tied to scrollIndex
// alone (a mobile reading-position indicator) — it does not move on hover
// today, so a graph-hover-driven activation doesn't move it either; only
// data-active styling is shared across inputs.
//
// Deliberately not capability-gated the way JourneyCanvasLoader is. That
// gate exists to keep a genuinely heavy chunk (canvas drawing, resize
// handling, pointer tracking) out of the initial bundle for visitors who
// will never see it. This component's runtime cost — one IntersectionObserver
// and a handful of pointer/focus listeners for a handful of items — is small
// enough that skipping the gate is simpler and not a meaningful cost even
// where nothing is listening (mobile, where JourneyCanvas never mounts).
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

    // Local-input-driven: recompute this component's own contribution to
    // the shared value and dispatch it. Never called from the
    // onActiveMilestone subscription below — that asymmetry is what
    // prevents a dispatch/render feedback loop.
    function dispatchEffective() {
      const effectiveIndex = hoverIndex >= 0 ? hoverIndex : scrollIndex;
      setActiveMilestone(effectiveIndex >= 0 ? effectiveIndex : null);
    }

    function updateFill(index: number) {
      if (!fill || index < 0) return;
      const activeRect = items[index].getBoundingClientRect();
      const containerRect = container!.getBoundingClientRect();
      const height =
        activeRect.top - containerRect.top + activeRect.height / 2;
      fill.style.height = `${Math.max(height, 0)}px`;
    }

    // Single render path: whatever set the shared value — this
    // component's own hover/scroll, or JourneyCanvas's hover — the same
    // data-active toggle applies here.
    const unsubscribe = onActiveMilestone((index) => {
      items.forEach((item, i) => {
        item.toggleAttribute("data-active", i === index);
      });
    });

    updateFill(scrollIndex);
    dispatchEffective();

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
          dispatchEffective();
        }
      },
      { rootMargin: "-30% 0px -65% 0px", threshold: 0 },
    );
    items.forEach((item) => observer.observe(item));

    const hoverCleanups = items.map((item, i) => {
      const onEnter = () => {
        hoverIndex = i;
        dispatchEffective();
      };
      const onLeave = () => {
        hoverIndex = -1;
        dispatchEffective();
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
      unsubscribe();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
