const TICK_COUNT = 28;

// Server Component, aria-hidden — decorative only. Echoes the engineering-
// era tick marks from the Journey chart (components/journey/journey-canvas.tsx,
// the accent fillRect dashes) as the site's closing image (01-vision.md,
// Act IV's transition: "the same tick motif that opened on the chart — the
// line is still running"). Fades and stops short of the far edge rather
// than spanning full width — "unfinished on purpose," per Act V's linework
// doctrine, not a chart to be read, just the line still running.
export function TickMotif() {
  return (
    <div
      aria-hidden="true"
      // M9: overflow-hidden fixes a real page-level horizontal-scroll bug
      // on narrow viewports — 28 fixed-width ticks don't fit under ~530px,
      // and nothing was clipping the excess. Clipping the already-fading
      // tail ticks changes nothing visible (they were nearly transparent
      // there anyway) and if anything reinforces "fading toward the page
      // edge, unfinished on purpose."
      className="mx-auto flex max-w-350 items-center gap-2.5 overflow-hidden px-7"
    >
      {Array.from({ length: TICK_COUNT }).map((_, index) => (
        <span
          key={index}
          className="h-[2px] w-[7px] flex-none bg-accent"
          style={{ opacity: Math.max(0, 1 - index / (TICK_COUNT * 0.7)) }}
        />
      ))}
    </div>
  );
}
