import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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

const demo = [
  { id: "m1", full_name: "Karine Dubois", subject: "Inscription U11", email: "karine.dubois@example.com", phone: "06 11 22 33 44", source: "contact_page", status: "PENDING", created_at: "2026-06-02T09:00:00Z" },
  { id: "m2", full_name: "Marc Petit", subject: "Devenir bénévole", email: "marc.petit@example.com", phone: "—", source: "contact_page", status: "PENDING", created_at: "2026-06-01T14:30:00Z" },
  { id: "m3", full_name: "Société Intersport", subject: "Proposition de partenariat", email: "pro@intersport.example", phone: "01 60 00 00 00", source: "contact_page", status: "CONTACTED", created_at: "2026-05-27T11:00:00Z" },
  { id: "m4", full_name: "Awa Traoré", subject: "Horaires entraînements féminines", email: "awa.traore@example.com", phone: "06 55 66 77 88", source: "contact_page", status: "ACCEPTED", created_at: "2026-05-20T16:45:00Z" }
];

export default function AdminMessagesPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <AdminModuleBoard
            title="Messages contact"
            description="Boîte de réception des messages envoyés depuis le formulaire de contact du site."
            endpoint="/api/admin/contact-requests?limit=100"
            dataKey="messages"
            statuses={statuses}
            titleFields={["full_name", "subject"]}
            columns={[
              { label: "Sujet", field: "subject" },
              { label: "Email", field: "email" },
              { label: "Téléphone", field: "phone" },
              { label: "Source", field: "source" }
            ]}
            demo={demo}
          />
        </main>
      </div>
    </div>
  );
}
