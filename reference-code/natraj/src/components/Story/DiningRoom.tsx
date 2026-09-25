import Image from "next/image";
import { restaurant } from "@/lib/menu";
import { GlassPanel } from "@/components/Glass/GlassPanel";
import { Reveal } from "@/components/Reveal";

export function DiningRoom() {
  return (
    <section
      id="dining"
      aria-labelledby="dining-title"
      className="relative isolate mt-20 min-h-[82svh] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_760px] md:mt-28"
    >
      <Image src="/official/dining-room.jpg" alt="" fill sizes="100vw" quality={90} className="object-cover" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(7,7,7,0.92)_0%,rgba(7,7,7,0.6)_45%,rgba(7,7,7,0.25)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,var(--night),transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--night),transparent)]" />

      <div className="relative mx-auto flex min-h-[82svh] max-w-[1280px] items-center px-5 py-24 md:px-8">
        <Reveal className="max-w-[560px]">
          <GlassPanel className="rounded-3xl p-7 [--glass-base:rgba(13,12,12,0.58)] md:p-10">
            <h2 id="dining-title" className="display text-[36px] text-cream md:text-[48px]">
              Our dining room on East Davis Street.
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-cream-2">
              Ornate tin ceilings, warm brick walls and brass chandeliers, in a restored building on Culpeper&apos;s
              main street. The tables are set with white linen and the light stays low, so a Tuesday dinner feels
              like an occasion.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-cream-2">
              It suits a quick weeknight curry as well as a birthday. For gatherings, the whole room can be reserved.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={restaurant.reservationUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-6 py-3 text-[15px]">
                Reserve a table
              </a>
              <a
                href={restaurant.links.privateEvents}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full px-4 py-3 text-[15px] font-medium text-cream-2 transition-colors duration-150 hover:text-cream"
              >
                Private events
              </a>
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
