import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EVEREST } from "@/config/site";
import { Reveal, SplitHeading } from "@/components/fx/Reveal";
import { Counter } from "@/components/setpieces/Counter";
import { LampLight } from "@/components/setpieces/LampLight";
import { isOn } from "@/config/features";

/* The number over the door, told short. Dark walnut room with engraved contour lines that only
   show where the lamp (your cursor or finger) is. */
export function StorySnippet() {
  return (
    <section id="story" aria-labelledby="story-title" className="relative overflow-hidden bg-night py-24 md:py-36">
      {isOn("lampLight") && <LampLight />}
      <div className="container-x relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <Reveal as="p" className="eyebrow text-brass">
            The number over the door
          </Reveal>
          <SplitHeading id="story-title" text="Eight thousand, eight hundred and forty-eight *metres.*" className="display mt-5 max-w-[16ch] text-[clamp(2.5rem,6.4vw,5rem)] leading-[1.02] text-brass-hi" />
          <Reveal delay={0.15} className="mt-8 max-w-[54ch] space-y-4 text-[16.5px] leading-relaxed text-text/80 md:text-[17.5px]">
            <p>
              The height of <span lang="ne" className="np text-brass-hi">{EVEREST.nepali}</span>, which you probably know as Everest. Our food comes from the kitchens on the way up it: momo shops in Kathmandu, teahouse dal bhat in Namche, chilli-fired noodle stalls in Thamel.
            </p>
            <p>We cook all of it on Reservoir Street, and keep the bar open late for anyone who comes in from the cold.</p>
          </Reveal>
          <Reveal delay={0.25}>
            <Link href="/story" className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-brass-hi">
              <span className="border-b border-brass/40 pb-0.5 transition-colors group-hover:border-brass-hi">Read our story</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line">
          {[
            { v: <Counter to={EVEREST.metres} decimals={2} />, u: "metres", l: "Sagarmatha, summit" },
            { v: <Counter to={EVEREST.feet} decimals={1} />, u: "feet", l: "the same, in feet" },
            { v: <Counter to={7760} />, u: "miles", l: "Kathmandu → Reservoir St" },
            { v: <Counter to={40} duration={1.4} />, u: "pleats", l: "on a proper momo, give or take" },
          ].map((s, i) => (
            <div key={i} className="bg-night/95 p-5 md:p-7">
              <p className="display text-[clamp(1.9rem,4.4vw,3rem)] leading-none text-brass-hi">{s.v}</p>
              <p className="caps mt-2 text-[10px] text-brass">{s.u}</p>
              <p className="mt-1 text-[13px] text-muted">{s.l}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
