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
} from "./geometry";

interface JourneyCanvasProps {
  milestones: Milestone[];
}

// Returns the label's alignment relative to its anchor point, so an edge
// milestone's text never runs off the stage regardless of label length —
// centering a label at t=0 or t=1 would clip half of it past the edge.
function edgeAlignment(t: number): "left" | "center" | "right" {
  if (t <= 0.05) return "left";
  if (t >= 0.95) return "right";
  return "center";
}

// Wobble amplitude damps to zero within 0.05 of any real milestone, so the
// curve passes exactly through each milestone's own value there. Without
// this, the point markers (drawn at the clean, un-wobbled value) visibly
// floated off the wobbly line, and the switch-to-ticks handoff showed a
// jump where the curve's last wobbled point didn't match the first
// (unwobbled) tick.
// How close (in t-units) the scrub position needs to be to a milestone
// before its dot starts growing/glowing. Comparable to the tooltip's
// nearest-milestone logic, but a smooth falloff rather than a binary pick.
const HIGHLIGHT_RADIUS = 0.07;

function wobbleAt(t: number, milestones: Milestone[]): number {
  const raw = Math.sin(t * 60) * 0.012 + Math.sin(t * 13 + 1) * 0.018;
  let damp = 1;
  for (const milestone of milestones) {
    damp = Math.min(damp, Math.abs(t - milestone.t) / 0.05);
  }
  return raw * Math.min(Math.max(damp, 0), 1);
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
    const tSwitch = switchMilestone.t;

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
      const plateColor = readColor("--color-ink") || "#1b1a17";

      // Curve: banking era, procedural wobble for a hand-drawn quality —
      // the wobble is a fixed spatial pattern along the curve, not an
      // animation over time, so it needs no reduced-motion treatment.
      ctx!.strokeStyle = inkColor;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      let first = true;
      for (let t = 0; t <= tSwitch; t += 0.005) {
        const value = valueAtFraction(t, milestones);
        const wobble = wobbleAt(t, milestones);
        const { x, y } = pointForFraction(t, value + wobble, bounds);
        if (first) {
          ctx!.moveTo(x, y);
          first = false;
        } else {
          ctx!.lineTo(x, y);
        }
      }
      ctx!.stroke();

      // Ticks: the engineering era, quantized — spanning from the switch
      // to a short overhang past the final milestone ("the line
      // continues"). This phase is allocated roughly half the graph's
      // width (t=0.56 to 1.0+) despite covering the fewest real years —
      // a deliberate narrative weighting, not a chronological one.
      ctx!.fillStyle = accentColor;
      for (let t = tSwitch; t <= 1.06; t += 0.022) {
        const value = valueAtFraction(Math.min(t, 1), milestones);
        const { x, y } = pointForFraction(t, value, bounds);
        ctx!.fillRect(x, y - 1, 7, 2);
      }

      // Milestone point markers. Wobble is damped to zero at each
      // milestone's own t (see wobbleAt), so this point sits exactly on
      // the curve/tick line passing through it. Outlined in the plate's
      // own background colour to read as a distinct marker on the line,
      // not just a thicker segment of it.
      //
      // Highlight intensity is a smooth, continuous function of distance
      // from the current scrub position — not a lerped/animated value, so
      // no persistent animation loop is needed: it's purely a function of
      // where the pointer is right now, redrawn only on pointer move.
      // Growing and glowing as the pointer approaches, easing back out as
      // it recedes, entirely input-driven.
      milestones.forEach((milestone, i) => {
        const { x, y } = pointForMilestone(milestone, bounds);
        const distance = scrubT >= 0 ? Math.abs(milestone.t - scrubT) : Infinity;
        const intensity = Math.max(0, 1 - distance / HIGHLIGHT_RADIUS);
        const color =
          milestone.isSwitch || milestone.era === "engineering"
            ? accentColor
            : inkColor;
        const radius = 3.5 + intensity * 3.5;

        if (intensity > 0.01) {
          ctx!.beginPath();
          ctx!.arc(x, y, radius + intensity * 7, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.globalAlpha = intensity * 0.18;
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }

        ctx!.beginPath();
        ctx!.arc(x, y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();
        ctx!.lineWidth = 1.5;
        ctx!.strokeStyle = plateColor;
        ctx!.stroke();

        // Year label: real DOM text, positioned from the same bounds the
        // canvas just drew from (so the two can never disagree), brightening
        // in step with its dot.
        const label = labelRefs.current[i];
        if (label) {
          label.style.left = `${x}px`;
          label.style.top = `${height - PAD_BOTTOM * 0.55}px`;
          label.style.opacity = String(0.45 + intensity * 0.55);
        }
      });

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
        const distance = Math.abs(milestone.t - scrubT);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = milestone;
        }
      }

      const { x, y } = pointForMilestone(nearest, { width, height });
      tooltip!.textContent = `${nearest.year} — ${nearest.label}`;
      tooltip!.style.opacity = "1";
      // Clamp against the tooltip's actual rendered width, not a guessed
      // constant — a longer label needs more clearance than a short one.
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
      {milestones.map((milestone, i) => {
        const align = edgeAlignment(milestone.t);
        return (
          <span
            key={milestone.year}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute font-mono text-meta whitespace-nowrap text-ivory ${
              align === "left"
                ? "translate-x-0"
                : align === "right"
                  ? "-translate-x-full"
                  : "-translate-x-1/2"
            }`}
          >
            {milestone.year}
          </span>
        );
      })}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute -translate-x-1/2 border border-plate-accent bg-ink px-3 py-2 font-mono text-meta whitespace-nowrap text-ivory opacity-0"
      />
    </div>
  );
}
