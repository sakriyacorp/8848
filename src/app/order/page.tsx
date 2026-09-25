import type { Metadata } from "next";
import { availableDishImages } from "@/lib/dish-images";
import { Checkout } from "@/components/order/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function OrderPage() {
  return <Checkout available={availableDishImages()} />;
}
