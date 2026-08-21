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
      description="Abonnements des licenciés, familles et partenaires. Créés automatiquement à la validation d'une inscription (un abonnement FAMILLE pour le parent). Vous pouvez suspendre, annuler ou archiver un abonnement — l'archivage reste réversible depuis la corbeille."
      endpoint="/api/admin/subscriptions?limit=200"
      dataKey="subscriptions"
      statuses={STATUSES}
      titleFields={["profile_name"]}
      archiveLabel="Archiver"
      columns={[
        { label: "Type", field: "type" },
        { label: "Email", field: "profile_email" },
        { label: "Source", field: "source" }
      ]}
    />
  );
}
