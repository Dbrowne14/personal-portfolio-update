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
  /** The shared active milestone, owned by JourneyInteraction — from
   *  timeline hover/focus, mobile scroll, or this canvas's own pointer
   *  activity reported back via onHoverIndexChange. null means nothing is
   *  externally active; this canvas's own direct scrubbing still wins
   *  regardless (see getEffectiveScrubT in the effect below). */
  activeIndex: number | null;
  /** Reports this canvas's own pointer activity up to JourneyInteraction —
   *  the nearest milestone while scrubbing, or null on pointer leave.
   *  JourneyInteraction folds this into the same hoverIndex a timeline
   *  hover would set; it does not clear scrollIndex, so the shared state
   *  naturally falls back to the mobile reading position where relevant. */
  onHoverIndexChange: (index: number | null) => void;
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

// Clearance, in px, between the active point's centre and the bottom of the
// year annotation (hairline included) — keeps the label "close to the
// point" per the design brief without sitting on top of the marker/halo.
const ANNOTATION_GAP = 18;
// Extra px the annotation sits below its resting position while hidden, so
// appearing is a small rise rather than a flat fade — collapses to no
// movement under reduced motion via the transition itself being disabled.
const ANNOTATION_ENTER_SHIFT = 4;
// Minimum clearance from the stage's own top edge — for a milestone near
// the top of the curve, the annotation's usual position above the point
// would otherwise clip out of the canvas.
const ANNOTATION_MIN_TOP = 8;

function wobbleAt(t: number, milestones: Milestone[]): number {
  const raw = Math.sin(t * 60) * 0.015 + Math.sin(t * 13 + 1) * 0.022;
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

// Client Component, and controlled: activeIndex is owned by the parent
// (JourneyInteraction), not by this component. Only ever mounted by
// JourneyCanvasLoader after a capability check passes, so everything here
// can assume a tablet-or-wider stage — not necessarily a fine pointer,
// since touch tablets mount this too. The whole subtree is aria-hidden: it
// is a decorative, interactive duplicate of what MilestoneList already
// provides as real, accessible text — not a second source of information.
// Draws once, immediately, on mount and on resize; the only things that
// redraw afterward are pointer-driven scrubbing on this canvas and changes
// to the activeIndex prop (hover, keyboard focus, or — below `lg` — scroll
// position, on the timeline side) — both user-initiated and not gated by
// reduced motion (01-vision.md's Interaction doctrine: this is data
// inspection, not decoration). There is no idle loop and no entrance-draw
// animation in either motion state, so there is nothing additional for
// reduced motion to drop.
//
// One active-milestone model, not two: everything below — marker growth,
// halo bloom, the tooltip, the guide line, and the trace-up-to/dim-future
// split — is a function of a single derived `effectiveScrubT`. When this
// canvas is being hovered directly, it's the real pointer position (the
// reference interaction: continuous, magnetic growth as you approach a
// point). When a milestone is active via the activeIndex prop instead,
// it's that milestone's own `t` — which makes the nearest-milestone
// distance exactly zero, so the same code path that gives a
// directly-hovered point its full treatment does it here too. There's no
// separate "restrained sync" branch; a timeline-driven activeIndex is
// meant to look exactly like hovering that point on the graph.
//
// Listeners and observers (pointermove/leave, resize, theme) are set up
// once per `milestones` change, not torn down and recreated every time
// activeIndex changes — that prop is read from a ref inside a second,
// focused effect that only triggers a redraw.
export function JourneyCanvas({
  milestones,
  activeIndex,
  onHoverIndexChange,
}: JourneyCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const yearLabelRef = useRef<HTMLSpanElement>(null);

  // Latest-callback ref. Kept current from a plain effect (no deps, runs
  // after every render) rather than read/written during render — it's only
  // ever read later, from event handlers, so this just needs to be settled
  // before the next one fires, not synchronous with render itself.
  const onHoverIndexChangeRef = useRef(onHoverIndexChange);
  useEffect(() => {
    onHoverIndexChangeRef.current = onHoverIndexChange;
  });

  const activeIndexRef = useRef(activeIndex);
  const renderRef = useRef<() => void>(() => {});

  // The one thing activeIndex changes cause: update the ref the draw
  // effect reads, then redraw via the render function that effect stored.
  // No listener/observer teardown, no re-subscription — just a repaint.
  useEffect(() => {
    activeIndexRef.current = activeIndex;
    renderRef.current();
  }, [activeIndex]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    const yearLabel = yearLabelRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !tooltip || !yearLabel || !ctx) return;

    const switchMilestone =
      milestones.find((m) => m.isSwitch) ?? milestones[milestones.length - 1];
    const tSwitch = switchMilestone.t;

    // scrubT: this canvas's own pointer position, unset (-1) when not
    // hovered. Direct pointer scrubbing always wins while it's happening —
    // the activeIndex prop (read via activeIndexRef) only matters once the
    // pointer leaves.
    let scrubT = -1;
    let raf = 0;

    // Single derivation every render reads: the real pointer position when
    // this canvas is being hovered directly, or the activeIndex prop's own
    // milestone coordinate otherwise — simulating a pointer sitting exactly
    // on that point. -1 means genuinely idle.
    function getEffectiveScrubT(): number {
      if (scrubT >= 0) return scrubT;
      const external = activeIndexRef.current;
      if (external !== null) return milestones[external].t;
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
        ctx!.lineWidth = 2.5;
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
      // Past t=1 (the final milestone itself) an additional taper fades
      // the overhang toward the edge, rather than letting it run at full
      // strength into a hard stop — the line settles past arrival instead
      // of looking like it was simply cut off by the canvas.
      ctx!.fillStyle = accentColor;
      for (let t = tSwitch; t <= 1.06; t += 0.022) {
        const value = valueAtFraction(Math.min(t, 1), milestones);
        const { x, y } = pointForFraction(t, value, bounds);
        const overhangFade = t > 1 ? Math.max(0, 1 - (t - 1) / 0.06) : 1;
        ctx!.globalAlpha =
          (activeT !== null && t > activeT ? FUTURE_DIM_ALPHA : 1) *
          overhangFade;
        ctx!.fillRect(x, y - 1.75, 10, 3.5);
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
      milestones.forEach((milestone) => {
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
        // The switch gets a larger base radius than every other marker —
        // permanently, not just on hover — so it reads as the pivot even
        // at rest, matching the timeline's own always-visible emphasis for
        // this one milestone. Colour stays restrained (era-based ink/accent
        // only, same at rest and on hover) — size is what carries emphasis:
        // a modest resting radius, growing considerably further on hover.
        const baseRadius = milestone.isSwitch ? 7.5 : 6.5;
        const radius = baseRadius + intensity * 7.5;

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
        ctx!.lineWidth = 2;
        ctx!.strokeStyle = bgColor;
        ctx!.stroke();
        ctx!.globalAlpha = 1;

        // A permanent, low-key ring around the switch marker — unlike the
        // halo above, not tied to intensity at all, so it's visible at
        // rest. The one thing on this graph that says "pivot" without
        // requiring a hover to notice it.
        if (milestone.isSwitch) {
          ctx!.beginPath();
          ctx!.arc(x, y, radius + 5, 0, Math.PI * 2);
          ctx!.strokeStyle = accentColor;
          ctx!.lineWidth = 1.5;
          ctx!.globalAlpha = isFuture ? FUTURE_DIM_ALPHA * 0.7 : 0.35;
          ctx!.stroke();
          ctx!.globalAlpha = 1;
        }

        // A permanent, soft glow behind the final milestone — the
        // destination, not just where the data stops. Restrained
        // deliberately: a filled bloom rather than the switch's ring, so
        // "arrival" reads differently from "pivot" without introducing a
        // new colour to do it. Never dimmed by isFuture — nothing is ever
        // "past" the last milestone.
        if (milestone === milestones[milestones.length - 1]) {
          ctx!.beginPath();
          ctx!.arc(x, y, radius + 10, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.globalAlpha = 0.1;
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }
      });

      // Editorial baseline: replaces the year-label axis entirely. A
      // grounding line, not a chart axis — no numeric scale, no per-year
      // ticks. The short marks below only echo where a milestone's point
      // sits above them, not a measurement; this is meant to read as
      // bespoke illustration, not data visualisation. Deliberately static
      // (no dim/active states) — a fixed structural element the
      // interaction plays out above, not another thing it drives.
      const baselineY = height - PAD_BOTTOM * 0.35;
      ctx!.strokeStyle = lineColor;
      ctx!.lineWidth = 1;
      ctx!.globalAlpha = 0.14;
      ctx!.beginPath();
      ctx!.moveTo(PAD_X, baselineY);
      ctx!.lineTo(width - PAD_X, baselineY);
      ctx!.stroke();

      ctx!.globalAlpha = 0.22;
      milestones.forEach((milestone) => {
        const { x } = pointForFraction(milestone.t, 0, bounds);
        ctx!.beginPath();
        ctx!.moveTo(x, baselineY - 4);
        ctx!.lineTo(x, baselineY + 4);
        ctx!.stroke();
      });
      ctx!.globalAlpha = 1;

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
        tooltip!.style.transform = `translateX(-50%) translateY(${ANNOTATION_ENTER_SHIFT}px)`;
        return;
      }

      const { index } = nearestMilestone(effectiveScrubT, milestones);
      const nearest = milestones[index];

      const { x, y } = pointForMilestone(nearest, { width, height });
      yearLabel!.textContent = `${nearest.year}`;
      tooltip!.style.opacity = "1";
      tooltip!.style.transform = "translateX(-50%) translateY(0)";
      // Clamp against the annotation's actual rendered size, not a guessed
      // constant — "2026" and "2016" don't take the same clearance, and the
      // hairline adds a fixed amount of height beneath the year itself.
      const halfWidth = tooltip!.offsetWidth / 2 + 8;
      const clampedX = Math.min(Math.max(x, halfWidth), width - halfWidth);
      // Usual position is fully above the point; only a milestone near the
      // very top of the curve (small y) needs the extra clamp against
      // ANNOTATION_MIN_TOP to avoid clipping the canvas's top edge.
      const clampedTop = Math.max(
        y - ANNOTATION_GAP - tooltip!.offsetHeight,
        ANNOTATION_MIN_TOP,
      );
      tooltip!.style.left = `${clampedX}px`;
      tooltip!.style.top = `${clampedTop}px`;
    }

    function render() {
      draw();
      updateTooltip();
    }
    // Stored so the activeIndex-sync effect above can trigger a redraw
    // without re-running this setup effect.
    renderRef.current = render;

    function onPointerMove(event: PointerEvent) {
      const rect = stage!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      scrubT = Math.min(
        Math.max((x - PAD_X) / (rect.width - PAD_X * 2), 0),
        1,
      );
      onHoverIndexChangeRef.current(nearestMilestone(scrubT, milestones).index);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); });
    }

    function onPointerLeave() {
      scrubT = -1;
      // Reports only this canvas's own hover state — JourneyInteraction
      // folds it into hoverIndex alone, so scrollIndex (the mobile reading
      // position) is untouched and activeIndex falls back to it naturally.
      onHoverIndexChangeRef.current(null);
      render();
    }

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
    };
  }, [milestones]);

  return (
    <div ref={stageRef} aria-hidden="true" className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {/* Minimal year annotation — no box/border/background, the timeline
          (MilestoneList) remains the one place headline/role/detail text
          lives. left/top/transform/opacity are all imperative (updateTooltip
          above); only the transition itself is declared here, so
          prefers-reduced-motion's global override (globals.css) collapses it
          to an instant state change with no extra branching needed. */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute flex flex-col items-center opacity-0 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
      >
        <span
          ref={yearLabelRef}
          className="font-mono text-meta font-semibold whitespace-nowrap text-accent"
        />
        {/* Short, restrained hairline down toward the active point — an
            orientation cue, not a second tooltip element. */}
        <span aria-hidden="true" className="mt-1.5 h-2 w-px bg-accent/50" />
      </div>
    </div>
  );
}
