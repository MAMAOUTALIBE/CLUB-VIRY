"use client";

import { Loader2, Pencil, Plus, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type Row = Record<string, unknown>;

export type CrudFieldType = "text" | "textarea" | "url" | "date" | "datetime" | "number" | "select" | "boolean";

export type CrudField = {
  /** Clé du payload envoyé à l'API (camelCase). */
  name: string;
  label: string;
  type?: CrudFieldType;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
  help?: string;
  fullWidth?: boolean;
  /** Clé correspondante dans la ligne retournée par l'API (snake_case). Défaut: snake_case de `name`. */
  rowKey?: string;
  /** Clé envoyée dans le payload (camelCase) si différente de `name`. Défaut: `name`. */
  payloadKey?: string;
  /** Transforme la valeur saisie avant envoi (ex: euros -> centimes). */
  toPayload?: (raw: string) => unknown;
  /** Calcule la valeur initiale du champ lors de l'édition (ex: centimes -> euros). */
  fromRowValue?: (row: Row) => string;
};

export type CrudColumn = { label: string; render: (row: Row) => React.ReactNode };

type AdminCrudProps = {
  title: string;
  description?: string;
  /** Endpoint création (POST) + base de l'édition (PATCH endpoint/[id]), ex: /api/admin/news */
  endpoint: string;
  /** Endpoint de liste (GET) si différent de `endpoint`. Défaut: `endpoint`. */
  listEndpoint?: string;
  /** Clé du tableau dans data (GET), ex: "news" */
  listKey: string;
  /** Clé de l'objet dans data (POST/PATCH), ex: "article" */
  itemKey: string;
  fields: CrudField[];
  columns: CrudColumn[];
  idField?: string;
  newLabel?: string;
};

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function toInputValue(field: CrudField, row: Row): string {
  const key = field.rowKey ?? camelToSnake(field.name);
  const raw = row[key];
  if (raw === null || raw === undefined) return "";
  if (field.type === "datetime") return String(raw).slice(0, 16); // YYYY-MM-DDTHH:mm
  if (field.type === "date") return String(raw).slice(0, 10);
  return String(raw);
}

export function AdminCrud({ title, description, endpoint, listEndpoint, listKey, itemKey, fields, columns, idField = "id", newLabel = "Nouveau" }: AdminCrudProps) {
  const getUrl = listEndpoint ?? endpoint;
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "auth" | "error">("loading");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(getUrl, { credentials: "same-origin" });
      if (res.status === 401) {
        setState("auth");
        return;
      }
      const json = await res.json();
      if (!json?.ok) {
        setState("error");
        setMessage(`${json?.error?.code ?? "ERREUR"} : ${json?.error?.message ?? "Chargement impossible."}`);
        return;
      }
      const list = json.data?.[listKey];
      setRows(Array.isArray(list) ? list : []);
      setState("ready");
      setMessage("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    }
  }, [getUrl, listKey]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  function openNew() {
    const blank: Record<string, string> = {};
    for (const f of fields) blank[f.name] = f.type === "boolean" ? "true" : f.type === "select" && f.options?.[0] ? f.options[0].value : "";
    setForm(blank);
    setEditing({});
    setFormError("");
  }

  function openEdit(row: Row) {
    const next: Record<string, string> = {};
    for (const f of fields) next[f.name] = f.fromRowValue ? f.fromRowValue(row) : toInputValue(f, row);
    setForm(next);
    setEditing(row);
    setFormError("");
  }

  async function submit() {
    setSaving(true);
    setFormError("");
    // payload : on n'envoie que les champs renseignés (les vides deviennent omis)
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const key = f.payloadKey ?? f.name;
      const raw = form[f.name];
      if (f.type === "boolean") {
        payload[key] = raw === "true";
        continue;
      }
      const v = raw?.trim?.() ?? raw;
      if (v !== "" && v !== undefined) {
        payload[key] = f.toPayload ? f.toPayload(v) : f.type === "number" ? Number(v) : v;
      }
    }
    const id = editing && editing[idField];
    const url = id ? `${endpoint}/${id}` : endpoint;
    const method = id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        const details = Array.isArray(json?.error?.details) ? json.error.details.map((d: { field?: string; message?: string }) => `${d.field}: ${d.message}`).join(" · ") : "";
        setFormError(`${json?.error?.message ?? "Échec de l'enregistrement."}${details ? " — " + details : ""}`);
        return;
      }
      setEditing(null);
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void load()} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-black uppercase text-slate-700 hover:border-[#f7c600]" type="button">
            <RefreshCw size={16} aria-hidden="true" /> Actualiser
          </button>
          <button onClick={openNew} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f]" type="button">
            <Plus size={18} aria-hidden="true" /> {newLabel}
          </button>
        </div>
      </div>

      {state === "auth" ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-bold text-amber-900">Session expirée — reconnectez-vous.</p>
          <AdminAccessControl loading={false} onAuthenticated={() => void load()} />
        </div>
      ) : null}

      {message ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p> : null}

      {/* Formulaire créer / éditer */}
      {editing ? (
        <div className="mt-5 rounded-lg border border-[#002f1d]/15 bg-[#fbfcf8] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase text-[#002f1d]">{editing[idField] ? "Modifier" : "Créer"}</h3>
            <button onClick={() => setEditing(null)} className="focus-ring rounded-md p-1 text-slate-500 hover:text-slate-900" type="button" aria-label="Fermer"><X size={20} /></button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const id = `crud-${f.name}`;
              const common = {
                id,
                value: form[f.name] ?? "",
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((s) => ({ ...s, [f.name]: e.target.value })),
                className: "focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
              };
              return (
                <label key={f.name} className={`grid gap-1.5 text-sm font-bold text-slate-800 ${f.fullWidth || f.type === "textarea" ? "sm:col-span-2" : ""}`} htmlFor={id}>
                  <span>{f.label}{f.required ? <span className="text-red-600"> *</span> : null}</span>
                  {f.type === "textarea" ? (
                    <textarea {...common} rows={5} placeholder={f.placeholder} />
                  ) : f.type === "select" ? (
                    <select {...common}>
                      {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === "boolean" ? (
                    <select {...common}>
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  ) : (
                    <input {...common} type={f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : f.type === "url" ? "url" : f.type === "number" ? "number" : "text"} placeholder={f.placeholder} />
                  )}
                  {f.help ? <span className="text-xs font-medium text-slate-500">{f.help}</span> : null}
                </label>
              );
            })}
          </div>
          {formError ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{formError}</p> : null}
          <div className="mt-4 flex gap-2">
            <button onClick={() => void submit()} disabled={saving} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:cursor-wait disabled:opacity-70" type="button">
              {saving ? <Loader2 className="animate-spin" size={18} /> : null} Enregistrer
            </button>
            <button onClick={() => setEditing(null)} className="focus-ring min-h-11 rounded-md border border-slate-300 px-4 text-sm font-black uppercase text-slate-700 hover:border-[#f7c600]" type="button">Annuler</button>
          </div>
        </div>
      ) : null}

      {/* Liste */}
      <div className="mt-5 overflow-x-auto">
        {state === "loading" ? (
          <p className="flex items-center gap-2 px-1 py-6 text-sm font-bold text-slate-500"><Loader2 className="animate-spin" size={18} /> Chargement…</p>
        ) : state === "ready" && rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-6 text-center text-sm font-bold text-slate-500">Aucun élément. Cliquez sur « {newLabel} » pour en ajouter.</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                {columns.map((c) => <th key={c.label} className="px-3 py-2">{c.label}</th>)}
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={String(row[idField] ?? i)} className="border-b border-slate-100 hover:bg-[#fbfcf8]">
                  {columns.map((c) => <td key={c.label} className="px-3 py-2.5 align-top text-slate-700">{c.render(row)}</td>)}
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => openEdit(row)} className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" type="button">
                      <Pencil size={14} /> Éditer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
