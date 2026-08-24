"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminCrud } from "@/components/admin/AdminCrud";
import { REFERENCE_LIST_KINDS, referenceListKindLabel } from "@/lib/reference-lists";
import { CUSTOM_FIELD_ENTITIES } from "@/lib/custom-fields";

const KIND_OPTIONS = REFERENCE_LIST_KINDS.map((k) => ({ value: k.value, label: k.label }));
const ENTITY_KEYS = CUSTOM_FIELD_ENTITIES.map((e) => `${e.value} (${e.label})`).join(", ");

type ListRow = { id: string; name: string; key: string };

export function ReferentielsAdmin() {
  const [lists, setLists] = useState<ListRow[]>([]);
  const [selected, setSelected] = useState<string>("");

  const loadLists = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reference-lists", { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      const rows: ListRow[] = json?.ok && Array.isArray(json.data?.referenceLists) ? json.data.referenceLists : [];
      setLists(rows);
      setSelected((current) => (current && rows.some((r) => r.id === current) ? current : rows[0]?.id ?? ""));
    } catch {
      /* silencieux : l'écran des listes ci-dessous affichera l'erreur */
    }
  }, []);

  useEffect(() => {
    // setState différé (même patron qu'AdminCrud) pour ne pas déclencher set-state-in-effect.
    const t = window.setTimeout(() => void loadLists(), 0);
    return () => window.clearTimeout(t);
  }, [loadLists]);

  const selectedList = lists.find((l) => l.id === selected);

  return (
    <div className="space-y-8">
      <AdminCrud
        title="Listes de référence"
        description="Créez vos référentiels : statuts, tags, étapes, catégories… Chaque liste regroupe des valeurs (gérées ci-dessous) réutilisables dans le CRM. Une liste « TAG » peut être restreinte à certaines fiches via « Fiches concernées »."
        endpoint="/api/admin/reference-lists"
        listKey="referenceLists"
        itemKey="referenceList"
        newLabel="Nouvelle liste"
        allowDelete
        deleteMode="soft"
        rowLabel={(r) => `la liste « ${String(r.name ?? "")} »`}
        fields={[
          { name: "name", label: "Nom de la liste", required: true, fullWidth: true, placeholder: "Étapes de recrutement" },
          { name: "key", label: "Clé technique", required: true, placeholder: "etapes_recrutement", help: "Minuscules, chiffres, « _ ». Non modifiable après création." },
          { name: "kind", label: "Type de liste", type: "select", options: KIND_OPTIONS },
          {
            name: "appliesTo",
            label: "Fiches concernées (tags)",
            type: "textarea",
            fullWidth: true,
            rowKey: "applies_to",
            help: `Pour une liste TAG : clés de fiches, séparées par une virgule. Vide = aucune restriction. Clés valides : ${ENTITY_KEYS}`,
            toPayload: (raw) => raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
            fromRowValue: (row) => (Array.isArray(row.applies_to) ? (row.applies_to as string[]).join(", ") : "")
          },
          { name: "description", label: "Description", type: "textarea", placeholder: "À quoi sert cette liste ? (facultatif)" },
          { name: "orderIndex", label: "Ordre", type: "number", rowKey: "order_index" }
        ]}
        columns={[
          { label: "Liste", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
          { label: "Clé", render: (r) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{String(r.key ?? "—")}</code> },
          { label: "Type", render: (r) => referenceListKindLabel(String(r.kind ?? "")) },
          { label: "Système", render: (r) => (r.is_system ? <span className="text-xs font-black text-[#07542f]">protégée</span> : "—") }
        ]}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-[#07542f]">Valeurs de la liste</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Valeurs</h2>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            Liste :
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900"
            >
              {lists.length === 0 ? <option value="">— Aucune liste —</option> : null}
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void loadLists()} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-xs font-black uppercase text-slate-700 hover:border-[#f7c600]">
              Rafraîchir
            </button>
          </label>
        </div>

        {selectedList ? (
          <div className="mt-4">
            <AdminCrud
              key={selectedList.id}
              title={`Valeurs — ${selectedList.name}`}
              description="Les valeurs de cette liste. Réordonnables par glisser-déposer. « Actif » = proposé ; « Par défaut » = valeur pré-sélectionnée."
              endpoint="/api/admin/reference-items"
              listEndpoint={`/api/admin/reference-items?list=${selectedList.id}`}
              listKey="referenceItems"
              itemKey="referenceItem"
              newLabel="Nouvelle valeur"
              allowDelete
              deleteMode="soft"
              reorderEndpoint="/api/admin/reference-items/reorder"
              rowLabel={(r) => `la valeur « ${String(r.label ?? r.value ?? "")} »`}
              fields={[
                { name: "listId", label: "Liste", type: "select", options: [{ value: selectedList.id, label: selectedList.name }], help: "Liste d'appartenance (non modifiable)." },
                { name: "label", label: "Libellé", required: true, fullWidth: true, placeholder: "Contacté" },
                { name: "value", label: "Valeur technique", required: true, placeholder: "contacte", help: "Minuscules, chiffres, « - » ou « _ »." },
                { name: "color", label: "Couleur", placeholder: "#f7c600", help: "Code hexadécimal (facultatif)." },
                { name: "orderIndex", label: "Ordre", type: "number", rowKey: "order_index" },
                { name: "isActive", label: "Actif", type: "boolean", rowKey: "is_active" },
                { name: "isDefault", label: "Par défaut", type: "boolean", rowKey: "is_default" }
              ]}
              columns={[
                {
                  label: "Valeur",
                  render: (r) => (
                    <span className="inline-flex items-center gap-2 font-bold text-[#002f1d]">
                      {typeof r.color === "string" && r.color ? <span className="inline-block size-3 rounded-full" style={{ backgroundColor: r.color }} aria-hidden="true" /> : null}
                      {String(r.label ?? "—")}
                    </span>
                  )
                },
                { label: "Clé", render: (r) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{String(r.value ?? "—")}</code> },
                { label: "Actif", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) },
                { label: "Défaut", render: (r) => (r.is_default ? "★" : "—") }
              ]}
            />
          </div>
        ) : (
          <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-[#fbfcf8] p-4 text-sm font-bold text-slate-500">
            Créez d'abord une liste ci-dessus, puis sélectionnez-la pour gérer ses valeurs.
          </p>
        )}
      </section>
    </div>
  );
}
