import { isOn } from "@/config/features";
import { availableDishImages } from "@/lib/dish-images";
import { byId, hasSpiceControl } from "@/lib/menu";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { MomoBuilder } from "@/components/setpieces/MomoBuilder";
import { Thali } from "@/components/setpieces/Thali";
import { PrayerWheel, type OracleDish } from "@/components/setpieces/PrayerWheel";

/* Three things to play with under the menu: build a momo, take a dal bhat apart, and let the
   prayer wheel choose. Each is its own set-piece behind its own flag. */

const ORACLE: [string, string][] = [
  ["jhol-momo", "A warm broth is in your future."],
  ["dal-bhat-veg", "Patience, and seconds. Always seconds."],
  ["c-momo", "Fortune favours the bold. So does the chilli."],
  ["chicken-thukpa", "A long road ahead. Take noodles."],
  ["chicken-sekuwa", "Smoke and fire will clear your head."],
  ["butter-tea", "The mountain asks you to slow down."],
  ["juju-dhau", "Something sweet is on its way to you."],
  ["sagarmatha-old-fashioned", "The summit is closer than you think."],
];

export function MenuExtras() {
  const available = new Set(availableDishImages());
  const oracle: OracleDish[] = ORACLE.flatMap(([id, fortune]) => {
    const d = byId(id);
    return d ? [{ id: d.id, name: d.name, price: d.price, img: d.img, available: available.has(d.img), spiceable: hasSpiceControl(d), spice: d.spice, fortune }] : [];
  });

  return (
    <div className="mt-24 grid gap-24 md:mt-32 md:gap-32">
      {isOn("momoBuilder") && (
        <section aria-labelledby="builder-title">
          <Reveal as="p" className="eyebrow text-brass">
            Kathmandu · 1,400 m
          </Reveal>
          <SplitHeading id="builder-title" text="Pleat your *own.*" className="display mt-4 text-[clamp(2.5rem,6vw,4.4rem)] text-brass-hi" />
          <Reveal delay={0.1} as="p" className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-text/80">
            Choose a filling and how it&rsquo;s cooked. We&rsquo;ll pleat ten to order, eighteen folds each.
          </Reveal>
          <div className="mt-10">
            <MomoBuilder />
          </div>
        </section>
      )}

      {isOn("thali") && (
        <section aria-labelledby="thali-title">
          <Reveal as="p" className="eyebrow text-brass">
            Namche · 3,440 m
          </Reveal>
          <SplitHeading id="thali-title" text="Dal bhat, *explained.*" className="display mt-4 text-[clamp(2.5rem,6vw,4.4rem)] text-brass-hi" />
          <Reveal delay={0.1} as="p" className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-text/80">
            The meal that climbs Everest, from above. Tap anything on the plate.
          </Reveal>
          <div className="mt-10">
            <Thali />
          </div>
        </section>
      )}

      {isOn("prayerWheel") && oracle.length > 0 && (
        <section aria-labelledby="wheel-title">
          <Reveal as="p" className="eyebrow text-brass">
            Tengboche · 3,867 m
          </Reveal>
          <SplitHeading id="wheel-title" text="Can’t decide? *Ask the wheel.*" className="display mt-4 text-[clamp(2.5rem,6vw,4.4rem)] text-brass-hi" />
          <div className="mt-10">
            <PrayerWheel dishes={oracle} />
          </div>
        </section>
      )}
    </div>
  );
}
