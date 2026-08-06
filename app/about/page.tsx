import type { Metadata } from "next";
import { AnalystEngineerDiptych } from "@/components/about/analyst-engineer-diptych";
import { HowIBuild } from "@/components/about/how-i-build";


const TITLE = "About — David Browne";
const DESCRIPTION =
  "Why I switched from evaluating technology companies to building them.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/about" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AnalystEngineerDiptych />
      <HowIBuild />
    </main>
  );
}
