import { Admin360Explorer } from "@/components/admin/Admin360Explorer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "CRM Familles"
};

export default function AdminFamiliesPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="px-4 py-5 sm:px-6 lg:px-8">
          <Admin360Explorer
            description="Vue 360 des foyers : enfants rattaches, membres du foyer, contact principal, documents et paiements a suivre."
            endpoint="/api/admin/families?limit=100"
            kind="families"
            title="Familles"
          />
        </main>
      </div>
    </div>
  );
}
