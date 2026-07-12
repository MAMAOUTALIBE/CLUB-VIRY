"use client";

import { ArrowDown, ArrowUp, GripVertical, Loader2, Pencil, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";
import { showToast } from "@/components/admin/Toast";

type Row = Record<string, unknown>;

export type CrudFieldType = "text" | "textarea" | "url" | "date" | "datetime" | "number" | "select" | "boolean" | "file";

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
  payloadKey?: string | false;
  /** Transforme la valeur saisie avant envoi (ex: euros -> centimes). */
  toPayload?: (raw: string) => unknown;
  /** Calcule la valeur initiale du champ lors de l'édition (ex: centimes -> euros). */
  fromRowValue?: (row: Row) => string;
  /** Endpoint multipart pour les champs fichier. Doit retourner data[uploadResponseKey]. */
  uploadEndpoint?: string;
  /** Champ texte mis à jour après upload, ex: logoUrl. */
  uploadTargetField?: string;
  /** Clé de réponse lue dans data après upload. Défaut: url. */
  uploadResponseKey?: string;
  /** Message de succès affiché après upload. Défaut: message générique image. */
  uploadSuccessMessage?: string;
  /** Champs multipart supplémentaires envoyés avec le fichier (ex: { folder: "actualites" }). */
  uploadExtraFields?: Record<string, string>;
  accept?: string;
  maxBytes?: number;
};

export type CrudColumn = { label: string; render: (row: Row) => React.ReactNode };
type AdminCrudHelpers = { reload: () => Promise<void> };

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
  /** Masque le bouton de création (mode édition seule, ex: profils existants non créables ici). */
  disableCreate?: boolean;
  /** Actions supplémentaires par ligne, rendues avant le bouton « Éditer » (ex: lien vers un sous-écran). */
  rowActions?: (row: Row, helpers: AdminCrudHelpers) => React.ReactNode;
  /** Active un bouton « Supprimer » par ligne (DELETE endpoint/[id], avec confirmation). */
  allowDelete?: boolean;
  /** "soft" = déplacé en corbeille (restaurable), "hard" = suppression définitive. Défaut: "hard". */
  deleteMode?: "soft" | "hard";
  /** Libellé d'une ligne pour la confirmation de suppression (défaut: première colonne). */
  rowLabel?: (row: Row) => string;
  /** Active la réorganisation (glisser-déposer + flèches) en POSTant { ids } à cet endpoint. */
  reorderEndpoint?: string;
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

/**
 * Champ « téléverser une image » prêt à l'emploi, câblé sur l'upload générique
 * du CRM (`/api/admin/uploads`). Remplit automatiquement le champ URL cible.
 */
export function imageUploadField(opts: { targetField: string; folder: string; label?: string; help?: string }): CrudField {
  return {
    name: `${opts.targetField}__file`,
    label: opts.label ?? "Téléverser une image",
    type: "file",
    fullWidth: true,
    uploadEndpoint: "/api/admin/uploads",
    uploadTargetField: opts.targetField,
    uploadResponseKey: "url",
    uploadExtraFields: { folder: opts.folder },
    accept: "image/jpeg,image/png,image/webp",
    maxBytes: 5 * 1024 * 1024,
    help: opts.help ?? "JPEG, PNG ou WebP — 5 Mo max. Le champ URL se remplit automatiquement."
  };
}

const PAGE_SIZE = 100;

/** Force le paramètre `limit` d'un endpoint (en préservant les autres query params). */
function withLimit(endpoint: string, limit: number): string {
  const [path, query = ""] = endpoint.split("?");
  const params = new URLSearchParams(query);
  params.set("limit", String(limit));
  return `${path}?${params.toString()}`;
}

export function AdminCrud({ title, description, endpoint, listEndpoint, listKey, itemKey, fields, columns, idField = "id", newLabel = "Nouveau", disableCreate = false, rowActions, allowDelete = false, deleteMode = "hard", rowLabel, reorderEndpoint }: AdminCrudProps) {
  const getUrl = listEndpoint ?? endpoint;
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "auth" | "error">("loading");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(withLimit(getUrl, limit), { credentials: "same-origin" });
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
      const nextRows = Array.isArray(list) ? list : [];
      setRows(nextRows);
      setHasMore(nextRows.length >= limit);
      setState("ready");
      setMessage("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    }
  }, [getUrl, listKey, limit]);

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

  async function deleteRow(row: Row) {
    const id = row[idField];
    if (!id) return;
    const label = rowLabel ? rowLabel(row) : "cet élément";
    const confirmText =
      deleteMode === "soft"
        ? `Déplacer ${label} vers la corbeille ? Vous pourrez le restaurer.`
        : `Supprimer ${label} ? Cette action est définitive.`;
    if (!window.confirm(confirmText)) return;
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setMessage(`${json?.error?.message ?? "Suppression impossible."}`);
        showToast(json?.error?.message ?? "Suppression impossible.", "error");
        return;
      }
      await load();
      showToast(deleteMode === "soft" ? "Déplacé vers la corbeille." : "Supprimé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau.");
    }
  }

  async function persistOrder(next: Row[]) {
    if (!reorderEndpoint) return;
    const previous = rows;
    setRows(next); // optimiste
    setReordering(true);
    try {
      const ids = next.map((r) => r[idField]).filter(Boolean);
      const res = await fetch(reorderEndpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setRows(previous); // rollback
        showToast(json?.error?.message ?? "Réorganisation impossible.", "error");
        return;
      }
      showToast("Ordre enregistré.");
    } catch (error) {
      setRows(previous);
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setReordering(false);
    }
  }

  function moveRow(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(next);
  }

  function dropOnRow(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    void persistOrder(next);
  }

  async function uploadFieldFile(field: CrudField, file: File) {
    if (!field.uploadEndpoint || !field.uploadTargetField) {
      setFormError("Configuration d'upload manquante.");
      return;
    }

    if (field.accept) {
      const accepted = field.accept
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (accepted.length > 0 && !accepted.includes(file.type)) {
        setFormError(`Format invalide : ${accepted.join(", ")}.`);
        return;
      }
    }

    if (field.maxBytes && file.size > field.maxBytes) {
      setFormError(`Fichier trop lourd (${Math.round(field.maxBytes / 1024 / 1024)} Mo maximum).`);
      return;
    }

    setUploadingField(field.name);
    setFormError("");

    try {
      const body = new FormData();
      body.append("file", file);
      for (const [key, value] of Object.entries(field.uploadExtraFields ?? {})) {
        body.append(key, value);
      }

      const res = await fetch(field.uploadEndpoint, {
        method: "POST",
        credentials: "same-origin",
        body
      });
      const json = await res.json().catch(() => null);
      const responseKey = field.uploadResponseKey ?? "url";
      const uploadedValue = json?.data?.[responseKey];

      if (!res.ok || !json?.ok || typeof uploadedValue !== "string") {
        setFormError(json?.error?.message ?? "Upload impossible.");
        showToast(json?.error?.message ?? "Upload impossible.", "error");
        return;
      }

      setForm((current) => ({ ...current, [field.uploadTargetField as string]: uploadedValue }));
      showToast(field.uploadSuccessMessage ?? "Image téléversée. Enregistrez la fiche pour publier le changement.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur réseau.";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setUploadingField(null);
    }
  }

  async function submit() {
    setSaving(true);
    setFormError("");
    // payload : on n'envoie que les champs renseignés (les vides deviennent omis)
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.type === "file" || f.payloadKey === false) {
        continue;
      }
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
      showToast("Enregistré.");
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
          {!disableCreate ? (
            <button onClick={openNew} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f]" type="button">
              <Plus size={18} aria-hidden="true" /> {newLabel}
            </button>
          ) : null}
        </div>
      </div>

      {state === "auth" ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-bold text-amber-900">Session expirée — reconnectez-vous.</p>
          <AdminAccessControl loading={false} onAuthenticated={() => void load()} />
        </div>
      ) : null}

      {message ? <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{message}</p> : null}

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
              if (f.type === "file") {
                const targetValue = f.uploadTargetField ? form[f.uploadTargetField] : "";
                const uploading = uploadingField === f.name;

                return (
                  <label key={f.name} className={`grid gap-1.5 text-sm font-bold text-slate-800 ${f.fullWidth ? "sm:col-span-2" : ""}`} htmlFor={id}>
                    <span>{f.label}{f.required ? <span className="text-red-600"> *</span> : null}</span>
                    <div className="rounded-md border border-dashed border-slate-300 bg-white p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          id={id}
                          type="file"
                          accept={f.accept}
                          disabled={uploading}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void uploadFieldFile(f, file);
                            event.currentTarget.value = "";
                          }}
                          className="block min-h-11 max-w-full text-sm font-bold text-slate-700 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-[#002f1d] file:px-4 file:text-xs file:font-black file:uppercase file:text-white hover:file:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
                        />
                        {uploading ? (
                          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#07542f]">
                            <Loader2 className="animate-spin" size={14} aria-hidden="true" />
                            Envoi...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                            <Upload size={14} aria-hidden="true" />
                            Fichier local
                          </span>
                        )}
                      </div>
                      {typeof targetValue === "string" && targetValue ? (
                        <p className="mt-2 break-all text-xs font-medium text-slate-500">Image prête : {targetValue}</p>
                      ) : null}
                    </div>
                    {f.help ? <span className="text-xs font-medium text-slate-500">{f.help}</span> : null}
                  </label>
                );
              }

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
          {formError ? <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{formError}</p> : null}
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
          <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-6 text-center text-sm font-bold text-slate-500">Aucun élément{disableCreate ? "." : ` — cliquez sur « ${newLabel} » pour en ajouter.`}</p>
        ) : (
          <>
          {reorderEndpoint ? (
            <p className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <GripVertical size={14} aria-hidden="true" /> Glissez une ligne (ou utilisez les flèches) pour changer l'ordre d'affichage sur le site.
            </p>
          ) : null}
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                {reorderEndpoint ? <th className="w-8 px-2 py-2"><span className="sr-only">Réordonner</span></th> : null}
                {columns.map((c) => <th key={c.label} className="px-3 py-2">{c.label}</th>)}
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={String(row[idField] ?? i)}
                  className={`border-b border-slate-100 hover:bg-[#fbfcf8] ${dragIndex === i ? "opacity-50" : ""}`}
                  onDragOver={reorderEndpoint ? (event) => event.preventDefault() : undefined}
                  onDrop={reorderEndpoint ? () => dropOnRow(i) : undefined}
                >
                  {reorderEndpoint ? (
                    <td className="px-2 py-2.5 align-top">
                      <span
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragEnd={() => setDragIndex(null)}
                        aria-label="Glisser pour réordonner"
                        className="inline-flex cursor-grab items-center text-slate-400 hover:text-slate-700 active:cursor-grabbing"
                      >
                        <GripVertical size={16} aria-hidden="true" />
                      </span>
                    </td>
                  ) : null}
                  {columns.map((c) => <td key={c.label} className="px-3 py-2.5 align-top text-slate-700">{c.render(row)}</td>)}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {reorderEndpoint ? (
                        <span className="inline-flex overflow-hidden rounded-md border border-slate-300">
                          <button
                            onClick={() => moveRow(i, -1)}
                            disabled={i === 0 || reordering}
                            aria-label="Monter"
                            className="focus-ring inline-flex items-center px-1.5 py-1.5 text-[#002f1d] hover:bg-[#fbfcf8] disabled:opacity-30"
                            type="button"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveRow(i, 1)}
                            disabled={i === rows.length - 1 || reordering}
                            aria-label="Descendre"
                            className="focus-ring inline-flex items-center border-l border-slate-300 px-1.5 py-1.5 text-[#002f1d] hover:bg-[#fbfcf8] disabled:opacity-30"
                            type="button"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </span>
                      ) : null}
                      {rowActions ? rowActions(row, { reload: load }) : null}
                      <button onClick={() => openEdit(row)} className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" type="button">
                        <Pencil size={14} /> Éditer
                      </button>
                      {allowDelete ? (
                        <button onClick={() => void deleteRow(row)} className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-black uppercase text-red-700 hover:bg-red-50" type="button">
                          <Trash2 size={14} /> Supprimer
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>

      {state === "ready" && hasMore ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-500">{rows.length} chargés</span>
          <button
            type="button"
            onClick={() => setLimit((value) => value + PAGE_SIZE)}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-[#002f1d]/20 px-4 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]"
          >
            Charger plus
          </button>
        </div>
      ) : null}
    </section>
  );
}
