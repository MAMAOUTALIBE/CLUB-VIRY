import type { Metadata } from "next";

// Défense en profondeur : l'espace admin ne doit jamais être indexé,
// en complément du middleware (qui en bloque l'accès public).
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
