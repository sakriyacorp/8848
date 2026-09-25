import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/lib/menu";
import { HoursLine } from "@/components/Hero/HoursLine";
import { HeroSlides } from "@/components/Hero/HeroSlides";

/* Page-load sequence is CSS-driven (hero-zoom / hero-rise / hero-fade in globals.css) so the
   headline paints before hydration. The first photo is the LCP image; HeroSlides layers the
   rest in later. */
export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-void">
      {/* Deliberately short of the viewport: Chrome drops full-viewport images as "background" and would make the headline the LCP instead. The gap sits under the bottom fade. */}
      <div className="hero-zoom absolute inset-x-0 top-0 h-[calc(100%-72px)]">
        <div className="hero-drift absolute inset-0">
          <Image src="/official/hero-curry.jpg" alt="" fill priority fetchPriority="high" sizes="100vw" quality={90} className="object-cover" />
        </div>
        <HeroSlides />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top_right,rgba(7,7,7,0.94)_0%,rgba(7,7,7,0.62)_38%,rgba(7,7,7,0.2)_68%,rgba(7,7,7,0.05)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(to_top,var(--night)_80px,transparent)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
        <Image
          src="/brand/natraj-logo.png"
          alt="Natraj Indian Cuisine"
          width={531}
          height={334}
          sizes="(max-width: 767px) 150px, 210px"
          className="hero-rise mb-7 h-[94px] w-auto self-start drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] [--d:0.08s] md:h-[132px]"
        />
        <h1 className="display max-w-[12ch] text-[56px] text-cream md:text-[88px]">
          <span className="hero-rise block [--d:0.16s]">Indian cooking</span>
          <span className="hero-rise block [--d:0.24s]">on Davis Street.</span>
        </h1>
        <p className="hero-rise mt-6 text-[17px] text-cream-2 [--d:0.32s]">
          <HoursLine hours={restaurant.hours} />
        </p>
        <div className="hero-fade mt-8 flex flex-wrap gap-3 [--d:0.5s]">
          <Link href="/menu" className="btn-order px-7 py-3.5 text-[15px]">
            Order
          </Link>
          <a href={restaurant.reservationUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-6 py-3 text-[15px]">
            Reserve a table
          </a>
        </div>
      </div>
    </section>
  );
}
