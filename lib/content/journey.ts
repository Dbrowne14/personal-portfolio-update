export interface Milestone {
  year: number;
  /** Editorial chapter title — the emotional beat, not a CV line. Primary
   *  emphasis in MilestoneList; also what the graph's tooltip shows. */
  headline: string;
  /** The factual role/title. Secondary, quieter emphasis — context for the
   *  headline, not a duplicate of it. */
  subtitle: string;
  /** 0–1, normalized position on the chart's vertical axis. A visual/
   *  narrative device — not a claimed metric. */
  value: number;
  /** 0–1, authored horizontal position. Deliberately not derived from
   *  `year` — the graph is narrative-weighted, not a strict timeline (see
   *  the implementation log). The engineering phase spans roughly half the
   *  graph despite covering the fewest real years, on purpose. */
  t: number;
  era: "banking" | "engineering";
  /** Marks the 2025 inflection point — the last milestone of the curve,
   *  the first point the quantized ticks are measured from. */
  isSwitch?: boolean;
}

// Five milestones. Years and subtitles are each traceable to a stated fact
// rather than invented; headlines are deliberately not — they're the
// editorial chapter titles ("The decision," not "2025 — role change"), the
// emotional read of the same fact the subtitle states plainly underneath.
// - 2016: the career's starting point — an analyst role preceding the move
//   into technology investment banking the following year.
// - 2017: derived, not stated outright — 2025 (the only year the frozen
//   docs actually name, in 01-vision.md's Act II) minus the "approximately
//   eight years" in creative-direction.md / content-brief.md.
// - 2022: a senior-role bridge point — reaching VP level in tech
//   investment banking before the switch, not merely another job-title
//   change.
// - 2025: stated directly in 01-vision.md ("the 2025 switch").
// - 2026: the site's established "now" — matches Footer's "© 2026" and
//   Hero's "Full-stack product engineer" kicker, already shipped in M1/M2.
export const journeyMilestones: Milestone[] = [
  {
    year: 2016,
    headline: "Learning the markets",
    subtitle: "Fixed Income Analyst",
    value: 0.06,
    t: 0,
    era: "banking",
  },
  {
    year: 2017,
    headline: "Advising companies",
    subtitle: "Investment Banking Associate",
    value: 0.16,
    t: 0.14,
    era: "banking",
  },
  {
    year: 2022,
    headline: "Technology, exclusively",
    subtitle: "Technology Investment Banking — Vice President",
    value: 0.34,
    t: 0.3,
    era: "banking",
  },
  {
    year: 2025,
    headline: "The decision",
    subtitle: "Left banking to become a full-stack engineer",
    value: 0.52,
    t: 0.56,
    era: "banking",
    isSwitch: true,
  },
  {
    year: 2026,
    headline: "Shipping products",
    subtitle: "Building and delivering production software",
    value: 0.92,
    t: 1,
    era: "engineering",
  },
];
