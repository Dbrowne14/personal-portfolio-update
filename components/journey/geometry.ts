import type { Milestone } from "@/lib/content/journey";

export interface ChartBounds {
  width: number;
  height: number;
}

export const PAD_X = 32;
export const PAD_TOP = 40;
export const PAD_BOTTOM = 40;

// Pure mapping functions, shared by JourneyCanvas's own draw calls and its
// DOM overlay (year labels, scrub tooltip) — the one thing that guarantees
// the canvas and the real text positioned over it can never disagree.
// 01-vision.md's Act II doctrine ("text never sits inside canvases")
// depends on this: labels are DOM elements computed from the same
// coordinates the curve is drawn from, not a second, separately-tuned copy.
//
// Horizontal position comes from each milestone's authored `t`, not a
// year-based calculation — the graph is deliberately narrative-weighted,
// not a strict timeline (see lib/content/journey.ts and the M3 log entry).

export function pointForFraction(
  t: number,
  value: number,
  bounds: ChartBounds,
): { x: number; y: number } {
  const x = PAD_X + t * (bounds.width - PAD_X * 2);
  const y =
    bounds.height -
    PAD_BOTTOM -
    value * (bounds.height - PAD_TOP - PAD_BOTTOM);
  return { x, y };
}

export function pointForMilestone(
  milestone: Milestone,
  bounds: ChartBounds,
): { x: number; y: number } {
  return pointForFraction(milestone.t, milestone.value, bounds);
}

// Linear interpolation of value between the two milestones bracketing a
// given horizontal position — used to draw the curve between sparse data
// points.
export function valueAtFraction(t: number, milestones: Milestone[]): number {
  const sorted = [...milestones].sort((a, b) => a.t - b.t);

  for (let i = 0; i < sorted.length - 1; i++) {
    if (t >= sorted[i].t && t <= sorted[i + 1].t) {
      const span = sorted[i + 1].t - sorted[i].t || 1;
      const localT = (t - sorted[i].t) / span;
      return (
        sorted[i].value + (sorted[i + 1].value - sorted[i].value) * localT
      );
    }
  }
  return sorted[sorted.length - 1].value;
}
