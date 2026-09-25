import Link from "next/link";
import { restaurant } from "@/lib/menu";
import { GlassPanel } from "@/components/Glass/GlassPanel";
import { HoursTable, OpenPill } from "@/components/Visit/LiveHours";

export function Visit() {
  const { address, phone, phoneHref, email, emailHref, mapsUrl, reservationUrl, hours, links } = restaurant;
  const embed = `https://www.google.com/maps?q=${address.lat},${address.lng}&z=16&output=embed`;
  const label = "text-[13px] font-medium text-cream-2";

  return (
    <section
      id="visit"
      aria-labelledby="visit-title"
      className="scroll-mt-16 px-5 py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px] md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="visit-title" className="display text-[36px] text-cream md:text-[48px]">
            Visit.
          </h2>
          <OpenPill hours={hours} />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <GlassPanel className="rounded-3xl p-6">
            <h3 className={label}>Hours</h3>
            <HoursTable hours={hours} />
          </GlassPanel>

          <GlassPanel className="rounded-3xl p-6">
            <h3 className={label}>Find us</h3>
            <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-charcoal">
              <iframe
                title="Map to Natraj Indian Cuisine"
                src={embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_brightness(0.85)_contrast(0.9)_saturate(0.5)]"
              />
            </div>
            <address className="mt-4 text-[15px] not-italic text-cream">
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.city}, {address.state} {address.zip}
            </address>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-4 px-4 py-2 text-[14px]">
              Get directions
            </a>
          </GlassPanel>

          <GlassPanel className="rounded-3xl p-6">
            <h3 className={label}>Reach us</h3>
            <a href={phoneHref} className="display mt-3 block text-[28px] text-cream transition-colors duration-150 hover:text-gold">
              {phone}
            </a>
            <a href={emailHref} className="mt-0.5 inline-block break-all py-1.5 text-[14px] text-cream-2 transition-colors duration-150 hover:text-cream">
              {email}
            </a>
            <p className="mt-3 text-[14px] text-cream-2">Pickup orders are ready in about 20 minutes.</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/menu" className="btn-order py-3.5 text-[15px]">
                Order
              </Link>
              <a href={reservationUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost py-3 text-[15px]">
                Reserve a table
              </a>
            </div>
            <p className="mt-4 text-[13px] text-cream-2/80">
              Planning a group?{" "}
              <a href={links.privateEvents} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cream">
                Private events
              </a>
              .
            </p>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
