"use client";

import {
  BadgeEuro,
  CalendarDays,
  Camera,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Landmark,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Target,
  Trophy,
  UserSquare2,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const navItems: Array<{ label: string; href: string; icon: LucideIcon; badge?: number }> = [
  { label: "Pilotage", href: "/admin", icon: LayoutDashboard },
  { label: "Actualités", href: "/admin/actualites", icon: Newspaper },
  { label: "Calendrier", href: "/admin/calendrier", icon: CalendarDays },
  { label: "Équipes", href: "/admin/equipes", icon: Shield },
  { label: "Encadrement", href: "/admin/encadrement", icon: GraduationCap },
  { label: "Direction", href: "/admin/direction", icon: Landmark },
  { label: "Inscriptions", href: "/admin/inscriptions", icon: ClipboardCheck },
  { label: "Familles", href: "/admin/familles", icon: UserSquare2 },
  { label: "Joueurs", href: "/admin/joueurs", icon: Users },
  { label: "Détections", href: "/admin/recrutement", icon: Target },
  { label: "Finances", href: "/admin/finances", icon: BadgeEuro },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Partenaires", href: "/admin/partenaires", icon: Handshake },
  { label: "Boutique", href: "/admin/boutique", icon: ShoppingBag },
  { label: "Médias", href: "/admin/medias", icon: Camera },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
  { label: "Sportif", href: "/admin#modules", icon: Trophy },
  { label: "Automatisations", href: "/admin#modules", icon: Sparkles }
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    window.location.href = "/connexion";
  }

  const isActive = (href: string) => {
    if (href.includes("#")) {
      return false;
    }
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="border-b border-white/10 bg-[#002f1d] px-5 py-5 text-white lg:border-b-0 lg:border-r">
      <Link className="focus-ring flex items-center gap-3 rounded-md" href="/admin">
        <div className="flex size-11 items-center justify-center rounded-md bg-[#f7c600] text-[#002f1d]">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#f7c600]">ES Viry-Chatillon</p>
          <p className="text-lg font-black uppercase">CRM Club</p>
        </div>
      </Link>

      <nav className="mt-8 grid gap-2" aria-label="Navigation CRM">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-[#f7c600] text-[#002f1d] shadow-sm"
                  : "text-white/82 hover:bg-white/10 hover:text-white"
              }`}
              href={item.href}
              key={item.label}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge ? (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-black ${
                    active ? "bg-[#002f1d] text-[#f7c600]" : "bg-[#f7c600] text-[#002f1d]"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-[#f7c600]/30 bg-white/8 p-4">
        <p className="text-xs font-black uppercase text-[#f7c600]">Saison active</p>
        <p className="mt-1 text-2xl font-black">2025 / 2026</p>
        <p className="mt-2 text-sm leading-6 text-white/76">Pilotage centralise du club, des familles, des equipes et des flux financiers.</p>
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
