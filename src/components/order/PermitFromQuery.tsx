"use client";

import { useSearchParams } from "next/navigation";
import { Permit } from "@/components/setpieces/Permit";

export function PermitFromQuery() {
  const id = useSearchParams().get("id");
  return <Permit id={id} />;
}
