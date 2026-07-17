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

function yearRange(milestones: Milestone[]) {
  const years = milestones.map((m) => m.year);
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function yearToFraction(year: number, milestones: Milestone[]): number {
  const { min, max } = yearRange(milestones);
  return (year - min) / (max - min);
}

export function fractionToYear(t: number, milestones: Milestone[]): number {
  const { min, max } = yearRange(milestones);
  return min + t * (max - min);
}

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
  milestones: Milestone[],
  bounds: ChartBounds,
): { x: number; y: number } {
  return pointForFraction(
    yearToFraction(milestone.year, milestones),
    milestone.value,
    bounds,
  );
}

// Linear interpolation of value between the two milestones bracketing a
// given time fraction — used to draw the curve between sparse data points.
export function valueAtFraction(t: number, milestones: Milestone[]): number {
  const sorted = [...milestones].sort((a, b) => a.year - b.year);
  const fractions = sorted.map((m) => yearToFraction(m.year, milestones));

  for (let i = 0; i < sorted.length - 1; i++) {
    if (t >= fractions[i] && t <= fractions[i + 1]) {
      const span = fractions[i + 1] - fractions[i] || 1;
      const localT = (t - fractions[i]) / span;
      return sorted[i].value + (sorted[i + 1].value - sorted[i].value) * localT;
    }
  }
  return sorted[sorted.length - 1].value;
}
