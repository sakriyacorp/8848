import { site } from "@/config/site";
import { isOn } from "@/config/features";
import { TESTIMONIALS } from "@/data/testimonials";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { Counter } from "@/components/setpieces/Counter";
import { PostcardWall } from "@/components/testimonials/PostcardWall";
import { Postcard, Stars } from "@/components/testimonials/Postcard";

/* Postcards from the trail: what guests wrote home. */
export function TestimonialsSection() {
  return (
    <section id="postcards" aria-labelledby="postcards-title" className="walnut relative overflow-hidden py-24 md:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(238,211,165,0.12),transparent_70%),linear-gradient(180deg,rgba(14,10,7,0.9),rgba(14,10,7,0.74)_50%,rgba(14,10,7,0.92))]" />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal as="p" className="eyebrow text-brass">
              Postcards from the trail
            </Reveal>
            <SplitHeading id="postcards-title" text="Wish you were *here.*" className="display mt-4 text-[clamp(2.7rem,7vw,5.2rem)] text-brass-hi" />
          </div>
          <Reveal delay={0.1} className="flex items-center gap-4">
            <p className="display text-[64px] leading-none text-brass-hi md:text-[76px]">
              <Counter to={site.rating.value} decimals={1} duration={1.6} />
            </p>
            <div>
              <Stars rating={site.rating.value} size={18} />
              <p className="mt-1.5 text-[14px] text-muted">
                {site.rating.label} <span className="sr-only">(sample rating)</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
      <div className="container-x relative mt-8">
        {isOn("postcards") ? (
          <PostcardWall items={TESTIMONIALS} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.slice(0, 6).map((t, i) => (
              <Postcard key={t.id} t={t} index={i} />
            ))}
          </div>
        )}
        <p className="mt-6 text-center text-[12.5px] text-muted/80">Sample reviews for the demo · tap a postcard to hold it still.</p>
      </div>
    </section>
  );
}
