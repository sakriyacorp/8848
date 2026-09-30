import Image from "next/image";
import { cn } from "@/lib/cn";
import { isOn } from "@/config/features";
import { getDishImage } from "@/lib/dish-path";
import type { MenuItem } from "@/lib/menu";

type Props = {
  item: Pick<MenuItem, "img" | "name" | "category">;
  available: boolean;
  sizes: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  steam?: boolean;
};

/* Every dish photo goes through here: a warm grade so bright kitchen shots sit in the lamp-lit
   room, a soft vignette, optional steam, and a brass line-art illustration when a family has no
   photo yet (never a broken image). */
export function DishImage({ item, available, sizes, alt = "", priority, className, steam = false }: Props) {
  return (
    <div className={cn("dish-photo relative overflow-hidden bg-walnut-deep", className)}>
      {available ? (
        <Image src={getDishImage(item)} alt={alt} fill sizes={sizes} priority={priority} quality={80} className="dish-img object-cover" />
      ) : (
        <DishIllustration kind={kindOf(item.category)} />
      )}
      <span aria-hidden="true" className="dish-vignette" />
      {steam && isOn("steam") && <Steam />}
    </div>
  );
}

export function Steam({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("steam", className)}>
      <i />
      <i />
      <i />
    </span>
  );
}

type Kind = "steamer" | "bowl" | "glass" | "plate";

export function kindOf(category: string): Kind {
  if (category === "momo") return "steamer";
  if (category === "bar" || category === "drinks") return "glass";
  if (category === "soups-salads" || category === "entrees" || category === "signatures" || category === "biryani") return "bowl";
  return "plate";
}

/* Brass line-art on walnut, one of four vessels. */
export function DishIllustration({ kind, className }: { kind: Kind; className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={cn("absolute inset-0 h-full w-full", className)} aria-hidden="true">
      <rect width="200" height="150" fill="#2a1b12" />
      <g fill="none" stroke="#b69e70" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        {kind === "steamer" && (
          <>
            <ellipse cx="100" cy="82" rx="54" ry="14" />
            <path d="M46 82v22c0 8 24 14 54 14s54-6 54-14V82" />
            <path d="M52 96h96M60 106h80" opacity=".5" />
            <path d="M78 76c0-8 10-14 22-14s22 6 22 14" />
            <path d="M84 72c4-6 28-6 32 0" opacity=".6" />
          </>
        )}
        {kind === "bowl" && (
          <>
            <path d="M44 78h112c0 26-24 42-56 42S44 104 44 78Z" />
            <path d="M82 120h36" />
            <path d="M58 78c10-8 26-10 42-6s30 2 42 6" opacity=".55" />
            <path d="M120 40l30 34M128 36l30 34" opacity=".7" />
          </>
        )}
        {kind === "glass" && (
          <>
            <path d="M74 38h52l-6 70a8 8 0 0 1-8 7H88a8 8 0 0 1-8-7Z" />
            <path d="M78 64h44" opacity=".55" />
            <circle cx="112" cy="54" r="9" opacity=".6" />
            <path d="M118 30l18-10" />
          </>
        )}
        {kind === "plate" && (
          <>
            <ellipse cx="100" cy="88" rx="64" ry="22" />
            <ellipse cx="100" cy="86" rx="42" ry="13" opacity=".6" />
            <path d="M84 80c6-10 26-10 32 0" />
          </>
        )}
      </g>
      <g className="steam-lines" stroke="#eed3a5" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".5">
        <path d="M88 52c-4-6 4-10 0-16" />
        <path d="M100 48c-4-6 4-10 0-16" />
        <path d="M112 52c-4-6 4-10 0-16" />
      </g>
    </svg>
  );
}
