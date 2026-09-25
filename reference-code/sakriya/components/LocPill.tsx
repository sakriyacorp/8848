"use client";

import { useEffect, useState } from "react";

function fmt(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

export default function LocPill() {
  const [ktm, setKtm] = useState("--:--");
  const [va, setVa] = useState("--:--");

  useEffect(() => {
    const tick = () => {
      setKtm(fmt("Asia/Kathmandu"));
      setVa(fmt("America/New_York"));
    };
    tick();
    const iv = setInterval(tick, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="loc-pill glass reveal" style={{ transitionDelay: ".3s" }}>
      <div className="loc">
        <span className="city">Kathmandu, Nepal</span>
        <span className="zone">27.7°N &nbsp;<b>{ktm}</b></span>
      </div>
      <div className="loc-bridge" />
      <div className="loc">
        <span className="city">Virginia, United States</span>
        <span className="zone">38.4°N &nbsp;<b>{va}</b></span>
      </div>
    </div>
  );
}
