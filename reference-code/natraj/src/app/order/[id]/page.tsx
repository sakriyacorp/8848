import type { Metadata } from "next";
import { Confirmation } from "@/components/Confirmation/Confirmation";

export const metadata: Metadata = {
  title: "Your order — Natraj Indian Cuisine",
  robots: { index: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Confirmation id={id} />;
}
