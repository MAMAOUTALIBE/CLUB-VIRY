import type { Metadata } from "next";

import { ToastHost } from "@/components/admin/Toast";

// Défense en profondeur : l'espace admin ne doit jamais être indexé, en complément
// du proxy (src/proxy.ts) qui valide la session Supabase avant de servir ces pages.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only rounded-md bg-[#f7c600] px-4 py-2 text-sm font-black uppercase text-[#002f1d] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Aller au contenu
      </a>
      {children}
      <ToastHost />
    </>
  );
}
