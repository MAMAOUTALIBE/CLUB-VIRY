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
    <>
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
    </>
  );
}
