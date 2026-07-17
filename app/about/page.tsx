import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — David Browne",
};

export default function AboutPage() {
  return (
    <main className="flex-1 px-7 py-32">
      <h1 className="font-sans text-h1 font-bold tracking-tight text-ink">
        About — The Decision
      </h1>
    </main>
  );
}
