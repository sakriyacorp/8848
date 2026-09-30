import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { availableDishImages } from "@/lib/dish-images";
import { categoryById, hasSpiceControl, picks } from "@/lib/menu";
import { SplitHeading, Reveal } from "@/components/fx/Reveal";
import { SignatureRail, type RailEntry } from "@/components/home/SignatureRail";

const FEATURED = ["momo-platter", "chicken-jhol-momo", "chilli-fry-momo", "nepali-thali", "chicken-choila", "chilli-chicken", "mutton-sekuwa", "goat-curry", "butter-chicken", "kheer"];

/* Reading the menu: the first cream-paper section. Ten signatures on a rail. */
export function Signatures() {
  const available = new Set(availableDishImages());
  const entries: RailEntry[] = picks(FEATURED).map((i) => {
    const c = categoryById(i.category);
    return {
      id: i.id,
      name: i.name,
      np: i.np,
      price: i.price,
      desc: i.desc,
      img: i.img,
      category: i.category,
      available: available.has(i.img),
      spiceable: hasSpiceControl(i),
      spice: i.spice,
      tags: i.tags,
      camp: c ? `${c.camp} · ${c.altitude.toLocaleString("en-US")} m` : "",
    };
  });

  return (
    <section id="signatures" aria-labelledby="sig-title" className="paper relative overflow-hidden py-24 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgba(59,37,23,0.14)] to-transparent" />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal as="p" className="eyebrow text-bronze">
              Where to start
            </Reveal>
            <SplitHeading id="sig-title" text="Ten dishes to start the *climb.*" className="display mt-4 max-w-[14ch] text-[clamp(2.5rem,6vw,4.6rem)] text-choc [&_.brass-text]:foil-text" />
          </div>
          <Reveal delay={0.1}>
            <Link href="/menu" className="btn btn-ink hidden px-5 py-3 text-[14px] md:inline-flex">
              The whole menu <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
      <SignatureRail items={entries} />
      <div className="container-x md:hidden">
        <Link href="/menu" className="btn btn-ink mt-2 w-full py-3.5 text-[15px]">
          The whole menu <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
