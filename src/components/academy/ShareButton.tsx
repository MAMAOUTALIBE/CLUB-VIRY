"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

// Partage natif (navigator.share) avec repli copie-lien + petit toast.
// Le bouche-à-oreille mobile (WhatsApp / Snap / Insta) est le canal n°1 des jeunes.

export function ShareButton({ className, title, text }: { className: string; title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // partage annulé : on tente la copie ci-dessous
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papier indisponible : on ignore silencieusement
    }
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-live="polite">
      {copied ? (
        <>
          <Check size={18} aria-hidden="true" /> Lien copié
        </>
      ) : (
        <>
          <Share2 size={18} aria-hidden="true" /> Partager
        </>
      )}
    </button>
  );
}
