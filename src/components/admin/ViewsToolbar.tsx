"use client";

import { Bookmark, Check, Columns3, Loader2, Save, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { showToast } from "@/components/admin/Toast";

type SavedView = { id: string; name: string; is_shared: boolean; config: { search?: string; hiddenColumns?: string[] } };

type Props = {
  scope: string;
  columnLabels: string[];
  search: string;
  onSearchChange: (value: string) => void;
  hiddenColumns: string[];
  onToggleColumn: (label: string) => void;
  onApply: (config: { search?: string; hiddenColumns?: string[] }) => void;
  buildConfig: () => { search: string; hiddenColumns: string[] };
};

/** Barre d'outils opt-in d'un tableau : recherche, colonnes visibles, vues enregistrées. */
export function ViewsToolbar({ scope, columnLabels, search, onSearchChange, hiddenColumns, onToggleColumn, onApply, buildConfig }: Props) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCols, setShowCols] = useState(false);
  const [busy, setBusy] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  const loadViews = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/saved-views?scope=${encodeURIComponent(scope)}`, { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      setViews(json?.ok && Array.isArray(json.data?.savedViews) ? json.data.savedViews : []);
    } catch {
      /* silencieux */
    }
  }, [scope]);

  useEffect(() => {
    const t = window.setTimeout(() => void loadViews(), 0);
    return () => window.clearTimeout(t);
  }, [loadViews]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) setShowCols(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function saveView() {
    const name = window.prompt("Nom de la vue à enregistrer :");
    if (!name || name.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/saved-views", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, name: name.trim(), config: buildConfig() })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Enregistrement impossible.", "error");
        return;
      }
      showToast("Vue enregistrée.");
      setActiveId(json.data?.savedView?.id ?? null);
      await loadViews();
    } finally {
      setBusy(false);
    }
  }

  async function removeView(id: string) {
    if (!window.confirm("Supprimer cette vue enregistrée ?")) return;
    try {
      const res = await fetch(`/api/admin/saved-views/${id}`, { method: "DELETE", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Suppression impossible.", "error");
        return;
      }
      if (activeId === id) setActiveId(null);
      showToast("Vue supprimée.");
      await loadViews();
    } catch {
      showToast("Erreur réseau.", "error");
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="relative flex items-center">
        <Search size={16} className="absolute left-3 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => { onSearchChange(e.target.value); setActiveId(null); }}
          placeholder="Rechercher…"
          aria-label="Rechercher dans le tableau"
          className="min-h-10 w-56 rounded-md border border-slate-300 pl-9 pr-3 text-sm font-bold text-slate-900 focus:border-[#07542f] focus:outline-none"
        />
      </label>

      <div className="relative" ref={colsRef}>
        <button type="button" onClick={() => setShowCols((v) => !v)} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-black uppercase text-slate-700 hover:border-[#f7c600]">
          <Columns3 size={15} aria-hidden="true" /> Colonnes{hiddenColumns.length ? ` (${columnLabels.length - hiddenColumns.length}/${columnLabels.length})` : ""}
        </button>
        {showCols ? (
          <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
            {columnLabels.map((label) => {
              const visible = !hiddenColumns.includes(label);
              return (
                <button key={label} type="button" onClick={() => { onToggleColumn(label); setActiveId(null); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-bold text-slate-700 hover:bg-[#fbfcf8]">
                  <span className={`inline-flex size-4 items-center justify-center rounded border ${visible ? "border-[#002f1d] bg-[#002f1d] text-white" : "border-slate-300"}`}>{visible ? <Check size={12} /> : null}</span>
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {views.length > 0 ? <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" /> : null}
      {views.map((view) => (
        <span key={view.id} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black uppercase ${activeId === view.id ? "border-[#002f1d] bg-[#002f1d] text-white" : "border-slate-300 bg-white text-slate-700"}`}>
          <button type="button" onClick={() => { onApply(view.config ?? {}); setActiveId(view.id); }} className="focus-ring inline-flex items-center gap-1">
            <Bookmark size={12} aria-hidden="true" /> {view.name}
          </button>
          <button type="button" onClick={() => void removeView(view.id)} aria-label={`Supprimer la vue ${view.name}`} className="text-current/70 hover:text-red-200"><X size={12} /></button>
        </span>
      ))}

      <button type="button" onClick={() => void saveView()} disabled={busy} className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[#07542f]/30 px-3 text-xs font-black uppercase text-[#07542f] hover:bg-[#07542f]/10 disabled:opacity-60">
        {busy ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer la vue
      </button>
    </div>
  );
}
