import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";

export const metadata = {
  title: "CRM Messages"
};

const statuses = [
  { status: "PENDING", label: "En attente" },
  { status: "CONTACTED", label: "Traité" },
  { status: "ACCEPTED", label: "Clôturé" },
  { status: "REJECTED", label: "Rejeté" },
  { status: "ARCHIVED", label: "Archivé" }
];

export default function AdminMessagesPage() {
  return (
    <>
          <AdminModuleBoard
            title="Messages contact"
            description="Boîte de réception des messages envoyés depuis le formulaire de contact du site. Attribuez un message pour savoir qui répond."
            endpoint="/api/admin/contact-requests?limit=100"
            exportHref="/api/admin/exports/contact-requests"
            dataKey="messages"
            statuses={statuses}
            titleFields={["full_name", "subject"]}
            assignable
            columns={[
              { label: "Sujet", field: "subject" },
              { label: "Email", field: "email" },
              { label: "Téléphone", field: "phone" },
              { label: "Source", field: "source" }
            ]}
          />
    </>
  );
}
