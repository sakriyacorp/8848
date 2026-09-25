import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { availableDishImages } from "@/lib/dish-images";
import { byCategory } from "@/lib/menu";
import { formatPrice } from "@/lib/format";
import { formatWindows } from "@/lib/hours";
import { site } from "@/config/site";
import { isOn } from "@/config/features";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { NightSky } from "@/components/setpieces/NightSky";
import { MountainScene } from "@/components/setpieces/MountainScene";
import { DishImage } from "@/components/menu/DishImage";
import { BarPours } from "@/components/bar/BarPours";
import { Constellation } from "@/components/setpieces/Constellation";
import { ButterLamp } from "@/components/setpieces/ButterLamp";

export const metadata: Metadata = {
  title: "The Bar",
  description: "Signature cocktails with timur pepper, rhododendron and brown-butter rum, Nepali lagers, wine and zero-proof pours. Open late on weekends in Harrisonburg.",
};

const KIND_LABEL = { beer: "Lagers & local taps", wine: "Wine by the glass", zero: "Zero-proof", spirit: "Neat" } as const;

export default function BarPage() {
  const available = new Set(availableDishImages());
  const bar = byCategory("bar");
  const cocktails = bar.filter((i) => i.kind === "cocktail");
  const rest = (["beer", "wine", "zero", "spirit"] as const).map((k) => ({ k, items: bar.filter((i) => i.kind === k) }));

  return (
    <div className="bar-page relative bg-[#07060a]">
      {/* ---------- sky ---------- */}
      <section aria-labelledby="bar-title" className="relative flex min-h-[100svh] items-end overflow-hidden pb-[16svh] pt-32">
        {isOn("nightSky") ? <NightSky /> : <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_60%_at_60%_20%,rgba(242,233,207,0.08),transparent)]" />}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[38%] md:h-[44%]">
          <MountainScene phase="night" arc={false} transparent dim />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,#07060a_0%,rgba(7,6,10,0.78)_30%,rgba(7,6,10,0.15)_62%,transparent_80%),radial-gradient(70%_60%_at_20%_75%,rgba(7,6,10,0.7),transparent_70%)]" />
        {isOn("constellation") && <Constellation />}
        <div className="container-x relative">
          <Reveal as="p" className="eyebrow text-brass">
            8,848 m · after dark
          </Reveal>
          <SplitHeading as="h1" id="bar-title" text="The *bar.*" className="display mt-4 text-[clamp(4rem,16vw,11rem)] leading-[0.9] text-brass-hi" />
          <Reveal delay={0.15} as="p" className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-text/80">
            Himalayan spice behind the bar, Nepali lagers in the fridge, and the stars out over the peaks. Stay for one more.
          </Reveal>
          <Reveal delay={0.25} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-muted">
            <span className="flex items-center gap-2">
              <ButterLamp lit size={14} /> Fri–Sat till midnight
            </span>
            <span>Tue–Thu {formatWindows(site.barHours.tue ?? [])}</span>
            <span>21+ with ID</span>
          </Reveal>
          {(isOn("constellation") || isOn("nightSky")) && (
            <p className="caps mt-8 text-[10px] text-brass/90" aria-hidden="true">
              {isOn("constellation") && <span className="hidden md:inline">Press and hold the sky · </span>}
              {isOn("nightSky") && <span>Catch a shooting star</span>}
            </p>
          )}
        </div>
      </section>

      {/* ---------- pours ---------- */}
      <section aria-labelledby="pours-title" className="relative py-20 md:py-28">
        <div aria-hidden="true" className="bar-bokeh absolute inset-0" />
        <div className="container-x relative">
          <Reveal as="p" className="eyebrow text-brass">
            Signature pours
          </Reveal>
          <SplitHeading id="pours-title" text="Seven drinks with *altitude.*" className="display mt-4 max-w-[16ch] text-[clamp(2.5rem,6vw,4.6rem)] text-brass-hi" />
          {isOn("cocktailPour") && <BarPours ids={["golden-hour", "timur-margarita", "rhododendron-spritz", "yak-and-yeti", "sagarmatha-old-fashioned"]} />}
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cocktails.map((c, i) => (
              <Reveal as="li" key={c.id} delay={(i % 3) * 0.08} className="group glass flex gap-4 overflow-hidden rounded-[24px] p-3 [--glass-base:rgba(10,8,10,0.6)]">
                <DishImage item={c} available={available.has(c.img)} sizes="120px" className="h-[120px] w-[104px] shrink-0 rounded-[18px]" />
                <div className="min-w-0 py-1 pr-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="display text-[22px] leading-tight text-brass-hi">{c.name}</p>
                    <p className="num text-[15px] text-brass">{formatPrice(c.price)}</p>
                  </div>
                  <p className="mt-1.5 text-[14px] leading-snug text-muted">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- the list ---------- */}
      <section aria-labelledby="list-title" className="relative pb-24 md:pb-32">
        <div className="container-x">
          <h2 id="list-title" className="sr-only">
            Beer, wine and zero-proof
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {rest.map(({ k, items }, gi) => (
              <Reveal key={k} delay={gi * 0.06} className="rounded-[26px] border border-line bg-[linear-gradient(180deg,rgba(242,233,207,0.04),rgba(242,233,207,0.01))] p-6 md:p-8">
                <p className="caps text-[10.5px] text-brass">{KIND_LABEL[k]}</p>
                <ul className="mt-4 space-y-4">
                  {items.map((i) => (
                    <li key={i.id}>
                      <div className="flex items-baseline gap-2">
                        <span className="display text-[21px] text-brass-hi">{i.name}</span>
                        <span aria-hidden="true" className="mb-[6px] min-w-3 flex-1 border-b border-dotted border-brass/30" />
                        <span className="num text-[15px] text-brass">{formatPrice(i.price)}</span>
                      </div>
                      <p className="mt-0.5 text-[14px] text-muted">{i.desc}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="brass sheen mt-10 flex flex-col gap-4 rounded-[26px] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="caps text-[10px] text-bronze">Base Camp Hour</p>
              <p className="display mt-1 text-[30px] leading-tight text-choc md:text-[36px]">Tue–Thu, 4–6 PM.</p>
              <p className="mt-1 text-[15px] text-bronze">$2 off Nepali lagers, $10 steamed momos, half-price chiya. {/* PLACEHOLDER */}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/visit#reserve" className="btn bg-choc px-6 py-3.5 text-[15px] text-brass-hi hover:-translate-y-0.5">
                <CalendarDays size={16} aria-hidden="true" /> Book the bar
              </Link>
              <Link href="/menu#cat-bar" className="btn btn-ink px-6 py-3.5 text-[15px]">
                Full drinks list <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
