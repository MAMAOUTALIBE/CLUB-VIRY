"use client";

import { History, Loader2, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type ActivityLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

// Libellés lisibles pour les actions les plus courantes ; sinon on affiche l'action brute.
const ACTION_LABELS: Record<string, string> = {
  "partner.logo_uploaded": "Logo partenaire téléversé",
  "media.uploaded": "Image téléversée",
  "profile.updated": "Profil modifié",
  "registration.reviewed": "Inscription traitée",
  "news.created": "Actualité créée",
  "news.updated": "Actualité modifiée"
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function fmtDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function metadataPreview(metadata: Record<string, unknown>): string {
  if (!metadata || typeof metadata !== "object") return "";
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (entries.length === 0) return "";
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" · ");
}

const PAGE_SIZE = 100;

export function AuditLogAdmin() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "auth" | "error">("loading");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/admin/logs?limit=${PAGE_SIZE}`, { credentials: "same-origin" });
      if (res.status === 401) {
        setState("auth");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setState("error");
        setMessage(`${json?.error?.code ?? "ERREUR"} : ${json?.error?.message ?? "Chargement impossible."}`);
        return;
      }
      const list = json.data?.activityLogs;
      setLogs(Array.isArray(list) ? list : []);
      setState("ready");
      setMessage("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => `${log.action} ${log.entity_type} ${log.actor_id ?? ""} ${metadataPreview(log.metadata)}`.toLowerCase().includes(q));
  }, [logs, query]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-black uppercase text-[#002f1d]">
            <History size={22} aria-hidden="true" /> Journal d'audit
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Historique des actions importantes effectuées dans le CRM (téléversements, modifications, traitements). Les {PAGE_SIZE} dernières entrées, les plus récentes en premier.
          </p>
        </div>
        <button onClick={() => void load()} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-black uppercase text-slate-700 hover:border-[#f7c600]" type="button">
          <RefreshCw size={16} aria-hidden="true" /> Actualiser
        </button>
      </div>

      {state === "auth" ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-bold text-amber-900">Session expirée — reconnectez-vous.</p>
          <AdminAccessControl loading={false} onAuthenticated={() => void load()} />
        </div>
      ) : null}

      {message ? <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p> : null}

      {state === "ready" || (state === "loading" && logs.length > 0) ? (
        <div className="mt-5">
          <label className="relative block max-w-sm">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher (action, entité, acteur…)"
              className="focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm font-bold text-slate-900"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        {state === "loading" ? (
          <p className="flex items-center gap-2 px-1 py-6 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p>
        ) : state === "ready" && filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-6 text-center text-sm font-bold text-slate-500">
            {logs.length === 0 ? "Aucune action enregistrée pour le moment." : "Aucune entrée ne correspond à votre recherche."}
          </p>
        ) : state === "ready" ? (
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                <th className="px-3 py-2">Horodatage</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entité</th>
                <th className="px-3 py-2">Acteur</th>
                <th className="px-3 py-2">Détails</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-[#fbfcf8]">
                  <td className="whitespace-nowrap px-3 py-2.5 align-top font-medium text-slate-600">{fmtDateTime(log.created_at)}</td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="inline-block rounded-full bg-[#002f1d]/8 px-2.5 py-1 text-xs font-black uppercase text-[#002f1d]">{actionLabel(log.action)}</span>
                  </td>
                  <td className="px-3 py-2.5 align-top font-bold text-slate-700">{log.entity_type}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 align-top text-xs font-medium text-slate-500">{log.actor_id ? `${log.actor_id.slice(0, 8)}…` : "Système"}</td>
                  <td className="px-3 py-2.5 align-top text-xs font-medium text-slate-500">{metadataPreview(log.metadata) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {state === "ready" && filtered.length > 0 ? (
        <p className="mt-4 text-xs font-bold text-slate-500">{filtered.length} entrée{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}.</p>
      ) : null}
    </section>
  );
}
