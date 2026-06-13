"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";

type Summary = { providerConfigured: boolean; processed: number; sent: number; failed: number; skipped: number };

function Stat({ label, value, tone }: { label: string; value: number; tone?: "green" | "red" }) {
  const color = tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-[#002f1d]";
  return (
    <div className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-3 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-[11px] font-black uppercase text-slate-500">{label}</p>
    </div>
  );
}

export function CommunicationAdmin() {
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  async function processQueue() {
    setBusy(true);
    setError("");
    setSummary(null);
    try {
      const res = await fetch("/api/admin/notifications/process?limit=50", { method: "POST", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? `Échec (HTTP ${res.status}).`);
        return;
      }
      setSummary(json.data as Summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="official-card rounded-lg bg-white p-5">
      <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Communication — file d'envoi</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Les notifications email des familles (convocations, séances, médias, actualités) sont mises en file, puis envoyées via le provider email
        (Brevo, variable <code className="rounded bg-slate-100 px-1">BREVO_API_KEY</code>) si configuré, sinon relayées au webhook. Traitez la file
        manuellement ci-dessous (ou planifiez un cron qui appelle l'endpoint).
      </p>
      <button
        onClick={() => void processQueue()}
        disabled={busy}
        className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:opacity-70"
        type="button"
      >
        {busy ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />} Traiter la file maintenant
      </button>

      {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}

      {summary ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <Stat label="Traitées" value={summary.processed} />
          <Stat label="Envoyées" value={summary.sent} tone="green" />
          <Stat label="Échecs" value={summary.failed} tone="red" />
          <Stat label="Ignorées" value={summary.skipped} />
          {!summary.providerConfigured ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 sm:col-span-4">
              ⚠️ Aucun provider email ni webhook configuré : définissez <strong>BREVO_API_KEY</strong> + <strong>EMAIL_FROM</strong> (ou un webhook) pour envoyer réellement les emails.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
