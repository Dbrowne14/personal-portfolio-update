import type { Metadata } from "next";
import { DecisionIntro } from "@/components/about/decision-intro";

export const metadata: Metadata = {
  title: "About — David Browne",
  description:
    "Why I switched from evaluating technology companies to building them.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <DecisionIntro />
    </main>
  );
}
