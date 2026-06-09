import { AdminModuleBoard } from "@/components/admin/AdminModuleBoard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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

const partnerStatuses = [
  { status: "Oui", label: "Actif" },
  { status: "Non", label: "Inactif" }
];

const requestsDemo = [
  { id: "r1", company_name: "Boulangerie du Lac", contact_name: "P. Garnier", email: "contact@boulangerie-lac.example", phone: "01 69 00 11 22", status: "PENDING", created_at: "2026-05-30T10:00:00Z" },
  { id: "r2", company_name: "Garage Centre Auto", contact_name: "S. Robert", email: "s.robert@centreauto.example", phone: "01 69 00 33 44", status: "CONTACTED", created_at: "2026-05-24T10:00:00Z" },
  { id: "r3", company_name: "Cabinet Comptable Essonne", contact_name: "L. Marchand", email: "l.marchand@compta91.example", phone: "—", status: "ACCEPTED", created_at: "2026-05-15T10:00:00Z" }
];

const partnersDemo = [
  { id: "p1", name: "Ville de Viry-Châtillon", tier: "Institution", website_url: "https://www.viry-chatillon.fr", is_active: true, created_at: "2025-09-01T10:00:00Z" },
  { id: "p2", name: "Intersport", tier: "Or", website_url: "https://www.intersport.fr", is_active: true, created_at: "2025-09-01T10:00:00Z" },
  { id: "p3", name: "Crédit Mutuel", tier: "Argent", website_url: "https://www.creditmutuel.fr", is_active: true, created_at: "2025-09-01T10:00:00Z" },
  { id: "p4", name: "Ancien sponsor local", tier: "Bronze", website_url: "—", is_active: false, created_at: "2024-09-01T10:00:00Z" }
];

export default function AdminPartenairesPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
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
            demo={requestsDemo}
          />
          <AdminModuleBoard
            title="Partenaires actifs"
            description="Annuaire des partenaires du club et statut d'activité."
            endpoint="/api/admin/partners?limit=100"
            dataKey="partners"
            statuses={partnerStatuses}
            statusField="is_active"
            titleFields={["name"]}
            columns={[
              { label: "Niveau", field: "tier" },
              { label: "Site web", field: "website_url" }
            ]}
            demo={partnersDemo}
          />
        </main>
      </div>
    </div>
  );
}
