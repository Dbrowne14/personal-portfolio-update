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
// capability check passes, so everything here can assume a tablet-or-wider
// stage — not necessarily a fine pointer, since touch tablets mount this
// too. The whole subtree is aria-hidden: it is a decorative, interactive
// duplicate of what MilestoneList already provides as real, accessible
// text — not a second source of information. Draws once, immediately, on
// mount and on resize; the only things that redraw afterward are
// pointer-driven scrubbing and the "journey:active" event TimelineActivator
// dispatches whenever the shared timeline/graph active milestone changes
// (hover, keyboard focus, or — below `lg` — scroll position; see
// activeIndex below) — both user-initiated and not gated by reduced motion
// (01-vision.md's Interaction doctrine: this is data inspection, not
// decoration). There is no idle loop and no entrance-draw animation in
// either motion state, so there is nothing additional for reduced motion
// to drop.
//
// Two distinct emphasis mechanisms, deliberately kept separate:
// scrubIntensity (direct pointer movement over this canvas — pre-existing,
// unchanged) drives the translucent halo bloom; activeIndex (the timeline's
// shared state) drives a plain radius/colour change and a slight dimming of
// the other markers, with no halo — restrained, per the brief that this
// sync effect should avoid glowing/dramatic treatments.
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
    let activeIndex = -1;
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
      const lineColor = readColor("--color-ink") || "#1b1a17";
      const accentColor = readColor("--color-accent") || lineColor;
      const bgColor = readColor("--color-ivory") || "#fcfbf8";

      // Curve: banking era, procedural wobble for a hand-drawn quality —
      // the wobble is a fixed spatial pattern along the curve, not an
      // animation over time, so it needs no reduced-motion treatment.
      ctx!.strokeStyle = lineColor;
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

      // Local emphasis: when the timeline has a shared active milestone,
      // re-stroke a narrow window of the curve (or a couple of ticks, past
      // the switch) around it slightly bolder, over the base draw above but
      // *before* the markers below so a marker's own circle still reads
      // cleanly on top rather than a bold line cutting across it. Same
      // coordinates as the base draw — no geometry change, no blur/shadow.
      // "Strengthen the associated portion of the line... where practical."
      if (activeIndex >= 0) {
        const target = milestones[activeIndex];
        const windowStart = Math.max(0, target.t - 0.05);
        const windowEnd = Math.min(1.06, target.t + 0.05);

        if (target.t <= tSwitch) {
          ctx!.strokeStyle = lineColor;
          ctx!.lineWidth = 2.5;
          ctx!.beginPath();
          let firstEmphasis = true;
          for (
            let t = windowStart;
            t <= Math.min(windowEnd, tSwitch);
            t += 0.005
          ) {
            const value = valueAtFraction(t, milestones);
            const wobble = wobbleAt(t, milestones);
            const { x, y } = pointForFraction(t, value + wobble, bounds);
            if (firstEmphasis) {
              ctx!.moveTo(x, y);
              firstEmphasis = false;
            } else {
              ctx!.lineTo(x, y);
            }
          }
          ctx!.stroke();
        } else {
          ctx!.fillStyle = accentColor;
          for (
            let t = Math.max(windowStart, tSwitch);
            t <= windowEnd;
            t += 0.022
          ) {
            const value = valueAtFraction(Math.min(t, 1), milestones);
            const { x, y } = pointForFraction(t, value, bounds);
            ctx!.fillRect(x, y - 1.5, 7, 3);
          }
        }
      }

      // Milestone point markers. Wobble is damped to zero at each
      // milestone's own t (see wobbleAt), so this point sits exactly on
      // the curve/tick line passing through it. Outlined in the page's
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
        const scrubIntensity = Math.max(0, 1 - distance / HIGHLIGHT_RADIUS);
        const timelineActive = i === activeIndex;
        const intensity = timelineActive ? 1 : scrubIntensity;
        const color =
          milestone.isSwitch || milestone.era === "engineering"
            ? accentColor
            : lineColor;
        const radius = 3.5 + intensity * 3.5;

        // Halo bloom: purely a function of direct pointer proximity
        // (scrubIntensity), unrelated to the timeline's active state — the
        // pre-existing scrub interaction, unchanged. The timeline sync
        // deliberately doesn't add one (see the file's top comment).
        if (scrubIntensity > 0.01) {
          ctx!.beginPath();
          ctx!.arc(x, y, radius + scrubIntensity * 7, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.globalAlpha = scrubIntensity * 0.18;
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }

        // When some other milestone is the shared active one, dim this
        // marker slightly rather than recolouring it — the graph-side half
        // of "de-emphasise the others, without making them hard to read."
        ctx!.globalAlpha = activeIndex >= 0 && !timelineActive ? 0.6 : 1;
        ctx!.beginPath();
        ctx!.arc(x, y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();
        ctx!.lineWidth = 1.5;
        ctx!.strokeStyle = bgColor;
        ctx!.stroke();
        ctx!.globalAlpha = 1;

        // Year label: real DOM text, positioned from the same bounds the
        // canvas just drew from (so the two can never disagree), brightening
        // in step with its dot.
        const label = labelRefs.current[i];
        if (label) {
          label.style.left = `${x}px`;
          label.style.top = `${height - PAD_BOTTOM * 0.55}px`;
          label.style.opacity = String(
            activeIndex >= 0 && !timelineActive
              ? 0.35
              : 0.45 + intensity * 0.55,
          );
        }
      });

      // Scrub guide line.
      if (scrubT >= 0) {
        const { x } = pointForFraction(scrubT, 0, bounds);
        ctx!.strokeStyle = lineColor;
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

    // Timeline sync: TimelineActivator dispatches this on document (via
    // bubbling) whenever the shared active milestone changes — hover,
    // keyboard focus, or (below `lg`) scroll position. No guide line or
    // tooltip appears for it (those stay reserved for direct pointer-scrub
    // on this canvas); see the file's top comment for how this differs
    // from scrubIntensity.
    function onTimelineActive(event: Event) {
      const detail = (event as CustomEvent<{ index: number | null }>).detail;
      activeIndex = detail?.index ?? -1;
      render();
    }
    document.addEventListener("journey:active", onTimelineActive);

    const resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(stage);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    // M8: colours above are already read fresh from computed style on
    // every draw() call, so redrawing on theme change needs nothing more
    // than re-running the same render() this component already calls on
    // mount, resize, and scrub — just triggered by the attribute ThemeToggle
    // writes instead. This is one of the two places 01-vision.md's colour
    // doctrine allows a component to branch on theme in JavaScript at all;
    // every other component's theme response is CSS-only.
    const themeObserver = new MutationObserver(() => render());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    render();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("journey:active", onTimelineActive);
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
            className={`pointer-events-none absolute font-mono text-meta whitespace-nowrap text-ink ${
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
        className="pointer-events-none absolute -translate-x-1/2 border border-ink/16 bg-ivory px-3 py-2 font-mono text-meta whitespace-nowrap text-ink opacity-0"
      />
    </div>
  );
}
