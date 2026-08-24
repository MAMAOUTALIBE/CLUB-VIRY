"use client";

import { Loader2, Lock, RotateCcw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { showToast } from "@/components/admin/Toast";

type CatalogEntry = { permission: string; label: string };
type RoleRow = { role: string; label: string; rank: number; locked: boolean; overridden: boolean; permissions: string[] };

export function RolesAdmin() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [draft, setDraft] = useState<Record<string, Set<string>>>({});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/admin/roles", { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setState("error");
        return;
      }
      const rows: RoleRow[] = json.data.roles ?? [];
      setRoles(rows);
      setCatalog(json.data.catalog ?? []);
      setDraft(Object.fromEntries(rows.map((r) => [r.role, new Set(r.permissions)])));
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  function toggle(role: string, permission: string) {
    setDraft((current) => {
      const next = new Set(current[role] ?? []);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return { ...current, [role]: next };
    });
  }

  async function save(role: string) {
    setBusy(role);
    try {
      const res = await fetch(`/api/admin/roles/${role}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: [...(draft[role] ?? [])] })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Enregistrement impossible.", "error");
        return;
      }
      showToast("Permissions enregistrées.");
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function reset(role: string) {
    if (!window.confirm(`Réinitialiser le rôle « ${role} » aux permissions par défaut ?`)) return;
    setBusy(role);
    try {
      const res = await fetch(`/api/admin/roles/${role}`, { method: "DELETE", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        showToast(json?.error?.message ?? "Réinitialisation impossible.", "error");
        return;
      }
      showToast("Rôle réinitialisé.");
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (state === "loading") return <p className="flex items-center gap-2 p-6 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p>;
  if (state === "error") return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Impossible de charger les rôles.</p>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase text-[#07542f]">Sécurité</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Rôles & permissions</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Ajustez les permissions accordées à chaque rôle. Les valeurs par défaut du code restent le repli (une réinitialisation y revient). Le <strong>Super administrateur</strong> est verrouillé. Seul un super administrateur peut enregistrer des modifications.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {roles.map((row) => {
          const set = draft[row.role] ?? new Set<string>();
          return (
            <div key={row.role} className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase text-[#002f1d]">{row.label}</h3>
                  {row.locked ? <Lock size={14} className="text-slate-500" aria-label="Verrouillé" /> : null}
                  {row.overridden ? <span className="rounded-full bg-[#f7c600] px-2 py-0.5 text-[10px] font-black uppercase text-[#002f1d]">Personnalisé</span> : null}
                </div>
              </div>
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {catalog.map((entry) => {
                  const checked = set.has(entry.permission);
                  return (
                    <label key={entry.permission} className={`flex items-center gap-2 text-xs font-bold ${row.locked ? "text-slate-400" : "text-slate-700"}`} title={entry.permission}>
                      <input
                        type="checkbox"
                        checked={row.locked ? true : checked}
                        disabled={row.locked}
                        onChange={() => toggle(row.role, entry.permission)}
                        className="h-4 w-4 accent-[#002f1d]"
                      />
                      {entry.label}
                    </label>
                  );
                })}
              </div>
              {!row.locked ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => void save(row.role)} disabled={busy === row.role} className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[#f7c600] px-3 text-xs font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70">
                    {busy === row.role ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer
                  </button>
                  {row.overridden ? (
                    <button type="button" onClick={() => void reset(row.role)} disabled={busy === row.role} className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-black uppercase text-slate-700 hover:border-[#f7c600] disabled:opacity-70">
                      <RotateCcw size={14} /> Défaut
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
