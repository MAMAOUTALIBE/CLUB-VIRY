"use client";

import { Loader2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AdminAccessControl } from "@/components/admin/AdminAccessControl";
import { showToast } from "@/components/admin/Toast";

type TrashedItem = {
  type: string;
  typeLabel: string;
  id: string;
  label: string;
  deletedAt: string;
};

function fmtDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function TrashAdmin() {
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "auth" | "error">("loading");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/admin/trash", { credentials: "same-origin" });
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
      const list = json.data?.items;
      setItems(Array.isArray(list) ? list : []);
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

  async function restore(item: TrashedItem) {
    setPendingId(item.id);
    try {
      const res = await fetch(`/api/admin/trash/${item.type}/${item.id}`, { method: "POST", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Restauration impossible.", "error");
        return;
      }
      await load();
      showToast("Contenu restauré.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setPendingId(null);
    }
  }

  async function purge(item: TrashedItem) {
    if (!window.confirm(`Supprimer définitivement « ${item.label} » ? Cette action est irréversible.`)) return;
    setPendingId(item.id);
    try {
      const res = await fetch(`/api/admin/trash/${item.type}/${item.id}`, { method: "DELETE", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Suppression impossible.", "error");
        return;
      }
      await load();
      showToast("Supprimé définitivement.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-black uppercase text-[#002f1d]">
            <Trash2 size={22} aria-hidden="true" /> Corbeille
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Contenus supprimés (actualités, partenaires, produits, dirigeants). Restaurez-les pour les remettre en ligne, ou supprimez-les définitivement.
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

      <div className="mt-5 overflow-x-auto">
        {state === "loading" ? (
          <p className="flex items-center gap-2 px-1 py-6 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p>
        ) : state === "ready" && items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-6 text-center text-sm font-bold text-slate-500">La corbeille est vide.</p>
        ) : state === "ready" ? (
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Élément</th>
                <th className="px-3 py-2">Supprimé le</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-slate-100 hover:bg-[#fbfcf8]">
                  <td className="px-3 py-2.5 align-top">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-600">{item.typeLabel}</span>
                  </td>
                  <td className="px-3 py-2.5 align-top font-bold text-[#002f1d]">{item.label}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 align-top font-medium text-slate-500">{fmtDateTime(item.deletedAt)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => void restore(item)}
                        disabled={pendingId === item.id}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-[#002f1d]/20 px-2.5 py-1.5 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600] disabled:cursor-wait disabled:opacity-70"
                        type="button"
                      >
                        {pendingId === item.id ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />} Restaurer
                      </button>
                      <button
                        onClick={() => void purge(item)}
                        disabled={pendingId === item.id}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-black uppercase text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-70"
                        type="button"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {state === "ready" && items.length > 0 ? (
        <p className="mt-4 text-xs font-bold text-slate-500">{items.length} élément{items.length > 1 ? "s" : ""} dans la corbeille.</p>
      ) : null}
    </section>
  );
}
