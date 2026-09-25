import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isOn } from "@/config/features";
import { Snow } from "@/components/setpieces/Snow";
import { Compass404 } from "@/components/setpieces/Compass404";

export const metadata: Metadata = {
  title: "Lost in a whiteout",
  robots: { index: false },
};

/* 404: a whiteout on the mountain. Sideways snow, a brass compass that can't make up its mind,
   and one way home. */
export default function NotFound() {
  return (
    <section className="whiteout relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      {isOn("blizzard404") && <Snow blizzard density={1} wind={0.6} color="255,255,255" className="z-[1]" />}
      <div aria-hidden="true" className="whiteout-haze absolute inset-0" />
      <div className="container-x relative z-[2] flex flex-col items-center text-center">
        <Compass404 />
        <p className="caps mt-8 text-[10.5px] text-bronze">Error 404 · altitude unknown</p>
        <h1 className="display mt-3 text-[clamp(2.8rem,10vw,6.4rem)] leading-[0.95] text-choc">Lost in a whiteout.</h1>
        <p className="mt-5 max-w-[42ch] text-[17px] text-bronze">
          This page wandered off the trail. Visibility is zero, the compass is spinning, and the smart move is to head back down.
        </p>
        <Link href="/" data-compass-target className="btn mt-8 bg-choc px-7 py-4 text-[15.5px] text-brass-hi shadow-[0_18px_40px_-14px_rgba(59,37,23,.7)] hover:-translate-y-0.5">
          <ArrowLeft size={16} aria-hidden="true" /> Return to Base Camp
        </Link>
        <nav aria-label="Other ways down" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-bronze">
          <Link href="/menu" className="underline decoration-choc/30 underline-offset-4 hover:text-choc">
            The menu
          </Link>
          <Link href="/bar" className="underline decoration-choc/30 underline-offset-4 hover:text-choc">
            The bar
          </Link>
          <Link href="/visit" className="underline decoration-choc/30 underline-offset-4 hover:text-choc">
            Directions
          </Link>
        </nav>
      </div>
    </section>
  );
}
