import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SeasonsAdmin } from "@/components/admin/modules/SeasonsAdmin";

export const metadata = {
  title: "CRM Saisons"
};

export default function AdminSeasonsPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <SeasonsAdmin />
        </main>
      </div>
    </div>
  );
}
