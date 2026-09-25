import { isOn } from "@/config/features";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/setpieces/Intro";

export default function HomePage() {
  return (
    <>
      {isOn("intro") && <Intro />}
      <Hero />
      <section className="relative z-10 flex min-h-[80svh] items-center justify-center bg-night">
        <p className="display text-[40px] text-brass-hi">Base camp.</p>
      </section>
    </>
  );
}
