import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { availableDishImages } from "@/lib/dish-images";
import { picks } from "@/lib/menu";
import { formatPrice } from "@/lib/format";
import { stars } from "@/lib/ridge";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { DishImage } from "@/components/menu/DishImage";
import { MountainScene } from "@/components/setpieces/MountainScene";

const DRINKS = ["yak-and-yeti", "timur-margarita", "sagarmatha-old-fashioned"];

/* The bar, glimpsed: the summit at night, three pours, and a door. */
export function BarTeaser() {
  const available = new Set(availableDishImages());
  const drinks = picks(DRINKS);
  const field = stars(90, 21, 100, 60);
  return (
    <section id="bar" aria-labelledby="bar-title" className="relative isolate overflow-hidden bg-[#08070a] py-24 md:py-36">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[55%] opacity-70 md:h-[70%]">
        <MountainScene phase="night" parallax arc={false} transparent dim />
      </div>
      <div aria-hidden="true" className="absolute inset-0">
        {field.map((s, i) => (
          <span
            key={i}
            className="bar-star absolute rounded-full bg-brass-hi"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 1.4, height: s.r * 1.4, opacity: s.o, ["--o" as string]: s.o, animationDelay: `${s.d}s` }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,#08070a_0%,rgba(8,7,10,0.2)_45%,rgba(8,7,10,0.85)_100%)]" />
      <div className="container-x relative">
        <Reveal as="p" className="eyebrow text-brass">
          8,848 m · after dark
        </Reveal>
        <SplitHeading id="bar-title" text="Last orders at the *summit.*" className="display mt-4 max-w-[14ch] text-[clamp(2.7rem,7vw,5.6rem)] text-brass-hi" />
        <Reveal delay={0.1} as="p" className="mt-5 max-w-[46ch] text-[16.5px] leading-relaxed text-text/80">
          Timur pepper in the margarita, brown-butter rum in the Yak &amp; Yeti, Nepali lagers ice-cold. Open till midnight on Fridays and Saturdays.
        </Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-3 md:mt-16 md:gap-6">
          {drinks.map((d, i) => (
            <Reveal as="li" key={d.id} delay={0.1 + i * 0.08} className="group glass overflow-hidden rounded-[24px] [--glass-base:rgba(8,7,10,0.55)]">
              <DishImage item={d} available={available.has(d.img)} sizes="(max-width: 639px) 100vw, 33vw" className="aspect-[4/3] w-full" />
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="display text-[23px] text-brass-hi">{d.name}</p>
                  <p className="num text-[15px] text-brass">{formatPrice(d.price)}</p>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[14px] text-muted">{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={0.3} className="mt-10">
          <Link href="/bar" className="btn btn-brass px-7 py-4 text-[15.5px]">
            Step into the bar <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
