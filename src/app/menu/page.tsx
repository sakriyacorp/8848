import type { Metadata } from "next";
import { availableDishImages } from "@/lib/dish-images";
import { menuSections, items } from "@/lib/menu";
import { isOn } from "@/config/features";
import { dishCardHtml } from "@/components/menu/DishCard";
import { MenuClient } from "@/components/menu/MenuClient";
import { OrderModeBar } from "@/components/menu/OrderModeBar";
import { SplitHeading } from "@/components/fx/Reveal";
import { MenuExtras } from "@/components/menu/MenuExtras";
import { MomoCounter } from "@/components/setpieces/MomoCounter";
import { PackBar } from "@/components/order/PackBar";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Momos steamed, fried, kothey, jhol and C-momo; thukpa, sekuwa, dal bhat, Indo-Chinese chilli dishes, tandoor and curries, and the bar. Order pickup or delivery in Harrisonburg.",
};

export default function MenuPage() {
  const available = new Set(availableDishImages());
  const sections = menuSections();
  const camps = sections.map((s) => ({
    id: s.category.id,
    name: s.category.name,
    camp: s.category.camp,
    altitude: s.category.altitude,
    count: s.items.length,
  }));

  return (
    <div className="relative">
      <header className="relative overflow-hidden pb-10 pt-32 md:pb-14 md:pt-40">
        <div aria-hidden="true" className="lamp-glow -left-20 top-10 h-96 w-96" />
        <div aria-hidden="true" className="lamp-glow right-0 top-0 h-80 w-80 [animation-delay:-3s]" />
        <div className="container-x relative">
          <p className="eyebrow text-brass">Ten camps · {items.length} dishes</p>
          <SplitHeading as="h1" text="The *menu.*" className="display mt-4 text-[clamp(3.4rem,11vw,7rem)] text-brass-hi" />
          <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-text/80 md:text-[17px]">
            From Kathmandu to the summit: momos first, the bar at the top. Pleated by hand, fired in the wok, baked in the tandoor. Tap a dish for spice and notes, or tap + to pack it.
          </p>
          {isOn("momoCounter") && <MomoCounter className="mt-4" />}
          <OrderModeBar />
        </div>
      </header>

      <div className="container-x relative pb-24 md:pb-32">
        <div className="paper menu-sheet relative -mx-[var(--gutter)] px-[var(--gutter)] pb-16 pt-6 md:mx-0 md:px-8 md:pt-8 lg:px-10">
          <MenuClient camps={camps}>
            {sections.map(({ category, items }) => (
              <section
                key={category.id}
                id={`cat-${category.id}`}
                data-section={category.id}
                aria-labelledby={`cat-${category.id}-title`}
                className="scroll-mt-[150px] border-t border-ink-line py-10 first:border-t-0 first:pt-4 [content-visibility:auto] lg:scroll-mt-[110px]"
                style={{ containIntrinsicSize: `auto ${240 + items.length * 130}px` }}
              >
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <div>
                    <p className="caps num text-[10px] text-bronze">
                      {category.camp} · {category.altitude.toLocaleString("en-US")} m
                    </p>
                    <h2 id={`cat-${category.id}-title`} className="display mt-1.5 text-[34px] text-choc md:text-[42px]">
                      {category.name}
                      {category.np && (
                        <span lang="ne" className="np ml-3 align-middle text-[17px] text-bronze md:text-[20px]">
                          {category.np}
                        </span>
                      )}
                    </h2>
                  </div>
                  <span data-count className="num text-[13px] text-bronze">
                    {items.length} dishes
                  </span>
                </div>
                {category.blurb && <p className="mt-2 max-w-[60ch] text-[15px] text-bronze">{category.blurb}</p>}
                <div
                  className="mt-6 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 md:gap-y-4 xl:grid-cols-3"
                  dangerouslySetInnerHTML={{ __html: items.map((item) => dishCardHtml(item, available.has(item.img))).join("") }}
                />
              </section>
            ))}
          </MenuClient>
        </div>
        {(isOn("momoBuilder") || isOn("thali") || isOn("prayerWheel")) && <MenuExtras />}
      </div>
      {isOn("packBar") && <PackBar />}
    </div>
  );
}
