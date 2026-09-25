import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/lib/menu";
import { GlassPanel } from "@/components/Glass/GlassPanel";
import { Reveal } from "@/components/Reveal";

export function OrderSection() {
  return (
    <section
      id="order"
      aria-labelledby="order-title"
      className="scroll-mt-16 px-5 py-20 [content-visibility:auto] [contain-intrinsic-size:auto_640px] md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <GlassPanel className="rounded-3xl p-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-charcoal">
              <Image
                src="/official/bring-home.jpg"
                alt="A brass bowl of butter chicken on a gold tray"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                quality={90}
                className="object-cover"
              />
            </div>
          </GlassPanel>
        </Reveal>
        <Reveal delay={0.1} className="max-w-[52ch]">
          <h2 id="order-title" className="display text-[36px] text-cream md:text-[48px]">
            Bring Natraj home.
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-cream-2">
            The same food the dining room gets, packed for your table: butter chicken and tikka masala in their cream
            sauces, lamb from the curry pot, biryani under a lid of steam, and naan straight out of the tandoor.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-cream-2">
            Pick your dishes and your spice level, and it is ready in about 20 minutes at {restaurant.address.line1.split(",")[0]}.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/menu" className="btn-order px-10 py-4 text-[17px]">
              Order
            </Link>
            <span className="text-[14px] text-cream-2">Pickup or delivery, your call at checkout.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
