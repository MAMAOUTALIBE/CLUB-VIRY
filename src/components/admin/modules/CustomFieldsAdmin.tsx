"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";
import {
  CUSTOM_FIELD_ENTITIES,
  CUSTOM_FIELD_TYPES,
  customFieldEntityLabel
} from "@/lib/custom-fields";

const ENTITY_OPTIONS = CUSTOM_FIELD_ENTITIES.map((e) => ({ value: e.value, label: e.label }));
const TYPE_OPTIONS = CUSTOM_FIELD_TYPES.map((t) => ({ value: t.value, label: t.label }));

function typeLabel(value: unknown): string {
  return CUSTOM_FIELD_TYPES.find((t) => t.value === value)?.label ?? String(value ?? "—");
}

export function CustomFieldsAdmin() {
  return (
    <AdminCrud
      title="Champs personnalisés"
      description="Ajoutez vos propres champs sur les fiches du CRM (joueurs, familles, partenaires, candidatures, équipes, actualités) sans toucher au code. Ils apparaissent ensuite dans le formulaire de la fiche concernée. « Actif » = affiché ; sinon masqué (les valeurs déjà saisies sont conservées)."
      endpoint="/api/admin/custom-fields"
      listKey="customFields"
      itemKey="customField"
      newLabel="Nouveau champ"
      allowDelete
      deleteMode="soft"
      reorderEndpoint="/api/admin/custom-fields/reorder"
      rowLabel={(r) => `le champ « ${String(r.label ?? r.key ?? "")} »`}
      fields={[
        { name: "entityType", label: "Sur quelle fiche ?", type: "select", options: ENTITY_OPTIONS, rowKey: "entity_type", required: true, help: "Le type de fiche qui portera ce champ. Non modifiable après création." },
        { name: "label", label: "Libellé affiché", required: true, fullWidth: true, placeholder: "Numéro de licence" },
        { name: "key", label: "Clé technique", required: true, placeholder: "numero_licence", help: "Minuscules, chiffres et « _ ». Non modifiable après création." },
        { name: "type", label: "Type de champ", type: "select", options: TYPE_OPTIONS },
        {
          name: "options",
          label: "Options (listes)",
          type: "textarea",
          fullWidth: true,
          rowKey: "options",
          help: "Une option par ligne. Uniquement pour les types « Liste ».",
          toPayload: (raw) => raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
          fromRowValue: (row) => (Array.isArray(row.options) ? (row.options as string[]).join("\n") : "")
        },
        { name: "required", label: "Obligatoire", type: "boolean" },
        { name: "helpText", label: "Texte d'aide", rowKey: "help_text", placeholder: "Affiché sous le champ (facultatif)" },
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index", help: "Petit nombre = affiché en premier." },
        { name: "isActive", label: "Actif", type: "boolean", rowKey: "is_active" }
      ]}
      columns={[
        { label: "Fiche", render: (r) => <span className="font-bold text-[#002f1d]">{customFieldEntityLabel(String(r.entity_type ?? ""))}</span> },
        { label: "Libellé", render: (r) => String(r.label ?? "—") },
        { label: "Clé", render: (r) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{String(r.key ?? "—")}</code> },
        { label: "Type", render: (r) => typeLabel(r.type) },
        { label: "Oblig.", render: (r) => (r.required ? "Oui" : "—") },
        { label: "Actif", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓ Oui</span> : <span className="text-slate-400">Non</span>) }
      ]}
    />
  );
}
