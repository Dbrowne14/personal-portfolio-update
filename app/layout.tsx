import type { Metadata } from "next";
import { archivo, ibmPlexMono } from "@/lib/fonts";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "David Browne — Full-stack product engineer",
  description:
    "From evaluating products to shipping them. David Browne is a London-based full-stack engineer building complete products after eight years in technology investment banking.",
};

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
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <div className="flex flex-1 flex-col pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
