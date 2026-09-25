import type { Metadata } from "next";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { fullAddress, mapsUrl, site } from "@/config/site";
import { isOn } from "@/config/features";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { StreetMap } from "@/components/layout/StreetMap";
import { HoursTable } from "@/components/visit/HoursTable";
import { LiveStatus } from "@/components/visit/LiveStatus";
import { Reservation } from "@/components/visit/Reservation";
import { TwinClocks } from "@/components/setpieces/TwinClocks";
import { LampLight } from "@/components/setpieces/LampLight";
import { PrayerFlags } from "@/components/setpieces/PrayerFlags";
import { Snow } from "@/components/setpieces/Snow";

export const metadata: Metadata = {
  title: "Visit & reservations",
  description: `Find 8848 at ${fullAddress}. Hours, directions, parking and table reservations.`,
};

const FAQ = [
  { q: "Where do I park?", a: "Street parking on Reservoir Street and the small lot behind the building. Evenings are easy; weekday lunch is busier." },
  { q: "Do you take walk-ins?", a: "Always. Reservations just hold a table by the lamps. The bar is first come, first served." },
  { q: "Can you do gluten-free, vegan or nut-free?", a: "Yes. Every dish on the menu is marked, and the kitchen can adjust most curries and momos. Tell us about allergies when you order." },
  { q: "Private events?", a: `We can close the room for up to 60 people. Call ${site.phone} or email ${site.email}.` },
];

export default function VisitPage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden pb-16 pt-32 md:pt-40">
        {isOn("lampLight") && <LampLight />}
        {isOn("snow") && <Snow density={0.5} wind={0.3} avalanche />}
        <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <Reveal as="p" className="eyebrow text-brass">
              Base camp · 405 m
            </Reveal>
            <SplitHeading as="h1" text="Find us on *Reservoir Street.*" className="display mt-4 max-w-[13ch] text-[clamp(2.9rem,8vw,6rem)] text-brass-hi" />
            <Reveal delay={0.1}>
              <LiveStatus className="mt-7" />
              <address className="mt-6 text-[19px] not-italic leading-relaxed text-text">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}
              </address>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-brass px-6 py-3.5 text-[15px]">
                  Get directions <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a href={site.phoneHref} className="btn btn-ghost px-6 py-3.5 text-[15px]">
                  <Phone size={15} aria-hidden="true" /> {site.phone}
                </a>
                <a href={site.emailHref} className="btn btn-ghost px-6 py-3.5 text-[15px]">
                  <Mail size={15} aria-hidden="true" /> Email
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[28px] border border-line bg-walnut-deep/70 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]">
              <StreetMap className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </a>
          </Reveal>
        </div>
      </section>

      {isOn("twinClocks") && (
        <section aria-label="Local time here and on Everest" className="relative border-y border-line bg-void/40 py-14">
          <div className="container-x">
            <TwinClocks />
          </div>
        </section>
      )}

      <section id="reserve" aria-labelledby="reserve-title" className="relative scroll-mt-24 py-20 md:py-28">
        {isOn("prayerFlags") && <PrayerFlags className="top-0" height={100} tilt={-0.06} />}
        <div className="container-x relative">
          <Reveal as="p" className="eyebrow text-brass">
            Reservations
          </Reveal>
          <SplitHeading id="reserve-title" text="Hold a table by the *lamps.*" className="display mt-4 max-w-[14ch] text-[clamp(2.5rem,6vw,4.6rem)] text-brass-hi" />
          <div className="glass mt-10 rounded-[32px] p-5 [--glass-base:rgba(20,14,10,0.6)] md:p-9">
            <Reservation />
          </div>
        </div>
      </section>

      <section aria-labelledby="hours-title" className="paper relative py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 id="hours-title" className="display text-[clamp(2.3rem,5vw,3.6rem)] text-choc">
              Hours
            </h2>
            <p className="mt-2 text-[15px] text-bronze">The kitchen closes before the bar on weekends. Last pickup orders 20 minutes before close.</p>
            <div className="mt-6">
              <HoursTable tone="paper" />
            </div>
          </div>
          <div>
            <h2 className="display text-[clamp(2.3rem,5vw,3.6rem)] text-choc">Good to know</h2>
            <dl className="mt-6 divide-y divide-ink-line border-y border-ink-line">
              {FAQ.map((f) => (
                <div key={f.q} className="py-5">
                  <dt className="display text-[22px] text-choc">{f.q}</dt>
                  <dd className="mt-1.5 text-[15.5px] leading-relaxed text-bronze">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
