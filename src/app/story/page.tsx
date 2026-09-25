import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EVEREST, site } from "@/config/site";
import { isOn } from "@/config/features";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { RouteMap } from "@/components/setpieces/RouteMap";
import { Counter } from "@/components/setpieces/Counter";
import { LampLight } from "@/components/setpieces/LampLight";
import { StoryExtras } from "@/components/story/StoryExtras";

export const metadata: Metadata = {
  title: "Our story",
  description: "8848 is the height of Sagarmatha in metres, and the name over our door. The story of a Himalayan kitchen and bar on Reservoir Street, Harrisonburg.",
};

/* PLACEHOLDER — the family story below is written as tasteful boilerplate. Replace with the
   owners' own words. */
const CHAPTERS = [
  {
    kicker: "Kathmandu",
    title: "It starts with steam.",
    body: [
      "Anyone who grew up in Kathmandu can tell you where the best momos are, and will argue about it. The ones we remember were in small rooms with fogged windows, an aluminium steamer stacked five high, and a bowl of sesame-tomato achar so good you'd order another plate just to finish it.",
      "That's the kitchen we wanted to bring to the Shenandoah Valley: hand-pleated, served fast, eaten hot.",
    ],
  },
  {
    kicker: "The trail",
    title: "Food that climbs.",
    body: [
      "Walk the trail to Everest Base Camp and you eat the same things the Sherpa guides eat: dal bhat twice a day, thukpa when the wind comes up, masala chiya at every teahouse. Kathmandu's Indo-Chinese stalls came up the trail too, so there's chilli chicken at 3,800 metres.",
      "Our menu follows that route, camp by camp. It's why the menu page has an altitude.",
    ],
  },
  {
    kicker: "Reservoir Street",
    title: "Brass, walnut and a lamp on.",
    body: [
      "The room is dark wood and brushed brass, lamp-lit, a little formal and very warm, like the old hotels in Kathmandu where climbers used to sign the wall. There's a full bar with Himalayan spice behind it, and it stays open late on weekends.",
      "Come in cold. Leave full.",
    ],
  },
];

export default function StoryPage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        {isOn("lampLight") && <LampLight />}
        <div className="container-x relative">
          <Reveal as="p" className="eyebrow text-brass">
            Our story
          </Reveal>
          <SplitHeading as="h1" text="From Kathmandu to *Reservoir Street.*" className="display mt-4 max-w-[15ch] text-[clamp(2.9rem,8vw,6.2rem)] text-brass-hi" />
          <Reveal delay={0.15} as="p" className="mt-6 max-w-[50ch] text-[17px] leading-relaxed text-text/80">
            {site.fullName} is named for the height of <span lang="ne" className="np text-brass-hi">{EVEREST.nepali}</span> — the mountain the world calls Everest — and cooks the food of the trail that leads up it.
          </Reveal>
        </div>
        <div className="container-x relative mt-12 md:mt-16">
          {isOn("routeMap") ? (
            <RouteMap />
          ) : null}
        </div>
      </section>

      <section className="paper relative py-20 md:py-28" aria-label="Chapters">
        <div className="container-x grid gap-16 md:gap-24">
          {CHAPTERS.map((c, i) => (
            <article key={c.title} className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
              <Reveal>
                <p className="caps text-[10.5px] text-bronze">
                  {String(i + 1).padStart(2, "0")} · {c.kicker}
                </p>
                <h2 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] text-choc">{c.title}</h2>
              </Reveal>
              <Reveal delay={0.1} className="space-y-4 text-[17px] leading-[1.7] text-bronze md:pt-6 md:text-[18px]">
                {c.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-night py-20 md:py-28" aria-labelledby="numbers-title">
        <div className="container-x">
          <h2 id="numbers-title" className="eyebrow text-brass">
            The numbers
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[26px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: <Counter to={EVEREST.metres} decimals={2} />, u: "metres", l: "height of Sagarmatha, re-measured in 2020" },
              { v: <Counter to={EVEREST.feet} decimals={1} />, u: "feet", l: "for the Americans at the table" },
              { v: <Counter to={12476} />, u: "kilometres", l: "Kathmandu to Harrisonburg, as the crow flies" },
              { v: <Counter to={2} duration={1} />, u: "kitchens", l: "one wok, one tandoor, both on fire" },
            ].map((s, i) => (
              <div key={i} className="bg-night/95 p-6 md:p-8">
                <p className="display text-[clamp(2.2rem,5vw,3.4rem)] leading-none text-brass-hi">{s.v}</p>
                <p className="caps mt-2 text-[10px] text-brass">{s.u}</p>
                <p className="mt-1 text-[13.5px] text-muted">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoryExtras />

      <section className="relative overflow-hidden bg-night py-20 md:py-28">
        <div className="container-x flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <SplitHeading text="Hungry yet? *Start climbing.*" className="display max-w-[14ch] text-[clamp(2.4rem,6vw,4.4rem)] text-brass-hi" />
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-brass px-6 py-3.5 text-[15px]">
              Open the menu <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/visit#reserve" className="btn btn-ghost px-6 py-3.5 text-[15px]">
              Book a table
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
