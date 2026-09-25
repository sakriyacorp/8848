import type { Metadata } from "next";
import { Checkout } from "@/components/Checkout/Checkout";

export const metadata: Metadata = {
  title: "Checkout — Natraj Indian Cuisine",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <Checkout />;
}
