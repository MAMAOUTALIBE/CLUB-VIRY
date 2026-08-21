import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";
import { PartnersAdmin } from "@/components/admin/modules/PartnersAdmin";

export const metadata = {
  title: "CRM Partenaires"
};

const requestStatuses = [
  { status: "PENDING", label: "En attente" },
  { status: "CONTACTED", label: "Contacté" },
  { status: "ACCEPTED", label: "Accepté" },
  { status: "REJECTED", label: "Refusé" },
  { status: "ARCHIVED", label: "Archivé" }
];

export default function AdminPartenairesPage() {
  return (
    <>
          <AdminModuleBoard
            title="Demandes de partenariat"
            description="Entreprises qui souhaitent soutenir le club : qualification et suivi des échanges."
            endpoint="/api/admin/partners/requests?limit=100"
            dataKey="requests"
            statuses={requestStatuses}
            titleFields={["company_name"]}
            columns={[
              { label: "Contact", field: "contact_name" },
              { label: "Email", field: "email" },
              { label: "Téléphone", field: "phone" }
            ]}
          />
          <PartnersAdmin />
    </>
  );
}
