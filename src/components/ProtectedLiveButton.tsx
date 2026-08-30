"use client";

import { ExternalLink, Loader2, LogIn, Radio } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ProtectedLiveButton({ matchId }: { matchId: string }) {
  const [busy, setBusy] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [message, setMessage] = useState("");

  async function openLive() {
    setBusy(true);
    setMessage("");
    setAuthRequired(false);
    try {
      const response = await fetch(`/api/family/matches/${matchId}/live`, { credentials: "same-origin" });
      const json = await response.json().catch(() => null);
      if (response.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!response.ok || !json?.ok || typeof json.data?.url !== "string") {
        setMessage(json?.error?.message ?? "Ce direct n’est pas accessible à votre famille.");
        return;
      }
      window.location.assign(json.data.url);
    } catch {
      setMessage("Le direct ne peut pas être ouvert actuellement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-7 text-center">
      {authRequired ? <Link href="/espace-membre" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d]"><LogIn size={18} /> Se connecter pour voir le direct</Link> : <button type="button" disabled={busy} onClick={() => void openLive()} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] disabled:opacity-60">{busy ? <Loader2 className="animate-spin" size={18} /> : <Radio size={18} />} Voir le match en direct <ExternalLink size={17} /></button>}
      <p className="mt-2 text-xs font-bold text-white/60">Accès réservé aux familles sélectionnées par le club.</p>
      {message ? <p role="alert" className="mt-3 text-sm font-bold text-red-300">{message}</p> : null}
    </div>
  );
}
