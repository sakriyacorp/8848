import Image from "next/image";
import { Gift, Percent, Zap } from "lucide-react";
import { restaurant } from "@/lib/menu";
import { GlassPanel } from "@/components/Glass/GlassPanel";
import { Reveal } from "@/components/Reveal";

const BENEFITS = [
  { icon: Gift, text: "Earn points toward free food" },
  { icon: Percent, text: "Exclusive deals and discounts" },
  { icon: Zap, text: "Saved details for faster checkout" },
];

/* The rewards program lives in Natraj's own account system on eatnatraj.com; this site sends
   people there rather than pretending to track points itself. */
export function Rewards() {
  return (
    <section
      id="rewards"
      aria-labelledby="rewards-title"
      className="px-5 py-20 [content-visibility:auto] [contain-intrinsic-size:auto_560px] md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <GlassPanel className="grid overflow-hidden rounded-3xl md:grid-cols-[1.1fr_1fr]">
            <div className="p-7 md:p-12">
              <h2 id="rewards-title" className="display text-[36px] text-cream md:text-[44px]">
                Natraj rewards.
              </h2>
              <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-cream-2">
                Sign in with your mobile number and points build up on the online orders placed through your
                rewards account.
              </p>
              <ul className="mt-7 flex flex-col gap-3.5">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-[16px] text-cream">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href={restaurant.links.rewards} target="_blank" rel="noopener noreferrer" className="btn-primary px-7 py-3.5 text-[15px]">
                  Join rewards
                </a>
                <span className="text-[13px] text-cream-2/80">Points live in your rewards account, separate from this bag.</span>
              </div>
            </div>
            <div className="relative min-h-[260px] md:min-h-0">
              <Image
                src="/official/rewards.jpg"
                alt="A brass karahi of lamb curry garnished with chili and cilantro"
                fill
                sizes="(max-width: 767px) 100vw, 45vw"
                quality={90}
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,var(--charcoal),transparent_35%)] max-md:bg-[linear-gradient(to_bottom,var(--charcoal),transparent_35%)]" />
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
