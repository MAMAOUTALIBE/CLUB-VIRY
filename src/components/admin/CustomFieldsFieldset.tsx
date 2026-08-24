"use client";

import { useCallback, useEffect, useState } from "react";

type Definition = {
  id: string;
  key: string;
  label: string;
  type: "TEXT" | "TEXTAREA" | "NUMBER" | "BOOLEAN" | "DATE" | "SELECT" | "MULTISELECT" | "EMAIL" | "PHONE" | "URL";
  options: string[];
  required: boolean;
  help_text: string | null;
};

type Props = {
  /** Type d'entité (player, partner, …). */
  entity: string;
  /** Identifiant de la fiche en cours d'édition, ou null pour une création. */
  recordId: string | null;
  /** Remonte la carte clé→valeur courante à chaque changement. */
  onChange: (values: Record<string, unknown>) => void;
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#07542f] focus:outline-none";

/**
 * Encart « Champs personnalisés » injecté dans le formulaire d'une fiche (opt-in via
 * AdminCrud). Charge les définitions actives de l'entité + les valeurs existantes,
 * et remonte les valeurs saisies. Rendu invisible si aucun champ n'est défini.
 */
export function CustomFieldsFieldset({ entity, recordId, onChange }: Props) {
  const [defs, setDefs] = useState<Definition[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const defsRes = await fetch(`/api/admin/custom-fields?entity=${encodeURIComponent(entity)}&active=1`, { credentials: "same-origin" });
        const defsJson = await defsRes.json().catch(() => null);
        const list: Definition[] = defsJson?.ok && Array.isArray(defsJson.data?.customFields) ? defsJson.data.customFields : [];
        let initial: Record<string, unknown> = {};
        if (recordId) {
          const valRes = await fetch(`/api/admin/custom-fields/values?entity=${encodeURIComponent(entity)}&id=${encodeURIComponent(recordId)}`, { credentials: "same-origin" });
          const valJson = await valRes.json().catch(() => null);
          if (valJson?.ok && valJson.data?.values && typeof valJson.data.values === "object") {
            initial = valJson.data.values as Record<string, unknown>;
          }
        }
        if (!cancelled) {
          setDefs(list);
          setValues(initial);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [entity, recordId]);

  const update = useCallback(
    (key: string, value: unknown) => {
      setValues((current) => {
        const next = { ...current, [key]: value };
        onChange(next);
        return next;
      });
    },
    [onChange]
  );

  if (!loaded || defs.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-md border border-dashed border-[#07542f]/30 bg-[#fbfcf8] p-4">
      <p className="text-xs font-black uppercase text-[#07542f]">Champs personnalisés</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {defs.map((def) => {
          const raw = values[def.key];
          const id = `cf-${def.id}`;
          return (
            <div key={def.id} className={def.type === "TEXTAREA" || def.type === "MULTISELECT" ? "sm:col-span-2" : ""}>
              {def.type === "BOOLEAN" ? (
                <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input id={id} type="checkbox" checked={raw === true} onChange={(e) => update(def.key, e.target.checked)} />
                  {def.label}
                  {def.required ? <span className="text-red-600">*</span> : null}
                </label>
              ) : (
                <>
                  <label htmlFor={id} className="block text-sm font-bold text-slate-700">
                    {def.label}
                    {def.required ? <span className="text-red-600"> *</span> : null}
                  </label>
                  {def.type === "TEXTAREA" ? (
                    <textarea id={id} className={inputClass} rows={3} value={typeof raw === "string" ? raw : ""} onChange={(e) => update(def.key, e.target.value)} />
                  ) : def.type === "SELECT" ? (
                    <select id={id} className={inputClass} value={typeof raw === "string" ? raw : ""} onChange={(e) => update(def.key, e.target.value)}>
                      <option value="">— Choisir —</option>
                      {def.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : def.type === "MULTISELECT" ? (
                    <div className="mt-1 flex flex-wrap gap-3">
                      {def.options.map((opt) => {
                        const arr = Array.isArray(raw) ? (raw as string[]) : [];
                        const checked = arr.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-1.5 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const nextArr = e.target.checked ? [...arr, opt] : arr.filter((v) => v !== opt);
                                update(def.key, nextArr);
                              }}
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      id={id}
                      type={def.type === "NUMBER" ? "number" : def.type === "DATE" ? "date" : def.type === "EMAIL" ? "email" : def.type === "URL" ? "url" : def.type === "PHONE" ? "tel" : "text"}
                      className={inputClass}
                      value={raw === null || raw === undefined ? "" : String(raw)}
                      onChange={(e) => update(def.key, def.type === "NUMBER" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                    />
                  )}
                  {def.help_text ? <p className="mt-1 text-xs text-slate-500">{def.help_text}</p> : null}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
