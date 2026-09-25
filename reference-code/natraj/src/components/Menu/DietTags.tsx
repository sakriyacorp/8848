import { cn } from "@/lib/cn";
import type { Tag } from "@/lib/menu";

const ORDER: Tag[] = ["vegan", "vegetarian", "spicy", "popular"];
const META: Record<Tag, { label: string; dot: string }> = {
  vegan: { label: "Vegan", dot: "bg-green" },
  vegetarian: { label: "Vegetarian", dot: "bg-green" },
  spicy: { label: "Spicy", dot: "bg-red" },
  popular: { label: "Popular", dot: "bg-gold" },
};

export function DietTags({ tags, className }: { tags: Tag[]; className?: string }) {
  const shown = ORDER.filter((t) => tags.includes(t));
  if (shown.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-x-3 gap-y-1", className)} aria-label="Dietary">
      {shown.map((t) => (
        <li key={t} className="flex items-center gap-1.5 text-[12px] font-medium text-cream-2">
          <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", META[t].dot)} />
          {META[t].label}
        </li>
      ))}
    </ul>
  );
}
