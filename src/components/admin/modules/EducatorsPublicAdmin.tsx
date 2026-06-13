"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

function fullName(row: Record<string, unknown>): string {
  const display = (row.display_name as string | null)?.trim();
  if (display) return display;
  const first = (row.first_name as string | null)?.trim() ?? "";
  const last = (row.last_name as string | null)?.trim() ?? "";
  return `${first} ${last}`.trim() || "—";
}

export function EducatorsPublicAdmin() {
  return (
    <AdminCrud
      title="Encadrement — publication"
      description="Choisissez les éducateurs visibles sur la page publique /le-club/encadrement. Activez « Afficher sur le site » et renseignez un titre + une biographie publics. Aucune donnée sensible (téléphone, email, date de naissance) n'est exposée."
      endpoint="/api/admin/users"
      listEndpoint="/api/admin/users?role=EDUCATEUR&limit=200"
      listKey="users"
      itemKey="profile"
      disableCreate
      fields={[
        { name: "publicProfile", label: "Afficher sur le site", type: "boolean", rowKey: "public_profile", help: "Rend cet éducateur visible sur la page publique Encadrement." },
        { name: "displayName", label: "Nom affiché (public)", rowKey: "display_name", placeholder: "Prénom Nom", fullWidth: true },
        { name: "publicTitle", label: "Titre / rôle public", rowKey: "public_title", placeholder: "Responsable technique, Éducateur U13…", fullWidth: true },
        { name: "avatarUrl", label: "Photo (URL)", type: "url", rowKey: "avatar_url", placeholder: "https://…" },
        { name: "publicBio", label: "Biographie publique", type: "textarea", rowKey: "public_bio", placeholder: "Quelques lignes de présentation (600 caractères max)." }
      ]}
      columns={[
        { label: "Éducateur", render: (r) => <span className="font-bold text-[#002f1d]">{fullName(r)}</span> },
        { label: "Visible", render: (r) => (r.public_profile ? <span className="font-black text-emerald-700">✓ En ligne</span> : <span className="text-slate-400">Masqué</span>) },
        { label: "Titre public", render: (r) => String(r.public_title ?? "—") }
      ]}
    />
  );
}
