import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MenuItem } from "@/lib/menu";
import { getDishImage } from "@/lib/dish-path";

type Props = {
  item: Pick<MenuItem, "img" | "name">;
  available: boolean;
  sizes: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  iconSize?: number;
};

export function DishImage({ item, available, sizes, alt = "", priority, className, iconSize = 22 }: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)}>
      {available ? (
        <Image
          src={getDishImage(item)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={85}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(70%_70%_at_50%_35%,rgba(242,232,213,0.06),transparent)]"
        >
          <UtensilsCrossed size={iconSize} strokeWidth={1.25} className="text-cream/20" />
        </div>
      )}
    </div>
  );
}
