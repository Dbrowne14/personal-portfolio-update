"use client";

import { useEffect, useRef } from "react";
import type { Milestone } from "@/lib/content/journey";
import { onActiveMilestone, setActiveMilestone } from "./active-milestone";
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

// Opacity applied to the curve/ticks and markers beyond the active
// milestone — "subtly reduce emphasis on future milestones," not hide them.
const FUTURE_DIM_ALPHA = 0.4;

function wobbleAt(t: number, milestones: Milestone[]): number {
  const raw = Math.sin(t * 60) * 0.012 + Math.sin(t * 13 + 1) * 0.018;
  let damp = 1;
  for (const milestone of milestones) {
    damp = Math.min(damp, Math.abs(t - milestone.t) / 0.05);
  }
  return raw * Math.min(Math.max(damp, 0), 1);
}

// The one nearest-milestone lookup, shared by the tooltip, the marker
// growth/halo intensity, and the trace-up-to/dim-future split — so there is
// exactly one notion of "which milestone is active," not a tooltip-side
// copy and a marker-side copy that could drift apart.
function nearestMilestone(
  t: number,
  milestones: Milestone[],
): { index: number; distance: number } {
  let index = 0;
  let distance = Infinity;
  milestones.forEach((milestone, i) => {
    const d = Math.abs(milestone.t - t);
    if (d < distance) {
      distance = d;
      index = i;
    }
  });
  return { index, distance };
}

// Client Component. Only ever mounted by JourneyCanvasLoader after a
// capability check passes, so everything here can assume a tablet-or-wider
// stage — not necessarily a fine pointer, since touch tablets mount this
// too. The whole subtree is aria-hidden: it is a decorative, interactive
// duplicate of what MilestoneList already provides as real, accessible
// text — not a second source of information. Draws once, immediately, on
// mount and on resize; the only things that redraw afterward are
// pointer-driven scrubbing on this canvas and the shared active-milestone
// event (active-milestone.ts) that TimelineActivator — or this component's
// own scrubbing — dispatches whenever the active milestone changes (hover,
// keyboard focus, or — below `lg` — scroll position, on the timeline side;
// direct pointer proximity, on this side) — both user-initiated and not
// gated by reduced motion (01-vision.md's Interaction doctrine: this is
// data inspection, not decoration). There is no idle loop and no
// entrance-draw animation in either motion state, so there is nothing
// additional for reduced motion to drop.
//
// One active-milestone model, not two: everything below — marker growth,
// halo bloom, the tooltip, the guide line, and the trace-up-to/dim-future
// split — is a function of a single derived `effectiveScrubT`. When this
// canvas is being hovered directly, it's the real pointer position (the
// reference interaction: continuous, magnetic growth as you approach a
// point). When a milestone is active via the timeline instead, it's that
// milestone's own `t` — which makes the nearest-milestone distance exactly
// zero, so the same code path that gives a directly-hovered point its full
// treatment does it here too. There's no separate "restrained sync"
// branch; hovering the timeline is meant to look exactly like hovering
// that point on the graph.
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

    // scrubT: this canvas's own pointer position, unset (-1) when not
    // hovered. externalIndex: the shared active milestone as last reported
    // by active-milestone.ts, from whichever input (usually the timeline)
    // last set it. Direct pointer scrubbing always wins while it's
    // happening — externalIndex only matters once the pointer leaves.
    let scrubT = -1;
    let externalIndex = -1;
    let lastDispatched: number | null = null;
    let raf = 0;

    // Single derivation every render reads: the real pointer position when
    // this canvas is being hovered directly, or the externally-active
    // milestone's own coordinate otherwise — simulating a pointer sitting
    // exactly on that point. -1 means genuinely idle.
    function getEffectiveScrubT(): number {
      if (scrubT >= 0) return scrubT;
      if (externalIndex >= 0) return milestones[externalIndex].t;
      return -1;
    }

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

      const effectiveScrubT = getEffectiveScrubT();
      const active =
        effectiveScrubT >= 0
          ? nearestMilestone(effectiveScrubT, milestones)
          : null;
      // "Trace up to" the active milestone, "subtly reduce emphasis" past
      // it — a boundary in t-space the curve and ticks are both split
      // against below. null (idle) means no boundary: the whole graph
      // draws at full strength, same as before this feature existed.
      const activeT = active ? milestones[active.index].t : null;

      // Curve: banking era, procedural wobble for a hand-drawn quality —
      // the wobble is a fixed spatial pattern along the curve, not an
      // animation over time, so it needs no reduced-motion treatment.
      // Drawn as two strokes split at activeT (clamped into the curve's own
      // range) rather than one, so the portion past the active milestone
      // can be dimmed independently — same coordinates either way, just a
      // different globalAlpha per segment.
      const curveBoundary =
        activeT === null ? tSwitch : Math.min(Math.max(activeT, 0), tSwitch);

      function strokeCurve(from: number, to: number, alpha: number) {
        if (to <= from) return;
        ctx!.globalAlpha = alpha;
        ctx!.strokeStyle = lineColor;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        let firstPoint = true;
        for (let t = from; t <= to; t += 0.005) {
          const value = valueAtFraction(t, milestones);
          const wobble = wobbleAt(t, milestones);
          const { x, y } = pointForFraction(t, value + wobble, bounds);
          if (firstPoint) {
            ctx!.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx!.lineTo(x, y);
          }
        }
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }

      strokeCurve(0, curveBoundary, 1);
      if (activeT !== null && curveBoundary < tSwitch) {
        strokeCurve(curveBoundary, tSwitch, FUTURE_DIM_ALPHA);
      }

      // Ticks: the engineering era, quantized — spanning from the switch
      // to a short overhang past the final milestone ("the line
      // continues"). This phase is allocated roughly half the graph's
      // width (t=0.56 to 1.0+) despite covering the fewest real years —
      // a deliberate narrative weighting, not a chronological one. Same
      // future-dim split as the curve, per tick rather than per segment.
      ctx!.fillStyle = accentColor;
      for (let t = tSwitch; t <= 1.06; t += 0.022) {
        const value = valueAtFraction(Math.min(t, 1), milestones);
        const { x, y } = pointForFraction(t, value, bounds);
        ctx!.globalAlpha =
          activeT !== null && t > activeT ? FUTURE_DIM_ALPHA : 1;
        ctx!.fillRect(x, y - 1, 7, 2);
      }
      ctx!.globalAlpha = 1;

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
        // Continuous distance from whichever point is effectively "hovered"
        // right now — the real pointer for direct scrubbing, or the
        // externally-active milestone's own t (distance 0 for itself) when
        // driven by the timeline. One formula covers both: growth/halo for
        // a directly-scrubbed near-miss, and a clean full-intensity hit for
        // the exact milestone the timeline just activated.
        const distance =
          effectiveScrubT >= 0
            ? Math.abs(milestone.t - effectiveScrubT)
            : Infinity;
        const intensity = Math.max(0, 1 - distance / HIGHLIGHT_RADIUS);
        const isFuture = activeT !== null && milestone.t > activeT;
        const color =
          milestone.isSwitch || milestone.era === "engineering"
            ? accentColor
            : lineColor;
        const radius = 3.5 + intensity * 3.5;

        // Halo bloom: a function of proximity to effectiveScrubT, so it
        // blooms for direct pointer proximity exactly as before, and blooms
        // fully around the exact milestone a timeline hover activates too —
        // "exactly the same visual state," not a restrained variant of it.
        if (intensity > 0.01) {
          ctx!.beginPath();
          ctx!.arc(x, y, radius + intensity * 7, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.globalAlpha = intensity * 0.18;
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }

        // Dim only markers past the active milestone — "reduce emphasis on
        // future milestones," not on every other one.
        ctx!.globalAlpha = isFuture ? FUTURE_DIM_ALPHA : 1;
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
            isFuture ? 0.35 : 0.45 + intensity * 0.55,
          );
        }
      });

      // Guide line: at effectiveScrubT, so it appears exactly under the
      // pointer during direct scrubbing, or exactly at the active
      // milestone's own position when driven by the timeline.
      if (effectiveScrubT >= 0) {
        const { x } = pointForFraction(effectiveScrubT, 0, bounds);
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
      const effectiveScrubT = getEffectiveScrubT();
      if (effectiveScrubT < 0 || !width || !height) {
        tooltip!.style.opacity = "0";
        return;
      }

      const { index } = nearestMilestone(effectiveScrubT, milestones);
      const nearest = milestones[index];

      const { x, y } = pointForMilestone(nearest, { width, height });
      tooltip!.textContent = `${nearest.year} — ${nearest.headline}`;
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

    // Guards the synchronous re-entrant call into the onActiveMilestone
    // subscription below that dispatching triggers on its own — this
    // canvas already renders from the pointermove/leave that caused the
    // dispatch, so it doesn't need the echo of its own event to trigger a
    // second one.
    let isSelfDispatch = false;

    function dispatchActive(index: number | null) {
      if (index === lastDispatched) return;
      lastDispatched = index;
      isSelfDispatch = true;
      setActiveMilestone(index);
      isSelfDispatch = false;
    }

    function onPointerMove(event: PointerEvent) {
      const rect = stage!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      scrubT = Math.min(
        Math.max((x - PAD_X) / (rect.width - PAD_X * 2), 0),
        1,
      );
      dispatchActive(nearestMilestone(scrubT, milestones).index);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); });
    }

    function onPointerLeave() {
      scrubT = -1;
      dispatchActive(null);
      render();
    }

    // Shared active-milestone sync: fires whenever TimelineActivator's own
    // hover/focus/scroll — or this canvas's own dispatchActive above —
    // changes the shared value. Self-dispatches are skipped (see
    // isSelfDispatch) since this canvas already re-renders from the input
    // handler that caused them.
    const unsubscribeActive = onActiveMilestone((index) => {
      if (isSelfDispatch) return;
      externalIndex = index ?? -1;
      render();
    });

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
      unsubscribeActive();
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
