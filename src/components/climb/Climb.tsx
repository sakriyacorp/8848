"use client";

import { ClimbStatic, type ClimbDish } from "@/components/climb/ClimbStatic";

/* Chooses the climb: the scroll-driven 3D ascent when WebGL and motion are available (added in
   the flagship milestone), otherwise the SVG route. */
export function Climb({ dishes }: { dishes: Record<string, ClimbDish> }) {
  return <ClimbStatic dishes={dishes} />;
}
