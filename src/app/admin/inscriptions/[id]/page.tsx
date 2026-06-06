import { Admin360Detail } from "@/components/admin/Admin360Detail";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Detail inscription CRM"
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRegistrationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Admin360Detail backHref="/admin/inscriptions" endpoint={`/api/admin/registrations/${id}`} kind="registration" />
        </main>
      </div>
    </div>
  );
}
