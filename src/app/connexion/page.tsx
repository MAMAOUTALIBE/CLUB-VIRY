import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminLoginPanel } from "@/components/admin/AdminLoginPanel";

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
    <section className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-slate-950 sm:px-6 lg:px-8" aria-labelledby="connexion-title">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="max-w-2xl">
          <p className="text-xs font-black uppercase text-[#8a6a00]">ES Viry-Châtillon Football</p>
          <div className="mt-4 h-1 w-14 rounded-full bg-[#f7c600]" />
          <h1 className="mt-6 text-4xl font-black uppercase leading-tight text-[#002f1d] sm:text-5xl" id="connexion-title">
            Accès CRM Club
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600">
            Connectez-vous pour gérer les contenus, les partenaires, les inscriptions et les modules internes du club.
          </p>
          <Link
            className="focus-ring mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-[#002f1d]/15 px-4 text-sm font-black uppercase text-[#002f1d] hover:border-[#002f1d] hover:bg-white"
            href="/"
          >
            Retour au site
          </Link>
        </section>

        <Suspense
          fallback={
            <div className="official-card rounded-lg bg-white p-6 text-sm font-black uppercase text-[#002f1d] shadow-sm">
              Chargement du CRM...
            </div>
          }
        >
          <AdminLoginPanel />
        </Suspense>
      </div>
    </section>
  );
}
