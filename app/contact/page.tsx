import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { ElsewhereCard } from "@/components/contact/elsewhere-card";
import { TickMotif } from "@/components/contact/tick-motif";

const TITLE = "Contact — David Browne";
const DESCRIPTION =
  "Open to full-time engineering roles, recruiter conversations, and product or technical discussions.";

// Static, not generateMetadata: correct regardless of ?sent=true, since
// alternates.canonical always points at the parameterless URL — the
// confirmation state doesn't need its own metadata variant.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/contact" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

// searchParams is Promise-based in this Next version and must be awaited
// (see app/work/[slug]/page.tsx for the same pattern with params).
//
// The confirmation is server-rendered from ?sent=true, not client state
// (03-roadmap.md's architectural decision for this milestone) — the Server
// Action redirects here on a confirmed send regardless of whether the
// submitting form was ever hydrated, so a JS-disabled visitor gets the
// same confirmation via a real page navigation. It replaces the form
// rather than sitting alongside it, since once a message has been sent
// there is nothing left to submit.
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="flex flex-1 flex-col border-t border-ink/16 bg-ivory px-7 py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-350 grid-cols-1 gap-16 md:grid-cols-[3fr_2fr] md:items-start md:gap-20">
        {sent === "true" ? (
          <div className="reveal-on-scroll">
            <p className="font-mono text-meta text-accent uppercase tracking-[0.14em]">
              The open position
            </p>
            <h1 className="mt-4 max-w-2xl text-h1 font-bold text-ink text-balance">
              <span className="text-accent">Sent.</span>
              {" "}I&rsquo;ll reply soon.
            </h1>
            <p className="mt-6 max-w-md text-body text-ink/70">
              Thanks for reaching out — I read every message myself and
              usually reply within a couple of days.
            </p>
          </div>
        ) : (
          <ContactForm />
        )}

        <ElsewhereCard />
      </div>

      <div className="mt-24">
        <TickMotif />
      </div>
    </main>
  );
}
