"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { AdminCrud } from "@/components/admin/AdminCrud";

const GENDER = [
  { value: "MIXTE", label: "Mixte" },
  { value: "MASCULIN", label: "Masculin" },
  { value: "FEMININ", label: "Féminin" }
];

export function TeamsAdmin() {
  return (
    <AdminCrud
      title="Équipes"
      description="Gérez les équipes du club (fiche, catégorie, photo) puis, via « Effectif & staff », l'encadrement et les joueurs de chaque équipe."
      endpoint="/api/admin/teams"
      listKey="teams"
      itemKey="team"
      newLabel="Nouvelle équipe"
      rowActions={(r) =>
        r.id ? (
          <Link
            href={`/admin/equipes/${String(r.id)}`}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-[#002f1d]/20 bg-[#002f1d] px-2.5 py-1.5 text-xs font-black uppercase text-white hover:bg-[#07542f]"
          >
            <Users size={14} aria-hidden="true" /> Effectif & staff
          </Link>
        ) : null
      }
      fields={[
        { name: "name", label: "Nom de l'équipe", required: true, fullWidth: true, placeholder: "Seniors D1" },
        { name: "gender", label: "Genre", type: "select", options: GENDER },
        { name: "level", label: "Niveau", placeholder: "Départemental D1" },
        { name: "ageRange", label: "Catégorie d'âge", rowKey: "age_range", placeholder: "Seniors / U18 / U15…" },
        { name: "coverImageUrl", label: "Photo (URL)", type: "url", rowKey: "cover_image_url", placeholder: "https://…" },
        { name: "orderIndex", label: "Ordre d'affichage", type: "number", rowKey: "order_index" },
        { name: "isActive", label: "Active (visible)", type: "boolean", rowKey: "is_active" },
        { name: "description", label: "Description", type: "textarea" }
      ]}
      columns={[
        { label: "Équipe", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.name ?? "—")}</span> },
        { label: "Catégorie", render: (r) => String(r.age_range ?? r.level ?? "—") },
        { label: "Genre", render: (r) => GENDER.find((g) => g.value === r.gender)?.label ?? String(r.gender ?? "—") },
        { label: "Active", render: (r) => (r.is_active ? <span className="font-black text-emerald-700">✓ Oui</span> : <span className="text-slate-400">Non</span>) }
      ]}
    />
  );
}
