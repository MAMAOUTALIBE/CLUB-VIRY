"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super admin" },
  { value: "ADMIN_CLUB", label: "Admin club" },
  { value: "DIRIGEANT", label: "Dirigeant" },
  { value: "EDUCATEUR", label: "Éducateur" },
  { value: "FAMILLE", label: "Famille" },
  { value: "JOUEUR", label: "Joueur" },
  { value: "MEMBRE", label: "Membre" },
  { value: "PARTENAIRE", label: "Partenaire" },
  { value: "VISITEUR", label: "Visiteur" }
];

const STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "PENDING", label: "En attente" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "ARCHIVED", label: "Archivé" }
];

function userName(row: Record<string, unknown>): string {
  const display = (row.display_name as string | null)?.trim();
  if (display && !display.includes("@")) return display;
  const name = `${(row.first_name as string | null) ?? ""} ${(row.last_name as string | null) ?? ""}`.trim();
  return name || (row.email as string | null) || "—";
}

export function UtilisateursAdmin() {
  return (
    <AdminCrud
      title="Utilisateurs & rôles"
      description="Gérez les comptes et leurs rôles. La création de compte se fait à l'inscription ; ici vous ajustez rôle, statut et profil. Garde anti-élévation : vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre (sauf SUPER_ADMIN)."
      endpoint="/api/admin/users"
      listEndpoint="/api/admin/users?limit=200"
      listKey="users"
      itemKey="profile"
      disableCreate
      fields={[
        { name: "role", label: "Rôle", type: "select", options: ROLES },
        { name: "status", label: "Statut", type: "select", options: STATUSES },
        { name: "displayName", label: "Nom affiché", rowKey: "display_name", fullWidth: true },
        { name: "firstName", label: "Prénom", rowKey: "first_name" },
        { name: "lastName", label: "Nom", rowKey: "last_name" },
        { name: "phone", label: "Téléphone" }
      ]}
      columns={[
        { label: "Utilisateur", render: (r) => <span className="font-bold text-[#002f1d]">{userName(r)}</span> },
        { label: "Email", render: (r) => String(r.email ?? "—") },
        { label: "Rôle", render: (r) => ROLES.find((x) => x.value === r.role)?.label ?? String(r.role ?? "—") },
        { label: "Statut", render: (r) => STATUSES.find((x) => x.value === r.status)?.label ?? String(r.status ?? "—") }
      ]}
    />
  );
}
