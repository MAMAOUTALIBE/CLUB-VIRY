"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

const GENDERS = [
  { value: "MIXTE", label: "Mixte" },
  { value: "MASCULIN", label: "Masculin" },
  { value: "FEMININ", label: "Féminin" }
];

function genderLabel(value: unknown): string {
  return GENDERS.find((gender) => gender.value === value)?.label ?? String(value ?? "—");
}

export function CategoriesAdmin() {
  return (
    <AdminCrud
      title="Catégories"
      description="Gérez les catégories d'âge du club (École de foot, Préformation, Seniors, Féminines…). Elles structurent les équipes et les inscriptions. « Active » = proposée aux familles."
      endpoint="/api/admin/categories"
      listKey="categories"
      itemKey="category"
      newLabel="Nouvelle catégorie"
      fields={[
        { name: "name", label: "Nom", required: true, fullWidth: true, placeholder: "Seniors" },
        { name: "ageRange", label: "Tranche d'âge", rowKey: "age_range", required: true, placeholder: "U6 à U11" },
        { name: "gender", label: "Genre", type: "select", options: GENDERS },
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index", help: "Petit nombre = affiché en premier." },
        { name: "isActive", label: "Active", type: "boolean", rowKey: "is_active" }
      ]}
      columns={[
        { label: "Catégorie", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        { label: "Âge", render: (r) => String(r.age_range ?? "—") },
        { label: "Genre", render: (r) => genderLabel(r.gender) },
        { label: "Ordre", render: (r) => String(r.order_index ?? "—") },
        {
          label: "Active",
          render: (r) =>
            r.is_active ? <span className="font-black text-emerald-700">✓ Oui</span> : <span className="text-slate-400">Non</span>
        }
      ]}
    />
  );
}
