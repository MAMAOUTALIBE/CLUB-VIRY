import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MediaAdmin } from "@/components/admin/modules/MediaAdmin";
import { MediaAssetsAdmin } from "@/components/admin/modules/MediaAssetsAdmin";

export const metadata = {
  title: "CRM Médiathèque"
};

export default function AdminMediaPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="grid gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <MediaAssetsAdmin />
          <MediaAdmin />
        </main>
      </div>
    </div>
  );
}
