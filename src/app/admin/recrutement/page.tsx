import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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

const demo = [
  { id: "d1", first_name: "Adam", last_name: "Benali", position: "Milieu", current_club: "US Grigny", email: "adam.benali@example.com", phone: "06 12 34 56 78", status: "PENDING", created_at: "2026-05-28T10:00:00Z" },
  { id: "d2", first_name: "Lina", last_name: "Moreau", position: "Attaquante", current_club: "FC Ris", email: "lina.moreau@example.com", phone: "06 22 33 44 55", status: "CONTACTED", created_at: "2026-05-21T10:00:00Z" },
  { id: "d3", first_name: "Yanis", last_name: "Diallo", position: "Défenseur", current_club: "—", email: "yanis.diallo@example.com", phone: "06 33 44 55 66", status: "TRIAL_SCHEDULED", created_at: "2026-05-12T10:00:00Z" },
  { id: "d4", first_name: "Sofia", last_name: "Lopez", position: "Gardienne", current_club: "ES Juvisy", email: "sofia.lopez@example.com", phone: "06 44 55 66 77", status: "ACCEPTED", created_at: "2026-04-30T10:00:00Z" }
];

export default function AdminRecrutementPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
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
            demo={demo}
          />
        </main>
      </div>
    </div>
  );
}
