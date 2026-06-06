import { Admin360Explorer } from "@/components/admin/Admin360Explorer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "CRM Inscriptions"
};

export default function AdminRegistrationsPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Admin360Explorer
            description="Vue 360 des dossiers : statut, joueur, famille, documents, paiement, validation et affectation equipe."
            endpoint="/api/admin/registrations?limit=100"
            kind="registrations"
            title="Inscriptions"
          />
        </main>
      </div>
    </div>
  );
}
