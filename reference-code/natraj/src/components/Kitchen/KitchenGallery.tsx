import { cn } from "@/lib/cn";
import { DeferredImage } from "@/components/DeferredImage";

type Tile = { imgs: [string, string?]; alt: string; span?: string; delay: string; sizes: string };

/* Ten official photos in five tiles. Each tile carries two and swaps between them on a 14s
   cycle (kt-alt in globals.css); the offsets mean the grid keeps shifting without ever
   changing all at once. Hover holds a tile; reduced motion shows the first photo only. */
const TILES: Tile[] = [
  {
    imgs: ["/official/kitchen-thali.jpg", "/official/kitchen-topdown.jpg"],
    alt: "A thali platter of curries, rice, naan and raita",
    span: "col-span-2 aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto",
    delay: "0s",
    sizes: "(max-width: 767px) 100vw, 50vw",
  },
  {
    imgs: ["/official/kitchen-feast.jpg", "/official/story-tandoori.jpg"],
    alt: "Tandoori chicken, naan and curry on the table",
    delay: "2.6s",
    sizes: "(max-width: 767px) 50vw, 25vw",
  },
  {
    imgs: ["/official/kitchen-naan.jpg", "/official/story-dal.jpg"],
    alt: "Baskets of fresh naan",
    delay: "5.4s",
    sizes: "(max-width: 767px) 50vw, 25vw",
  },
  {
    imgs: ["/official/kitchen-curry-bowl.jpg", "/official/sunday-buffet.jpg"],
    alt: "A brass bowl of curry",
    delay: "1.3s",
    sizes: "(max-width: 767px) 50vw, 25vw",
  },
  {
    imgs: ["/official/kitchen-chaat.jpg", "/official/story-sunday.jpg"],
    alt: "Chaat with chickpeas, yogurt and sev",
    delay: "4.1s",
    sizes: "(max-width: 767px) 50vw, 25vw",
  },
];

export function KitchenGallery() {
  return (
    <section
      id="kitchen"
      aria-labelledby="kitchen-title"
      className="scroll-mt-16 px-5 pt-20 [content-visibility:auto] [contain-intrinsic-size:auto_760px] md:px-8 md:pt-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[60ch]">
          <h2 id="kitchen-title" className="display text-[36px] text-cream md:text-[48px]">
            From our kitchen.
          </h2>
          <p className="mt-3 text-[16px] text-cream-2">
            The kitchen&apos;s own plates: tandoori, curries, breads and the Sunday spread.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4 md:auto-rows-[220px] md:gap-4 lg:auto-rows-[250px]">
          {TILES.map((t) => (
            <li
              key={t.imgs[0]}
              className={cn("kt relative overflow-hidden rounded-2xl bg-charcoal", t.span ?? "aspect-square md:aspect-auto")}
              style={{ ["--d" as string]: t.delay }}
            >
              <DeferredImage src={t.imgs[0]} alt={t.alt} fill sizes={t.sizes} quality={90} className="object-cover" />
              {t.imgs[1] && (
                <div className="kt-alt absolute inset-0" aria-hidden="true">
                  <DeferredImage src={t.imgs[1]} alt="" fill sizes={t.sizes} quality={90} className="object-cover" delay={1400} />
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(242,232,213,0.08),inset_0_-60px_80px_-40px_rgba(7,7,7,0.6)]"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
