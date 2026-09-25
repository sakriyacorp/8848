import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EVEREST, NAV_LINKS, fullAddress, mapsUrl, site } from "@/config/site";
import { isOn } from "@/config/features";
import { Logo } from "@/components/brand/Logo";
import { Facebook, Instagram, TikTok } from "@/components/icons/Icons";
import { StreetMap } from "@/components/layout/StreetMap";
import { HoursTable } from "@/components/visit/HoursTable";
import { FooterHorizon } from "@/components/setpieces/FooterHorizon";
import { FooterStatus } from "@/components/layout/FooterStatus";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#120d09] text-text" aria-labelledby="footer-title">
      {isOn("footerHorizon") ? (
        <FooterHorizon />
      ) : (
        <div aria-hidden="true" className="h-24 bg-[linear-gradient(to_bottom,var(--night),#120d09)]" />
      )}

      <div className="container-x relative pb-10 pt-6 md:pt-2">
        <h2 id="footer-title" className="sr-only">
          {site.fullName}
        </h2>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr_1fr] lg:gap-14">
          <div>
            <Logo variant="lockup" material="brass" className="w-[210px] md:w-[240px]" />
            <p className="mt-6 max-w-[34ch] text-[15px] leading-relaxed text-muted">
              Momos, thukpa and dal bhat, Indo-Chinese fire and a full bar, {Math.round(7760).toLocaleString("en-US")} miles from{" "}
              <span lang="ne" className="np text-brass-hi">
                {EVEREST.nepali}
              </span>
              .
            </p>
            <FooterStatus />
            <div className="mt-6 flex gap-2">
              {[
                { href: site.socials.instagram, label: "Instagram", Icon: Instagram },
                { href: site.socials.facebook, label: "Facebook", Icon: Facebook },
                { href: site.socials.tiktok, label: "TikTok", Icon: TikTok },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`8848 on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-brass transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-foil/60 hover:text-brass-hi"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-brass">Find us</p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="group mt-5 block overflow-hidden rounded-2xl border border-line bg-walnut-deep/60">
              <StreetMap className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </a>
            <address className="mt-4 not-italic text-[15px] leading-relaxed">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </address>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-4 py-2.5 text-[14px]">
                Get directions <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={site.phoneHref} className="btn btn-ghost px-4 py-2.5 text-[14px]">
                {site.phone}
              </a>
            </div>
            <a href={site.emailHref} className="mt-3 inline-block text-[14px] text-muted underline decoration-line-strong underline-offset-4 hover:text-brass-hi">
              {site.email}
            </a>
          </div>

          <div>
            <p className="eyebrow text-brass">Hours</p>
            <div className="mt-5">
              <HoursTable compact={false} />
            </div>
            <nav aria-label="Footer" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
              {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/order", label: "Your order" }].map((l) => (
                <Link key={l.href} href={l.href} className="text-muted transition-colors hover:text-brass-hi">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="rule mt-14" />
        <div className="mt-6 flex flex-col gap-3 text-[12.5px] text-muted/90 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 {site.legalName} · {site.fullName} · {fullAddress}
          </p>
          <p className="caps text-[10px] tracking-[0.3em] text-brass/80">
            Base camp 405 m · Summit {EVEREST.metres.toLocaleString("en-US", { minimumFractionDigits: 2 })} m
          </p>
        </div>
      </div>
    </footer>
  );
}
