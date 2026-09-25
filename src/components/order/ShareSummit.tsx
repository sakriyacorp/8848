"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { site } from "@/config/site";
import { useUI } from "@/lib/ui";

/* "Share your summit": the phone's own share sheet where there is one (it's the natural move on
   a phone after ordering), otherwise the link goes on the clipboard. Shares the restaurant, not
   the permit — orders live only on the device that placed them. */
export function ShareSummit({ first }: { first: string }) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);

  const share = async () => {
    const text = `${first} just reached the summit at ${site.fullName}: momos, thukpa and a bar under the stars on Reservoir Street, Harrisonburg.`;
    try {
      if (canShare) {
        await navigator.share({ title: site.fullName, text, url: location.origin });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${location.origin}`);
      useUI.getState().showToast("Link copied. Tell someone where you ate.", { plain: true });
    } catch {
      /* dismissed */
    }
  };

  return (
    <button type="button" onClick={share} className="btn btn-ghost px-6 py-3.5 text-[15px]">
      <Share2 size={15} aria-hidden="true" /> {canShare ? "Share your summit" : "Copy a link"}
    </button>
  );
}
