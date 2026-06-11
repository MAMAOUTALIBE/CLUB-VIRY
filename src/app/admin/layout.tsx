import type { Metadata } from "next";

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
  return children;
}
