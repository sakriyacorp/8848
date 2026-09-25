import Link from "next/link";
import { ArrowUpRight, CalendarDays, Phone } from "lucide-react";
import { mapsUrl, site } from "@/config/site";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { StreetMap } from "@/components/layout/StreetMap";
import { HoursTable } from "@/components/visit/HoursTable";
import { LiveStatus } from "@/components/visit/LiveStatus";
import { PrayerFlags } from "@/components/setpieces/PrayerFlags";
import { Snow } from "@/components/setpieces/Snow";
import { isOn } from "@/config/features";

/* Base camp, for real: address, today's hours, the map, and a table. */
export function VisitSection() {
  return (
    <section id="visit" aria-labelledby="visit-title" className="relative overflow-hidden bg-night py-24 md:py-32">
      <div aria-hidden="true" className="lamp-glow -right-24 top-10 h-[420px] w-[420px]" />
      {isOn("snow") && <Snow density={0.4} wind={0.25} avalanche />}
      {isOn("prayerFlags") && <PrayerFlags className="top-0" height={110} />}
      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <Reveal as="p" className="eyebrow text-brass">
            Base camp · 405 m
          </Reveal>
          <SplitHeading id="visit-title" text="Come in from the *cold.*" className="display mt-4 text-[clamp(2.7rem,7vw,5.2rem)] text-brass-hi" />
          <Reveal delay={0.1}>
            <LiveStatus className="mt-6" />
            <address className="mt-6 text-[19px] not-italic leading-relaxed text-text">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/visit#reserve" className="btn btn-brass px-6 py-3.5 text-[15px]">
                <CalendarDays size={16} aria-hidden="true" /> Book a table
              </Link>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-6 py-3.5 text-[15px]">
                Get directions <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={site.phoneHref} className="btn btn-ghost px-6 py-3.5 text-[15px]">
                <Phone size={15} aria-hidden="true" /> {site.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 max-w-[520px]">
            <HoursTable />
          </Reveal>
        </div>
        <Reveal delay={0.15} className="self-start">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[28px] border border-line bg-walnut-deep/70 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]">
            <StreetMap className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            <span className="flex items-center justify-between border-t border-line px-5 py-4 text-[14px] text-muted">
              <span>Street parking on Reservoir St · lot behind the building</span>
              <ArrowUpRight size={16} className="text-brass transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
