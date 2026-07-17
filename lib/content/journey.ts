export interface Milestone {
  year: number;
  label: string;
  /** 0–1, normalized position on the chart's vertical axis. A visual/
   *  narrative device — not a claimed metric. */
  value: number;
  era: "banking" | "engineering";
  /** Marks the 2025 inflection point — the last milestone of the curve,
   *  the first point the quantized ticks are measured from. */
  isSwitch?: boolean;
}

// Three milestones, each traceable to a stated fact rather than invented:
// - 2017: derived, not stated outright — 2025 (the only year the frozen
//   docs actually name, in 01-vision.md's Act II) minus the "approximately
//   eight years" in creative-direction.md / content-brief.md.
// - 2025: stated directly in 01-vision.md ("the 2025 switch").
// - 2026: the site's established "now" — matches Footer's "© 2026" and
//   Hero's "Full-stack product engineer" kicker, already shipped in M1/M2.
//
// This is deliberately thinner than the reference material's multi-stage
// career narrative (which invents intermediate years and job-title changes
// nowhere stated in the canonical docs). The curve's organic, hand-drawn
// quality comes from procedural wobble applied along its length in
// JourneyCanvas, not from extra fabricated data points.
export const journeyMilestones: Milestone[] = [
  {
    year: 2017,
    label: "Technology investment banking",
    value: 0.18,
    era: "banking",
  },
  {
    year: 2025,
    label: "The switch — banking to engineering",
    value: 0.52,
    era: "banking",
    isSwitch: true,
  },
  {
    year: 2026,
    label: "Full-stack product engineer",
    value: 0.92,
    era: "engineering",
  },
];
