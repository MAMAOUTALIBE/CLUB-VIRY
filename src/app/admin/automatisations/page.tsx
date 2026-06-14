import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AutomationsAdmin } from "@/components/admin/modules/AutomationsAdmin";

export const metadata = {
  title: "CRM Automatisations"
};

export default function AdminAutomationsPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="px-4 py-5 sm:px-6 lg:px-8">
          <AutomationsAdmin />
        </main>
      </div>
    </div>
  );
}
