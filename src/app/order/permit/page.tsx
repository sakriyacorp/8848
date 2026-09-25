import type { Metadata } from "next";
import { Suspense } from "react";
import { PermitFromQuery } from "@/components/order/PermitFromQuery";

export const metadata: Metadata = {
  title: "Your summit permit",
  robots: { index: false },
};

export default function PermitPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" aria-busy="true" />}>
      <PermitFromQuery />
    </Suspense>
  );
}
