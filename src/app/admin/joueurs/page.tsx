import { Admin360Explorer } from "@/components/admin/Admin360Explorer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "CRM Joueurs"
};

export default function AdminPlayersPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Admin360Explorer
            description="Vue 360 des joueurs : identite, famille rattachee, licence, documents, paiements, equipe et suivi sportif."
            endpoint="/api/admin/players?limit=100"
            kind="players"
            title="Joueurs"
          />
        </main>
      </div>
    </div>
  );
}
