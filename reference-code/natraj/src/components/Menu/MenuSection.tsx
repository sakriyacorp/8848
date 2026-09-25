import { availableDishImages } from "@/lib/dish-images";
import { menuSections, restaurant } from "@/lib/menu";
import { dishCardHtml } from "@/components/Menu/DishCard";
import { MenuClient } from "@/components/Menu/MenuClient";
import { OrderModeBar } from "@/components/Menu/OrderModeBar";

export function MenuSection() {
  const available = new Set(availableDishImages());
  const sections = menuSections();
  const categories = sections.map((s) => ({ id: s.category.id, name: s.category.name, count: s.items.length }));

  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-16 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[60ch]">
          <h2 id="menu-title" className="display text-[36px] text-cream md:text-[48px]">
            The menu.
          </h2>
          <p className="mt-3 text-[16px] text-cream-2">
            {restaurant.entreeNote} {restaurant.biryaniNote}
          </p>
        </div>

        <OrderModeBar pickupAddress={restaurant.address.line1.split(",")[0]} />

        <MenuClient categories={categories}>
          {sections.map(({ category, items }) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              data-section={category.id}
              aria-labelledby={`cat-${category.id}-title`}
              className="scroll-mt-[128px] border-t border-line py-10 [content-visibility:auto] lg:scroll-mt-[100px]"
              style={{ containIntrinsicSize: `auto ${180 + items.length * 124}px` }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 id={`cat-${category.id}-title`} className="display text-[24px] text-cream md:text-[28px]">
                  {category.name}
                </h3>
                <span data-count className="text-[13px] tabular-nums text-cream-2/80">
                  {items.length}
                </span>
              </div>
              {category.blurb && <p className="mt-1.5 max-w-[60ch] text-[15px] text-cream-2">{category.blurb}</p>}
              <div
                className="mt-6 grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2 xl:grid-cols-3"
                dangerouslySetInnerHTML={{ __html: items.map((item) => dishCardHtml(item, available.has(item.img))).join("") }}
              />
            </section>
          ))}
        </MenuClient>
      </div>
    </section>
  );
}
