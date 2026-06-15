import { EducatorCrmSidebar } from "@/components/admin/EducatorCrmSidebar";
import { EducatorSpace } from "@/components/educator/EducatorSpace";

export const metadata = {
  title: "CRM Convocations",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function AdminConvocationsPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <EducatorCrmSidebar />
        <main id="contenu" className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="border-b border-slate-200 pb-5">
            <p className="text-xs font-black uppercase text-[#07542f]">CRM éducateur</p>
            <h1 className="mt-1 text-3xl font-black uppercase text-[#002f1d] sm:text-4xl">Convocations</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Gérez les équipes, matchs, présences et convocations depuis l'espace sécurisé du club.
            </p>
          </header>

          <section className="mt-6">
            <EducatorSpace />
          </section>
        </main>
      </div>
    </div>
  );
}
