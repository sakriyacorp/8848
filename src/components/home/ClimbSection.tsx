import { availableDishImages } from "@/lib/dish-images";
import { byId, hasSpiceControl } from "@/lib/menu";
import { WAYPOINTS } from "@/data/climb";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { Climb } from "@/components/climb/Climb";
import type { ClimbDish } from "@/components/climb/ClimbStatic";

/* The Everest centrepiece on the home page: a menu you climb. */
export function ClimbSection() {
  const available = new Set(availableDishImages());
  const dishes: Record<string, ClimbDish> = {};
  for (const w of WAYPOINTS) {
    const d = byId(w.dish);
    if (d) dishes[d.id] = { id: d.id, name: d.name, price: d.price, img: d.img, category: d.category, spice: d.spice, available: available.has(d.img), spiceable: hasSpiceControl(d) };
  }
  return (
    <section id="climb" aria-labelledby="climb-title" className="climb-section relative">
      <div className="container-x relative pb-10 pt-24 md:pt-32">
        <Reveal as="p" className="eyebrow text-brass">
          The South Col route · 12 camps
        </Reveal>
        <SplitHeading id="climb-title" text="A menu you *climb.*" className="display mt-4 text-[clamp(2.7rem,7vw,5.4rem)] text-brass-hi" />
        <Reveal delay={0.1} as="p" className="mt-5 max-w-[48ch] text-[16.5px] leading-relaxed text-text/80">
          Kathmandu to the summit, one dish per camp. Scroll to climb; watch the air get thin.
        </Reveal>
      </div>
      <Climb dishes={dishes} />
    </section>
  );
}
