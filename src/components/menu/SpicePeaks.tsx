import { cn } from "@/lib/cn";
import type { Spice, Tag } from "@/lib/menu";

const LABEL = ["No heat", "Gentle", "Warm", "Hot", "Very hot", "Himalayan hot"];

/* Spice as five tiny peaks; lit ones glow ember-brass. Dishes at 3+ get a heat shimmer on the
   card (see .heat in globals.css). Plain-HTML twin: spicePeaksHtml() in DishCard. */
export function SpicePeaks({ level, tone = "paper", className }: { level: Spice; tone?: "paper" | "dark"; className?: string }) {
  if (level === 0) return null;
  return (
    <span role="img" aria-label={`Spice: ${LABEL[level]}`} className={cn("spice-peaks inline-flex items-end gap-[2px]", `tone-${tone}`, className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 10 8" width="11" height="9" className={cn(n <= level && "lit")} aria-hidden="true">
          <path d="M0.5 7.5 5 0.8l4.5 6.7Z" />
        </svg>
      ))}
    </span>
  );
}

export const TAG_LABEL: Record<Tag, { short: string; long: string }> = {
  vegetarian: { short: "V", long: "Vegetarian" },
  vegan: { short: "VG", long: "Vegan" },
  gf: { short: "GF", long: "Gluten-free" },
  nuts: { short: "N", long: "Contains nuts" },
  popular: { short: "★", long: "Popular" },
  chef: { short: "Chef", long: "Chef's pick" },
};

export function DietBadges({ tags, tone = "paper", className }: { tags: Tag[]; tone?: "paper" | "dark"; className?: string }) {
  const diet = (["vegan", "vegetarian", "gf", "nuts"] as Tag[]).filter((t) => tags.includes(t) && !(t === "vegetarian" && tags.includes("vegan")));
  if (diet.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Dietary">
      {diet.map((t) => (
        <li
          key={t}
          title={TAG_LABEL[t].long}
          className={cn(
            "caps rounded-full border px-1.5 py-[1px] text-[9px] tracking-[0.12em]",
            tone === "paper" ? "border-ink-line text-bronze" : "border-line-strong text-muted",
          )}
        >
          <span aria-hidden="true">{TAG_LABEL[t].short}</span>
          <span className="sr-only">{TAG_LABEL[t].long}</span>
        </li>
      ))}
    </ul>
  );
}
