import type { Metadata } from "next";
import { MenuSection } from "@/components/Menu/MenuSection";

export const metadata: Metadata = {
  title: "Menu — Natraj Indian Cuisine",
  description: "The full Natraj menu: tandoori, curries, biryani, breads and more. Order pickup in downtown Culpeper.",
};

export default function MenuPage() {
  return (
    <div className="pt-16">
      <MenuSection />
    </div>
  );
}
