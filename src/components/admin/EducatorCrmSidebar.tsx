"use client";

import { ClipboardCheck, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function EducatorCrmSidebar() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    window.location.href = "/connexion";
  }

  return (
    <aside className="border-b border-white/10 bg-[#002f1d] px-4 py-4 text-white lg:border-b-0 lg:border-r lg:py-5">
      <Link className="focus-ring flex items-center gap-3 rounded-md px-1" href="/admin/convocations">
        <div className="flex size-11 items-center justify-center rounded-md bg-[#f7c600] text-[#002f1d]">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#f7c600]">ES Viry-Chatillon</p>
          <p className="text-lg font-black uppercase">CRM Educateur</p>
        </div>
      </Link>

      <nav className="mt-6 grid gap-1" aria-label="Navigation CRM éducateur">
        <Link
          aria-current="page"
          className="focus-ring flex min-h-11 items-center gap-3 rounded-md bg-[#f7c600] px-3 py-2 text-sm font-black uppercase text-[#002f1d] shadow-sm"
          href="/admin/convocations"
        >
          <ClipboardCheck size={18} aria-hidden="true" />
          Convocations
        </Link>
      </nav>

      <div className="mt-6 rounded-lg border border-[#f7c600]/30 bg-white/8 p-4">
        <p className="text-xs font-black uppercase text-[#f7c600]">Espace sécurisé</p>
        <p className="mt-1 text-sm font-bold text-white/85">Les convocations sont gérées côté CRM.</p>
      </div>

      <button
        className="focus-ring mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-black uppercase text-white/90 transition-colors hover:bg-white/10"
        onClick={() => void handleLogout()}
        type="button"
      >
        <LogOut size={18} aria-hidden="true" /> Se déconnecter
      </button>
    </aside>
  );
}
