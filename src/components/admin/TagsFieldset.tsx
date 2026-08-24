"use client";

import { useEffect, useMemo, useState } from "react";

type Option = { id: string; label: string; color: string | null; list_name: string };

type Props = {
  entity: string;
  recordId: string | null;
  onChange: (itemIds: string[]) => void;
};

/**
 * Encart « Tags » injecté dans le formulaire d'une fiche (opt-in via AdminCrud).
 * Charge les tags disponibles pour l'entité (listes TAG applicables) + ceux déjà posés,
 * et remonte la sélection. Invisible si aucun tag n'est configuré.
 */
export function TagsFieldset({ entity, recordId, onChange }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const params = new URLSearchParams({ entity });
        if (recordId) params.set("id", recordId);
        // Sans recordId (création) on ne peut pas lire la sélection : on charge juste les options.
        const url = recordId ? `/api/admin/tags?${params.toString()}` : `/api/admin/tags?entity=${encodeURIComponent(entity)}&id=00000000-0000-4000-8000-000000000000`;
        const res = await fetch(url, { credentials: "same-origin" });
        const json = await res.json().catch(() => null);
        if (!cancelled && json?.ok) {
          setOptions(Array.isArray(json.data?.options) ? json.data.options : []);
          setSelected(recordId && Array.isArray(json.data?.selected) ? json.data.selected : []);
        }
      } catch {
        /* silencieux */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [entity, recordId]);

  const groups = useMemo(() => {
    const byList = new Map<string, Option[]>();
    for (const opt of options) {
      const arr = byList.get(opt.list_name) ?? [];
      arr.push(opt);
      byList.set(opt.list_name, arr);
    }
    return Array.from(byList.entries());
  }, [options]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      onChange(next);
      return next;
    });
  }

  if (!loaded || options.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-md border border-dashed border-[#07542f]/30 bg-[#fbfcf8] p-4">
      <p className="text-xs font-black uppercase text-[#07542f]">Tags</p>
      <div className="mt-3 space-y-3">
        {groups.map(([listName, opts]) => (
          <div key={listName}>
            <p className="text-xs font-black uppercase text-slate-500">{listName}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {opts.map((opt) => {
                const active = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(opt.id)}
                    aria-pressed={active}
                    className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase transition ${
                      active ? "border-[#002f1d] bg-[#002f1d] text-white" : "border-slate-300 bg-white text-slate-700 hover:border-[#07542f]"
                    }`}
                  >
                    {opt.color ? <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: opt.color }} aria-hidden="true" /> : null}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
