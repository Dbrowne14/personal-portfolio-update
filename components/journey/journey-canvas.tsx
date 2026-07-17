"use client";

import { useEffect, useRef } from "react";
import type { Milestone } from "@/lib/content/journey";
import {
  PAD_BOTTOM,
  PAD_TOP,
  PAD_X,
  pointForFraction,
  pointForMilestone,
  valueAtFraction,
  yearToFraction,
} from "./geometry";

interface JourneyCanvasProps {
  milestones: Milestone[];
}

// Client Component. Only ever mounted by JourneyCanvasLoader after a
// capability check passes, so everything here can assume a fine pointer
// and a desktop-width stage. The whole subtree is aria-hidden: it is a
// decorative, interactive duplicate of what MilestoneList already provides
// as real, accessible text — not a second source of information. Draws
// once, immediately, on mount and on resize; the only thing that redraws
// afterward is pointer-driven scrubbing, which is user-initiated and not
// gated by reduced motion (01-vision.md's Interaction doctrine: scrubbing
// is data inspection, not decoration). There is no idle loop and no
// entrance-draw animation in either motion state, so there is nothing
// additional for reduced motion to drop.
export function JourneyCanvas({ milestones }: JourneyCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !tooltip || !ctx) return;

    const switchMilestone =
      milestones.find((m) => m.isSwitch) ?? milestones[milestones.length - 1];
    const tSwitch = yearToFraction(switchMilestone.year, milestones);

    let scrubT = -1;
    let raf = 0;

    function readColor(name: string): string {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = stage!.clientWidth;
      const height = stage!.clientHeight;
      if (!width || !height) return;

      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (canvas!.width !== targetW || canvas!.height !== targetH) {
        canvas!.width = targetW;
        canvas!.height = targetH;
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      const bounds = { width, height };
      const inkColor = readColor("--color-ivory") || "#fcfbf8";
      const accentColor = readColor("--color-plate-accent") || inkColor;

      // Curve: banking era, procedural wobble for a hand-drawn quality —
      // the wobble is a fixed spatial pattern along the curve, not an
      // animation over time, so it needs no reduced-motion treatment.
      ctx!.strokeStyle = inkColor;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      let first = true;
      for (let t = 0; t <= tSwitch; t += 0.005) {
        const value = valueAtFraction(t, milestones);
        const wobble = Math.sin(t * 60) * 0.012 + Math.sin(t * 13 + 1) * 0.018;
        const { x, y } = pointForFraction(t, value + wobble, bounds);
        if (first) {
          ctx!.moveTo(x, y);
          first = false;
        } else {
          ctx!.lineTo(x, y);
        }
      }
      ctx!.stroke();

      // Ticks: engineering era, quantized — with a short unlabeled
      // overhang past the last milestone ("the line continues").
      ctx!.fillStyle = accentColor;
      for (let t = tSwitch; t <= 1.08; t += 0.026) {
        const value = valueAtFraction(Math.min(t, 1), milestones);
        const { x, y } = pointForFraction(t, value, bounds);
        ctx!.fillRect(x, y - 1, 7, 2);
      }

      // Milestone point markers.
      for (const milestone of milestones) {
        const { x, y } = pointForMilestone(milestone, milestones, bounds);
        ctx!.beginPath();
        ctx!.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx!.fillStyle =
          milestone.isSwitch || milestone.era === "engineering"
            ? accentColor
            : inkColor;
        ctx!.fill();
      }

      // Scrub guide line.
      if (scrubT >= 0) {
        const { x } = pointForFraction(scrubT, 0, bounds);
        ctx!.strokeStyle = inkColor;
        ctx!.globalAlpha = 0.25;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(x, PAD_TOP * 0.5);
        ctx!.lineTo(x, height - PAD_BOTTOM * 0.5);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }

      // Year labels: real DOM text, positioned from the same bounds the
      // canvas just drew from — the two can never disagree.
      milestones.forEach((milestone, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        const { x } = pointForMilestone(milestone, milestones, bounds);
        label.style.left = `${x}px`;
        label.style.top = `${height - PAD_BOTTOM * 0.55}px`;
      });
    }

    function updateTooltip() {
      const width = stage!.clientWidth;
      const height = stage!.clientHeight;
      if (scrubT < 0 || !width || !height) {
        tooltip!.style.opacity = "0";
        return;
      }

      let nearest = milestones[0];
      let nearestDistance = Infinity;
      for (const milestone of milestones) {
        const mT = yearToFraction(milestone.year, milestones);
        const distance = Math.abs(mT - scrubT);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = milestone;
        }
      }

      const { x, y } = pointForMilestone(nearest, milestones, { width, height });
      tooltip!.textContent = `${nearest.year} — ${nearest.label}`;
      tooltip!.style.opacity = "1";
      // Clamp against the tooltip's actual rendered width, not a guessed
      // constant — a longer label needs more clearance than a short one,
      // and the previous fixed 90px let long labels clip off-screen near
      // either edge.
      const halfWidth = tooltip!.offsetWidth / 2 + 8;
      tooltip!.style.left = `${Math.min(Math.max(x, halfWidth), width - halfWidth)}px`;
      tooltip!.style.top = `${Math.max(y - 44, 8)}px`;
    }

    function render() {
      draw();
      updateTooltip();
    }

    function onPointerMove(event: PointerEvent) {
      const rect = stage!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      scrubT = Math.min(
        Math.max((x - PAD_X) / (rect.width - PAD_X * 2), 0),
        1,
      );
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); });
    }

    function onPointerLeave() {
      scrubT = -1;
      render();
    }

    const resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(stage);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    render();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [milestones]);

  return (
    <div ref={stageRef} aria-hidden="true" className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {milestones.map((milestone, i) => (
        <span
          key={milestone.year}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="pointer-events-none absolute -translate-x-1/2 font-mono text-meta text-ivory/45"
        >
          {milestone.year}
        </span>
      ))}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute -translate-x-1/2 border border-plate-accent bg-ink px-3 py-2 font-mono text-meta whitespace-nowrap text-ivory opacity-0"
      />
    </div>
  );
}
