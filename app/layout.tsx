import type { Metadata } from "next";
import { archivo, ibmPlexMono } from "@/lib/fonts";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import "./globals.css";

// M9: davidbrowne.dev is a placeholder production domain — the real one
// needs setting here (and in Vercel's project settings) before launch. See
// the M9 completion report's environment/deployment checklist.
const SITE_URL = "https://davidbrowne.dev";
const SITE_NAME = "David Browne";
const SITE_TITLE = "David Browne — Full-stack product engineer";
const SITE_DESCRIPTION =
  "From evaluating products to shipping them. David Browne is a London-based full-stack engineer building complete products after eight years in technology investment banking.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Person + WebSite structured data (M9). Site-wide in the root layout
// rather than duplicated per page, since both describe the site/person as
// a whole, not page-specific content. Every field here is a fact already
// established elsewhere in the codebase (hero copy, footer's location
// line) — no sameAs is included, since GitHub/LinkedIn are still
// placeholder "#" hrefs (components/contact/elsewhere-card.tsx,
// components/chrome/footer.tsx) and emitting them as structured data
// would be false; add sameAs once those are real URLs.
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    jobTitle: "Full-stack product engineer",
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "London",
      addressCountry: "GB",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${ibmPlexMono.variable} h-full antialiased`}
      // The inline script below intentionally sets data-page on this
      // element before hydration, which the server-rendered HTML never
      // has — otherwise identical to the standard theme-flash-prevention
      // pattern. This is the expected mismatch that prop exists for.
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before hydration, on the initial document load only (client-
          side navigation into "/" is handled by HeroStage's own mount
          effect instead). Without this, the server-rendered HTML has no
          data-page attribute at all, so the browser resolves
          .masthead-name to its default opacity in the first style pass —
          and once that value is established, CSS transitions animate to
          it even if HeroStage sets the attribute before paint. Setting it
          here, before any style resolution happens, means there is never a
          prior value for the transition to animate from.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if (location.pathname === "/") document.documentElement.dataset.page = "home";',
          }}
        />
        {/*
          Theme (M8, ADR-002/ADR-011). Runs before first paint so data-theme
          is already correct when CSS is first evaluated — no flash of the
          wrong theme, no React state, no Context. Reads a stored choice
          first; falls back to the system preference only when the visitor
          has never toggled it here. ThemeToggle is the only other place
          this attribute is ever written.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("theme");var t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
        {structuredData.map((entry) => (
          <script
            key={entry["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/*
          Skip link (M9, WCAG 2.4.1). The only visible-on-focus element on
          the page — sr-only until it receives keyboard focus, at which
          point it's the very first thing Tab reaches, ahead of the header's
          masthead link, nav, and theme toggle. #main-content is focusable
          (tabIndex={-1} below) so focus actually lands there, not just a
          scroll position.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:border focus:border-ink focus:bg-ivory focus:px-4 focus:py-2 focus:font-mono focus:text-meta focus:text-ink focus:uppercase focus:tracking-[0.1em]"
        >
          Skip to content
        </a>
        <Header />
        <div
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 flex-col pt-16 focus:outline-none"
        >
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
