import Image from "next/image";
import { formatMoney } from "@/lib/format";
import { restaurant } from "@/lib/menu";
import { GlassPanel } from "@/components/Glass/GlassPanel";
import { Reveal } from "@/components/Reveal";

export function FamilyStory() {
  const facts = ["Family-run", "North and South Indian", `Sunday buffet · ${formatMoney(restaurant.sundayBuffet.price)}`];
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="relative isolate min-h-[88svh] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_820px]"
    >
      <Image src="/official/storefront.jpg" alt="" fill sizes="100vw" quality={90} className="object-cover object-[60%_50%]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_left,rgba(7,7,7,0.92)_0%,rgba(7,7,7,0.6)_45%,rgba(7,7,7,0.3)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,var(--night),transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--night),transparent)]" />

      <div className="relative mx-auto flex min-h-[88svh] max-w-[1280px] items-center justify-end px-5 py-24 md:px-8">
        <Reveal className="max-w-[600px]">
          <GlassPanel className="rounded-3xl p-7 [--glass-base:rgba(13,12,12,0.6)] md:p-10">
            <h2 id="story-title" className="display text-[36px] text-cream md:text-[48px]">
              A husband, a wife, and a kitchen on Davis Street.
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-cream-2">
              Natraj is run by a husband-and-wife team. They opened on East Davis Street when Indian food was hard to
              find in Culpeper, and they still cook and work the room themselves.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-cream-2">
              The recipes are the ones they grew up with, from both ends of India: the creamy, layered curries of the
              North and the bolder, coconut-and-curry-leaf cooking of the South.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-cream-2">
              On Sundays the buffet turns the room into a small-town ritual, a rotating spread of curries, biryanis,
              breads and sweets, with the owners keeping every dish full.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="At a glance">
              {facts.map((f) => (
                <li key={f} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-cream">
                  {f}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
