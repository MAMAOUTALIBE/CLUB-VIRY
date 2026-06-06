import {
  BadgeEuro,
  ClipboardCheck,
  Handshake,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserSquare2,
  Users
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const navItems: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Pilotage", href: "/admin", icon: LayoutDashboard },
  { label: "Inscriptions", href: "/admin/inscriptions", icon: ClipboardCheck },
  { label: "Familles", href: "/admin/familles", icon: UserSquare2 },
  { label: "Joueurs", href: "/admin/joueurs", icon: Users },
  { label: "Sportif", href: "/admin#modules", icon: Trophy },
  { label: "Finances", href: "/admin#modules", icon: BadgeEuro },
  { label: "Boutique", href: "/admin#modules", icon: Package },
  { label: "Partenaires", href: "/admin#modules", icon: Handshake },
  { label: "Automatisations", href: "/admin#modules", icon: Sparkles }
];

export function AdminSidebar() {
  return (
    <aside className="border-b border-white/10 bg-[#002f1d] px-5 py-5 text-white lg:border-b-0 lg:border-r">
      <Link className="focus-ring flex items-center gap-3 rounded-md" href="/admin">
        <div className="flex size-11 items-center justify-center rounded-md bg-[#f7c600] text-[#002f1d]">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#f7c600]">ES Viry-Chatillon</p>
          <h1 className="text-lg font-black uppercase">CRM Club</h1>
        </div>
      </Link>

      <nav className="mt-8 grid gap-2" aria-label="Navigation CRM">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-white/82 hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.label}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-[#f7c600]/30 bg-white/8 p-4">
        <p className="text-xs font-black uppercase text-[#f7c600]">Saison active</p>
        <p className="mt-1 text-2xl font-black">2025 / 2026</p>
        <p className="mt-2 text-sm leading-6 text-white/76">Pilotage centralise du club, des familles, des equipes et des flux financiers.</p>
      </div>
    </aside>
  );
}
