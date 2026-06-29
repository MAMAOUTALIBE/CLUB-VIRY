"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { TOTAL_FORMATIONS } from "@/lib/academy-data";

// Barre CTA collante en bas d'écran, mobile uniquement (lg:hidden). Apparaît
// une fois le hero passé. Rendue seulement si la plateforme est configurée
// (sinon pas de barre désactivée permanente).

export function StickyAcademyCta({ academyUrl }: { academyUrl?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.7;
      // Masquer près du bas de page pour ne pas recouvrir le CTA final.
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 220;
      setShow(scrolled && !nearBottom);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!academyUrl) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#f7c600]/40 bg-[#001c10]/95 px-4 py-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] backdrop-blur transition-all duration-300 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <a
        href={academyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#001c10]"
      >
        Je me lance — {TOTAL_FORMATIONS} formations <ExternalLink size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
