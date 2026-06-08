import {
  Activity,
  BadgeEuro,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Handshake,
  Image,
  LayoutDashboard,
  Mail,
  Megaphone,
  Search,
  Shirt,
  Sparkles,
  Target,
  Trophy,
  Users,
  UserSquare2
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AdminDashboardLive } from "@/components/admin/AdminDashboardLive";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "CRM Club"
};

type Module = {
  label: string;
  description: string;
  count: string;
  icon: LucideIcon;
};

type Dashboard = {
  role: string;
  focus: string;
  items: string[];
};

const modules: Module[] = [
  { label: "CMS site", description: "Pages, blocs, menus, footer, banniere.", count: "9 pages", icon: LayoutDashboard },
  { label: "Actualites", description: "Brouillons, planification, SEO, publication.", count: "4 a publier", icon: Megaphone },
  { label: "Medias", description: "Albums, photos, videos, droits image.", count: "12 albums", icon: Image },
  { label: "Familles", description: "Foyers, enfants, documents, historique.", count: "380 foyers", icon: UserSquare2 },
  { label: "Equipes", description: "Effectifs, staff, matchs, presences.", count: "30 equipes", icon: Trophy },
  { label: "Matchs", description: "Calendrier, convocations, resultats.", count: "7 a venir", icon: CalendarDays },
  { label: "Finances", description: "Cotisations, paiements, factures, impayes.", count: "8 relances", icon: BadgeEuro },
  { label: "Boutique", description: "Produits, stocks, commandes, retours.", count: "16 commandes", icon: Shirt },
  { label: "Partenaires", description: "Contrats, relances, visibilite, historique.", count: "3 echeances", icon: Handshake }
];

const dashboards: Dashboard[] = [
  {
    role: "President",
    focus: "Etat general du club",
    items: ["Licencies", "Finances", "Partenaires", "Risques"]
  },
  {
    role: "Tresorier",
    focus: "Tresorerie et paiements",
    items: ["Cotisations", "Commandes", "Factures", "Remboursements"]
  },
  {
    role: "Communication",
    focus: "Site et campagnes",
    items: ["CMS", "Actualites", "Medias", "Newsletters"]
  },
  {
    role: "Sportif",
    focus: "Equipes et activite terrain",
    items: ["Effectifs", "Matchs", "Convocations", "Presences"]
  }
];

const timeline = [
  { time: "09:00", label: "Controle documents U13", icon: FileText },
  { time: "12:30", label: "Publication planning week-end", icon: Megaphone },
  { time: "16:00", label: "Entrainements U15 / U18", icon: Target },
  { time: "19:30", label: "Reunion dirigeants", icon: Users }
];

const automations = [
  "Relance document manquant J+7",
  "Rappel convocation 48h avant match",
  "Alerte stock faible boutique",
  "Digest hebdomadaire president"
];

export default function AdminPage() {
  return (
    <div className="crm-shell-page min-h-screen bg-[#f4f6f1] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#07542f]">Centre de pilotage</p>
              <h2 className="mt-1 text-3xl font-black uppercase text-[#002f1d] sm:text-4xl">Tableau de bord CRM</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Vision operationnelle pour piloter le site, les inscriptions, les equipes, les finances, la boutique et les partenaires.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block min-w-0 sm:w-80">
                <span className="sr-only">Recherche globale</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                <input
                  className="focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm font-bold text-slate-900"
                  placeholder="Rechercher famille, joueur, equipe..."
                  type="search"
                />
              </label>
              <button className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white">
                <Bell size={18} aria-hidden="true" />
                Priorites
              </button>
            </div>
          </header>

          <AdminDashboardLive />

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-[#07542f]">Aujourd'hui</p>
            <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Agenda club</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {timeline.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="grid grid-cols-[64px_1fr] gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-3" key={`${item.time}-${item.label}`}>
                    <p className="text-sm font-black text-[#002f1d]">{item.time}</p>
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 text-[#07542f]" size={18} aria-hidden="true" />
                      <p className="text-sm font-bold leading-5 text-slate-700">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-6" id="modules">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#07542f]">Architecture fonctionnelle</p>
                <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Modules CRM</h3>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Premiere cartographie produit basee sur les modules backend deja prevus et les extensions ciblees du cahier des charges.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={module.label}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-11 items-center justify-center rounded-md bg-[#002f1d] text-[#f7c600]">
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-600">{module.count}</span>
                    </div>
                    <h4 className="mt-4 text-lg font-black uppercase text-[#002f1d]">{module.label}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-[#07542f]">Vues par role</p>
              <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Dashboards cibles</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {dashboards.map((dashboard) => (
                  <article className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-4" key={dashboard.role}>
                    <h4 className="text-base font-black uppercase text-[#002f1d]">{dashboard.role}</h4>
                    <p className="mt-1 text-sm font-bold text-slate-600">{dashboard.focus}</p>
                    <ul className="mt-4 grid gap-2">
                      {dashboard.items.map((item) => (
                        <li className="flex items-center gap-2 text-sm font-bold text-slate-700" key={item}>
                          <CheckCircle2 className="text-[#07542f]" size={16} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-[#002f1d] p-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-[#f7c600]">Automatisations</p>
                  <h3 className="mt-1 text-2xl font-black uppercase">Moteur de relances</h3>
                </div>
                <Activity className="text-[#f7c600]" size={28} aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Les premieres regles a cabler doivent reduire les taches manuelles recurrentes : documents, paiements, convocations et reporting dirigeant.
              </p>
              <div className="mt-5 grid gap-3">
                {automations.map((automation) => (
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 p-3" key={automation}>
                    <Clock3 className="text-[#f7c600]" size={18} aria-hidden="true" />
                    <p className="text-sm font-bold text-white/88">{automation}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-[#f7c600]/30 bg-[#f7c600]/10 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#f7c600]" size={18} aria-hidden="true" />
                  <h4 className="font-black uppercase">Assistant IA interne</h4>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Redaction d'actualites, resumes de match, newsletters, convocations et digests de pilotage, toujours avec validation humaine.
                </p>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase text-[#07542f]">Prochaine phase</p>
                <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Fiches 360 degres</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Module CRM : fiches famille, joueur et inscription (documents, paiements, historique, actions rapides) — activé avec le backend Supabase.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Famille", href: "/admin/familles" },
                  { label: "Joueur", href: "/admin/joueurs" },
                  { label: "Inscription", href: "/admin/inscriptions" }
                ].map((item) => (
                  <Link className="focus-ring rounded-lg border border-slate-200 bg-[#fbfcf8] p-4 hover:border-[#f7c600]" href={item.href} key={item.label}>
                    <Mail className="text-[#07542f]" size={20} aria-hidden="true" />
                    <p className="mt-3 text-lg font-black uppercase text-[#002f1d]">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-600">Documents, paiements, notes, activite.</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
