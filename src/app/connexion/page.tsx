import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginPanel } from "@/components/admin/AdminLoginPanel";
import { DesktopOnly, MobileScreen } from "@/components/MobilePage";

export const metadata: Metadata = {
  title: "Connexion CRM",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function ConnexionPage() {
  return (
    <>
      <MobileScreen
        eyebrow="Accès sécurisé"
        title="Connexion"
        description="Connectez-vous avec un compte club habilité."
        scrollable
      >
        <div className="pb-2">
          <Suspense fallback={<div className="official-card rounded-lg bg-white p-6 text-sm font-bold text-slate-700">Chargement...</div>}>
            <AdminLoginPanel />
          </Suspense>
        </div>
      </MobileScreen>
      <DesktopOnly>
        <section className="min-h-[calc(100vh_-_var(--header-h,0px))] bg-[#f4f6f1] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto grid min-h-[calc(100vh_-_var(--header-h,0px)_-_5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase text-[#07542f]">Acces securise</p>
              <h1 className="mt-3 text-4xl font-black uppercase leading-tight text-[#002f1d] sm:text-5xl">Connexion CRM Club</h1>
              <p className="mt-4 text-base font-bold leading-7 text-slate-700">
                Identifiez-vous avec un compte administrateur, dirigeant ou equipe habilitee pour ouvrir le centre de pilotage.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Inscriptions", "Familles", "Finances"].map((item) => (
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-black uppercase text-[#002f1d]" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Suspense fallback={<div className="official-card rounded-lg bg-white p-6 text-sm font-bold text-slate-700">Chargement...</div>}>
              <AdminLoginPanel />
            </Suspense>
          </div>
        </section>
      </DesktopOnly>
    </>
  );
}
