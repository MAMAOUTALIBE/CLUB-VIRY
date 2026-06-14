import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PermissionsReference } from "@/components/admin/modules/PermissionsReference";
import { UtilisateursAdmin } from "@/components/admin/modules/UtilisateursAdmin";

export const metadata = {
  title: "CRM Utilisateurs & permissions"
};

export default function AdminUtilisateursPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <UtilisateursAdmin />
          <PermissionsReference />
        </main>
      </div>
    </div>
  );
}
