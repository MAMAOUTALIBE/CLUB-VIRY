import { AdminDashboardLive } from "@/components/admin/AdminDashboardLive";

export const metadata = { title: "Tableau de bord CRM" };

export default function AdminPage() {
  return <><header><h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Bonjour, Administrateur</h1><p className="mt-1 text-sm text-slate-500">Voici l’activité du club aujourd’hui.</p></header><AdminDashboardLive /></>;
}
