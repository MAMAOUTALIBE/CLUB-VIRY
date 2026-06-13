"use client";

import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";

const STATUSES = [
  { status: "ACTIVE", label: "Actif" },
  { status: "SUSPENDED", label: "Suspendu" },
  { status: "CANCELLED", label: "Annulé" }
];

export function AbonnementsAdmin() {
  return (
    <AdminModuleBoard
      title="Abonnements"
      description="Abonnements des licenciés, familles et partenaires. Créés automatiquement à la validation d'une inscription (un abonnement FAMILLE pour le parent). Vous pouvez suspendre ou annuler un abonnement."
      endpoint="/api/admin/subscriptions?limit=200"
      dataKey="subscriptions"
      statuses={STATUSES}
      titleFields={["profile_name"]}
      columns={[
        { label: "Type", field: "type" },
        { label: "Email", field: "profile_email" },
        { label: "Source", field: "source" }
      ]}
      demo={[]}
    />
  );
}
