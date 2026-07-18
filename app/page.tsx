import { Hero } from "@/components/hero/hero";
import { Journey } from "@/components/journey/journey";
import { WorkTeaser } from "@/components/work/work-teaser";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Journey />
      <WorkTeaser />
    </main>
  );
}
