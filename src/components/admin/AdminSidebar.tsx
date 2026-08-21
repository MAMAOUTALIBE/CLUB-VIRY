"use client";

import { ArrowLeft, BadgeEuro, Camera, ChevronRight, ClipboardCheck, LayoutDashboard, LogOut, Megaphone, Newspaper, Settings, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

type NavGroup = { label: string; icon: LucideIcon; href?: string; children?: { label: string; href: string }[] };
const NAVIGATION: NavGroup[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/admin" },
  { label: "Communication", icon: Megaphone, children: [{ label: "Actualités", href: "/admin/actualites" }, { label: "Messages", href: "/admin/messages" }, { label: "File d’envoi", href: "/admin/communication" }, { label: "Automatisations", href: "/admin/automatisations" }] },
  { label: "Sportif", icon: Trophy, children: [{ label: "Calendrier", href: "/admin/calendrier" }, { label: "Équipes", href: "/admin/equipes" }, { label: "Joueurs", href: "/admin/joueurs" }, { label: "Encadrement", href: "/admin/encadrement" }, { label: "Convocations", href: "/admin/convocations" }, { label: "Classements", href: "/admin/classements" }, { label: "Catégories", href: "/admin/categories" }, { label: "Saisons", href: "/admin/saisons" }, { label: "Détections", href: "/admin/recrutement" }] },
  { label: "Inscriptions", icon: ClipboardCheck, children: [{ label: "Dossiers", href: "/admin/inscriptions" }, { label: "Familles", href: "/admin/familles" }, { label: "Abonnements", href: "/admin/abonnements" }] },
  { label: "Contenu du site", icon: Newspaper, children: [{ label: "Direction", href: "/admin/direction" }, { label: "Partenaires", href: "/admin/partenaires" }] },
  { label: "Médias", icon: Camera, href: "/admin/medias" },
  { label: "Commercial", icon: BadgeEuro, children: [{ label: "Boutique", href: "/admin/boutique" }, { label: "Finances", href: "/admin/finances" }] },
  { label: "Configuration", icon: Settings, children: [{ label: "Utilisateurs", href: "/admin/utilisateurs" }, { label: "Journal d’audit", href: "/admin/journal" }, { label: "Corbeille", href: "/admin/corbeille" }, { label: "Paramètres", href: "/admin/parametres" }] }
];
const isActive = (path: string, href: string) => href === "/admin" ? path === href : path === href || path.startsWith(`${href}/`);

export function AdminSidebar({ collapsed, mobileOpen, educatorOnly, onClose, onExpand }: { collapsed: boolean; mobileOpen: boolean; educatorOnly: boolean; onClose: () => void; onExpand: () => void }) {
  const pathname = usePathname();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null); window.location.href = "/"; };
  const visibleNavigation: NavGroup[] = educatorOnly ? [{ label: "Convocations", icon: ClipboardCheck, href: "/admin/convocations" }] : NAVIGATION;
  const selected = visibleNavigation.find((group) => group.label === selectedGroup && group.children);
  return <aside id="crm-sidebar" className={`crm-sidebar ${collapsed ? "crm-sidebar--collapsed" : ""} ${mobileOpen ? "crm-sidebar--mobile-open" : ""}`} aria-label={educatorOnly ? "Navigation CRM éducateur" : "Navigation principale du CRM"}>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(2,55,35,.91),rgba(1,35,24,.84)),url('/stade/imagepelouse.webp')] bg-cover bg-center bg-no-repeat" />
    <div className="relative flex h-full min-h-0 flex-col px-3 py-4">
      <button id="crm-sidebar-close" className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-lg text-2xl text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd300] lg:hidden" onClick={onClose} aria-label="Fermer le menu" type="button">×</button>
      <Link href={educatorOnly ? "/admin/convocations" : "/admin"} onClick={onClose} className="focus-ring mx-auto flex flex-col items-center rounded-lg text-center"><Image src="/club-logo.svg" width={76} height={76} alt="Logo E.S. Viry-Châtillon" priority className={collapsed ? "lg:size-12" : ""} /><span className={`mt-2 text-sm font-black tracking-wide text-white ${collapsed ? "lg:hidden" : ""}`}>{educatorOnly ? "CRM ÉDUCATEUR" : "E.S. VIRY-CHÂTILLON"}</span></Link>
      <nav className="mt-5 min-h-0 flex-1 space-y-1" aria-label="Rubriques CRM">{selected ? <><button type="button" onClick={() => setSelectedGroup(null)} className="crm-nav-link mb-2 w-full"><ArrowLeft size={20} aria-hidden /><span>Retour</span></button><p className="px-3 pb-2 text-xs font-black uppercase tracking-wide text-[#ffd300]">{selected.label}</p>{selected.children?.map((item) => <Link key={item.href} href={item.href} onClick={onClose} aria-current={isActive(pathname, item.href) ? "page" : undefined} className={`crm-nav-link ${isActive(pathname, item.href) ? "crm-nav-link--active" : ""}`}>{item.label}</Link>)}</> : visibleNavigation.map((group) => {
        const Icon = group.icon; const active = group.href ? isActive(pathname, group.href) : group.children?.some((item) => isActive(pathname, item.href));
        if (group.href) return <Link key={group.label} href={group.href} onClick={onClose} aria-current={active ? "page" : undefined} title={collapsed ? group.label : undefined} className={`crm-nav-link ${active ? "crm-nav-link--active" : ""}`}><Icon size={20} aria-hidden /><span className={collapsed ? "lg:hidden" : ""}>{group.label}</span></Link>;
        return <button key={group.label} type="button" onClick={() => { if (collapsed) onExpand(); setSelectedGroup(group.label); }} aria-label={`Ouvrir ${group.label}`} title={collapsed ? group.label : undefined} className={`crm-nav-link w-full ${active ? "crm-nav-link--active" : ""}`}><Icon size={20} aria-hidden /><span className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>{group.label}</span><ChevronRight size={16} aria-hidden className={collapsed ? "lg:hidden" : ""} /></button>;
      })}</nav>
      <div className={`mt-3 border-t border-white/15 pt-3 text-center text-white ${collapsed ? "lg:hidden" : ""}`}><p className="text-lg font-black text-[#ffd300]">#ESVC</p><p className="mt-1 text-xs text-white/75">Un club, une ville, une passion</p></div>
      <button onClick={() => void logout()} type="button" className="focus-ring mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-sm font-bold text-white hover:bg-white/10"><LogOut size={18} aria-hidden /><span className={collapsed ? "lg:hidden" : ""}>Se déconnecter</span></button>
    </div>
  </aside>;
}
