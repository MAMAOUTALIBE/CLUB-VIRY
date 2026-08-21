import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";

export const metadata = {
  title: "CRM Détections"
};

const statuses = [
  { status: "PENDING", label: "En attente" },
  { status: "CONTACTED", label: "Contacté" },
  { status: "TRIAL_SCHEDULED", label: "Essai planifié" },
  { status: "ACCEPTED", label: "Accepté" },
  { status: "REJECTED", label: "Refusé" },
  { status: "ARCHIVED", label: "Archivé" }
];

export default function AdminRecrutementPage() {
  return (
    <>
          <AdminModuleBoard
            title="Détections / Recrutement"
            description="Suivi des candidatures de détection : qualification, prise de contact, essais et décisions."
            endpoint="/api/admin/recruitment/applications?limit=100"
            exportHref="/api/admin/exports/recruitment"
            dataKey="applications"
            statuses={statuses}
            titleFields={["first_name", "last_name"]}
            columns={[
              { label: "Poste", field: "position" },
              { label: "Club actuel", field: "current_club" },
              { label: "Email", field: "email" },
              { label: "Téléphone", field: "phone" }
            ]}
          />
    </>
  );
}
