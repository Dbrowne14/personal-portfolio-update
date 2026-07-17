import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — David Browne",
};

export default function ContactPage() {
  return (
    <main className="flex-1 px-7 py-32">
      <h1 className="font-sans text-h1 font-bold tracking-tight text-ink">
        Contact — The Open Position
      </h1>
    </main>
  );
}
