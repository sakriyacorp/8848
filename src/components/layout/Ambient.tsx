"use client";

import { isOn } from "@/config/features";
import { Ripples } from "@/components/setpieces/Ripples";
import { ScrollClimber } from "@/components/setpieces/ScrollClimber";
import { AltitudeTitle } from "@/components/setpieces/AltitudeTitle";
import { Avalanche } from "@/components/setpieces/Avalanche";
import { CloudWipe } from "@/components/setpieces/CloudWipe";

/* Site-wide ambient life, loaded after first paint by ClientShell. Each piece has its own flag. */
export function Ambient() {
  return (
    <>
      {isOn("ripples") && <Ripples />}
      {isOn("climber") && <ScrollClimber />}
      {isOn("altitudeTitle") && <AltitudeTitle />}
      {isOn("avalanche") && <Avalanche />}
      {isOn("cloudWipe") && <CloudWipe />}
    </>
  );
}
