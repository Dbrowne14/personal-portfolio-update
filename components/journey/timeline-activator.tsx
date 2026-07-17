"use client";

import { useEffect, useRef } from "react";

// Tracks which timeline item is "active" as the visitor scrolls, and grows
// the fill line up to it — the mobile equivalent of the desktop scrub
// interaction, since there's no hover on touch. Wraps MilestoneList's
// server-rendered output as children rather than owning the content itself
// (02-architecture.md): this only ever reads/writes attributes on DOM
// nodes MilestoneList already rendered.
//
// Deliberately not capability-gated the way JourneyCanvasLoader is. That
// gate exists to keep a genuinely heavy chunk (canvas drawing, resize
// handling, pointer tracking) out of the initial bundle for visitors who
// will never see it. This component's runtime cost — a scroll listener and
// a handful of getBoundingClientRect() reads for four items — is small
// enough that skipping the gate is simpler and not a meaningful cost even
// on desktop, where MilestoneList is visually clipped and this produces no
// visible effect.
//
// Scroll position, not IntersectionObserver: with only a handful of items,
// reading each one's position on scroll is cheap, and gives a precise
// "nearest to a fixed activation line" ranking that a visibility threshold
// can't express as simply.
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

    let raf = 0;

    function update() {
      const activationY = window.innerHeight * 0.35;
      let activeIndex = 0;
      for (let i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top <= activationY) {
          activeIndex = i;
        }
      }

      items.forEach((item, i) => {
        item.toggleAttribute("data-active", i === activeIndex);
      });

      if (fill) {
        const activeRect = items[activeIndex].getBoundingClientRect();
        const containerRect = container!.getBoundingClientRect();
        const height =
          activeRect.top - containerRect.top + activeRect.height / 2;
        fill.style.height = `${Math.max(height, 0)}px`;
      }
    }

    function onScroll() {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
