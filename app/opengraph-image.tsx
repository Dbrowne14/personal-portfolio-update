import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "David Browne — Full-stack product engineer";

// M9. No real project photography exists yet (see lib/content/projects.ts),
// so a generated card — not a screenshot — is the honest choice for a
// social preview: typographic, matching the site's own hierarchy (a large
// name, a mono-style bronze kicker, the site's one line of positioning
// copy) rather than faking a product shot. Applies to every route via
// Next's file-convention inheritance — one shared card, not a per-page
// variant, to keep this milestone's scope to hardening rather than a new
// per-page design surface.
//
// Uses system fonts, not next/font's Archivo/IBM Plex Mono: those are only
// available as React components for regular rendering, not as font data
// ImageResponse can load without a separate binary fetch at request time.
// A generic bold sans reads clearly at this size; the trade-off is a
// slightly different typeface from the rest of the site, accepted here
// rather than adding a font-fetching dependency for one static image.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fcfbf8",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            color: "#88470d",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Full-stack product engineer · London
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 120,
            fontWeight: 800,
            color: "#1b1a17",
            letterSpacing: -4,
          }}
        >
          David Browne
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 32,
            color: "rgba(27, 26, 23, 0.6)",
          }}
        >
          From evaluating products to shipping them.
        </div>
      </div>
    ),
    { ...size },
  );
}
