import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/lib/menu";
import { hoursSummary } from "@/lib/hours";

type FooterLink = { label: string; href: string; external?: boolean };

export function Footer() {
  const { address, phone, phoneHref, email, emailHref, hours, name, legalName, links, reservationUrl, mapsUrl } = restaurant;

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Eat",
      links: [
        { label: "Menu", href: "/menu" },
        { label: "Order pickup or delivery", href: "/menu" },
        { label: "PDF menu", href: links.pdfMenu, external: true },
        { label: "Sunday buffet", href: "/#story" },
        { label: "Gift cards", href: links.giftCards, external: true },
      ],
    },
    {
      title: "Visit",
      links: [
        { label: "Reserve a table", href: reservationUrl, external: true },
        { label: "Private events", href: links.privateEvents, external: true },
        { label: "Get directions", href: mapsUrl, external: true },
        { label: "Hours and location", href: "/#visit" },
        { label: "Questions", href: "/#faq" },
      ],
    },
    {
      title: "Natraj",
      links: [
        { label: "Our story", href: "/#story" },
        { label: "Reviews", href: "/reviews" },
        { label: "Rewards", href: links.rewards, external: true },
        { label: "Contact", href: "/#visit" },
        { label: "We're hiring", href: links.careers, external: true },
      ],
    },
  ];

  const linkClass = "text-ink-2 transition-colors duration-150 hover:text-ink";

  return (
    <footer className="bg-beige text-ink-2">
      <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Image src="/brand/natraj-logo.png" alt={name} width={531} height={334} sizes="150px" className="h-[72px] w-auto" />
            <address className="mt-6 text-[14px] not-italic leading-relaxed">
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.city}, {address.state} {address.zip}
            </address>
            <p className="mt-4 flex flex-col gap-1 text-[14px]">
              <a href={phoneHref} className="inline-block py-1 text-ink transition-colors duration-150 hover:text-red-deep">
                {phone}
              </a>
              <a href={emailHref} className={`inline-block py-1 ${linkClass}`}>
                {email}
              </a>
            </p>
            <p className="mt-4 text-[14px]">
              {hoursSummary(hours).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-[14px] font-semibold text-ink">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-[14px]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-beige-2 pt-6 text-[13px]">
          <p>
            © {new Date().getFullYear()} {name} · {legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
