import { availableDishImages } from "@/lib/dish-images";
import { byId, hasSpiceControl } from "@/lib/menu";
import { isOn } from "@/config/features";
import { HOTSPOTS } from "@/data/everest";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { EverestSection } from "@/components/story/EverestSection";
import type { PairDish } from "@/components/setpieces/Everest3D";

/* The story page's interactive pieces. Each is a set-piece behind its own flag. */
export function StoryExtras() {
  const available = new Set(availableDishImages());
  const dishes: Record<string, PairDish> = {};
  for (const h of HOTSPOTS) {
    const d = byId(h.dish);
    if (d) dishes[d.id] = { id: d.id, name: d.name, price: d.price, img: d.img, category: d.category, spice: d.spice, available: available.has(d.img), spiceable: hasSpiceControl(d) };
  }
  return (
    <>
      {isOn("everest3d") && (
        <section aria-labelledby="massif-title" className="relative overflow-hidden bg-night py-20 md:py-28">
          <div aria-hidden="true" className="lamp-glow left-1/2 top-10 h-[50vmin] w-[50vmin] -translate-x-1/2" />
          <div className="container-x relative">
            <Reveal as="p" className="eyebrow text-brass">
              The mountain, in your hands
            </Reveal>
            <SplitHeading id="massif-title" text="Turn *Sagarmatha.*" className="display mt-4 text-[clamp(2.5rem,6vw,4.6rem)] text-brass-hi" />
            <Reveal delay={0.1} as="p" className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-text/80">
              The massif in brass contour lines, like the relief model on a Kathmandu guide&rsquo;s desk. Drag it round. Tap a glowing camp to fly there, read its story, and find the dish we&rsquo;d eat at that altitude.
            </Reveal>
            <div className="mt-10">
              <EverestSection dishes={dishes} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
