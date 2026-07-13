import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CategoriesAdmin } from "@/components/admin/modules/CategoriesAdmin";

export const metadata = {
  title: "CRM Catégories"
};

export default function AdminCategoriesPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main id="contenu" className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <CategoriesAdmin />
        </main>
      </div>
    </div>
  );
}
