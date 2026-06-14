import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NewsAdmin } from "@/components/admin/modules/NewsAdmin";

export const metadata = {
  title: "CRM Actualités"
};

export default function AdminNewsPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="px-4 py-5 sm:px-6 lg:px-8">
          <NewsAdmin />
        </main>
      </div>
    </div>
  );
}
