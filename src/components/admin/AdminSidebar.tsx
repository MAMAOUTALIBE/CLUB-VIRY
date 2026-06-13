"use client";

import {
  BadgeEuro,
  Bell,
  CalendarDays,
  Camera,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Landmark,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Target,
  Trophy,
  UserSquare2,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };
type Pole = { title: string; icon: LucideIcon; items: NavItem[] };

// Navigation regroupée par pôles (cf. docs/REFONTE-CRM-2026.md). Tous les liens pointent vers
// des pages existantes : ce regroupement est purement organisationnel (non destructif).
const POLES: Pole[] = [
  {
    title: "Club & contenus",
    icon: Newspaper,
    items: [
      { label: "Actualités", href: "/admin/actualites", icon: Newspaper },
      { label: "Médias", href: "/admin/medias", icon: Camera }
    ]
  },
  {
    title: "Sportif",
    icon: Trophy,
    items: [
      { label: "Équipes", href: "/admin/equipes", icon: Shield },
      { label: "Joueurs", href: "/admin/joueurs", icon: Users },
      { label: "Encadrement", href: "/admin/encadrement", icon: GraduationCap },
      { label: "Direction", href: "/admin/direction", icon: Landmark },
      { label: "Matchs & calendrier", href: "/admin/calendrier", icon: CalendarDays },
      { label: "Détections", href: "/admin/recrutement", icon: Target }
    ]
  },
  {
    title: "Familles & licenciés",
    icon: UserSquare2,
    items: [
      { label: "Familles", href: "/admin/familles", icon: UserSquare2 },
      { label: "Inscriptions", href: "/admin/inscriptions", icon: ClipboardCheck },
      { label: "Abonnements", href: "/admin/abonnements", icon: Bell }
    ]
  },
  {
    title: "Partenaires",
    icon: Handshake,
    items: [{ label: "Partenaires", href: "/admin/partenaires", icon: Handshake }]
  },
  {
    title: "Business",
    icon: BadgeEuro,
    items: [
      { label: "Boutique", href: "/admin/boutique", icon: ShoppingBag },
      { label: "Finances", href: "/admin/finances", icon: BadgeEuro }
    ]
  },
  {
    title: "Communication",
    icon: Mail,
    items: [
      { label: "Messages", href: "/admin/messages", icon: Mail },
      { label: "File d'envoi", href: "/admin/communication", icon: Send }
    ]
  },
  {
    title: "Administration",
    icon: Settings,
    items: [{ label: "Paramètres", href: "/admin/parametres", icon: Settings }]
  }
];

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const activePole = POLES.find((pole) => pole.items.some((item) => isActiveHref(pathname, item.href)))?.title ?? null;
  const [open, setOpen] = useState<Set<string>>(() => new Set(activePole ? [activePole] : []));

  function togglePole(title: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    window.location.href = "/connexion";
  }

  const pilotageActive = pathname === "/admin";

  return (
    <aside className="border-b border-white/10 bg-[#002f1d] px-4 py-5 text-white lg:border-b-0 lg:border-r">
      <Link className="focus-ring flex items-center gap-3 rounded-md px-1" href="/admin">
        <div className="flex size-11 items-center justify-center rounded-md bg-[#f7c600] text-[#002f1d]">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#f7c600]">ES Viry-Chatillon</p>
          <p className="text-lg font-black uppercase">CRM Club</p>
        </div>
      </Link>

      <nav className="mt-7 grid gap-1" aria-label="Navigation CRM">
        <Link
          aria-current={pilotageActive ? "page" : undefined}
          className={`focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-black uppercase transition-colors ${
            pilotageActive ? "bg-[#f7c600] text-[#002f1d] shadow-sm" : "text-white hover:bg-white/10"
          }`}
          href="/admin"
        >
          <LayoutDashboard size={18} aria-hidden="true" /> Pilotage
        </Link>

        {POLES.map((pole) => {
          const PoleIcon = pole.icon;
          const isOpen = open.has(pole.title);
          const hasActive = pole.items.some((item) => isActiveHref(pathname, item.href));
          const panelId = `pole-${pole.title.replace(/\s+/g, "-").replace(/[^a-zA-Z-]/g, "")}`;

          return (
            <div key={pole.title}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => togglePole(pole.title)}
                className={`focus-ring mt-1 flex min-h-10 w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                  hasActive ? "text-[#f7c600]" : "text-white/55 hover:text-white"
                }`}
              >
                <PoleIcon size={15} aria-hidden="true" />
                <span className="flex-1 text-left">{pole.title}</span>
                <ChevronDown size={14} aria-hidden="true" className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen ? (
                <div id={panelId} className="ml-2 grid gap-1 border-l border-white/10 pl-2">
                  {pole.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveHref(pathname, item.href);
                    return (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={`focus-ring flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                          active ? "bg-[#f7c600] text-[#002f1d] shadow-sm" : "text-white/82 hover:bg-white/10 hover:text-white"
                        }`}
                        href={item.href}
                        key={item.href}
                      >
                        <Icon size={17} aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg border border-[#f7c600]/30 bg-white/8 p-4">
        <p className="text-xs font-black uppercase text-[#f7c600]">Saison active</p>
        <p className="mt-1 text-2xl font-black">2025 / 2026</p>
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
