"use client";

import { Bell, ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false), [mobileOpen, setMobileOpen] = useState(false), [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const educatorOnly = pathname === "/admin/convocations";
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const closeMobile = () => { setMobileOpen(false); menuButtonRef.current?.focus(); };

  useEffect(() => {
    if (!mobileOpen) return;
    const sidebar = document.getElementById("crm-sidebar");
    const focusable = () => Array.from(sidebar?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeMobile(); return; }
      if (event.key !== "Tab") return;
      const items = focusable(); if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown); document.getElementById("crm-sidebar-close")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setProfileOpen(false); profileButtonRef.current?.focus(); } };
    const onPointerDown = (event: MouseEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false); };
    document.addEventListener("keydown", onKeyDown); document.addEventListener("mousedown", onPointerDown);
    profileRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("mousedown", onPointerDown); };
  }, [profileOpen]);

  return <div className={`crm-layout ${collapsed ? "crm-layout--collapsed" : ""}`}>
    <AdminSidebar collapsed={collapsed} mobileOpen={mobileOpen} educatorOnly={educatorOnly} onClose={closeMobile} onExpand={() => setCollapsed(false)} />
    {mobileOpen ? <button type="button" className="crm-overlay" aria-label="Fermer le menu" onClick={closeMobile} /> : null}
    <header className="crm-header" inert={mobileOpen ? true : undefined}><button ref={menuButtonRef} type="button" onClick={() => setMobileOpen(true)} className="crm-header-button lg:hidden" aria-label="Ouvrir le menu"><Menu aria-hidden size={22} /></button><button type="button" onClick={() => setCollapsed((v) => !v)} className="crm-header-button hidden lg:flex" aria-label={collapsed ? "Déployer la navigation" : "Réduire la navigation"}>{collapsed ? <PanelLeftOpen aria-hidden size={21} /> : <PanelLeftClose aria-hidden size={21} />}</button>
      <label className="relative min-w-0 flex-1 sm:max-w-xl"><span className="sr-only">Rechercher dans le CRM</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden /><input type="search" placeholder="Rechercher (joueurs, matchs, actualités…)" className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#087044] focus:ring-2 focus:ring-[#087044]/15" /></label>
      <button type="button" className="crm-header-button relative" aria-label="Notifications"><Bell aria-hidden size={20} /><span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[#f7c600] text-[10px] font-black text-[#002f1d]">3</span></button>
      <div className="relative" ref={profileRef}><button ref={profileButtonRef} type="button" onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen} aria-haspopup="menu" className="focus-ring flex min-h-11 items-center gap-2 rounded-lg px-1.5 hover:bg-slate-100"><Image src="/club-logo.svg" width={36} height={36} alt="" className="size-9" /><span className="hidden text-left sm:block"><span className="block text-sm font-bold">{educatorOnly ? "Éducateur" : "Administrateur"}</span><span className="block text-xs text-slate-500">Espace sécurisé</span></span><ChevronDown size={16} aria-hidden className="hidden sm:block" /></button>{profileOpen ? <div role="menu" className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-xl">{educatorOnly ? null : <Link role="menuitem" href="/admin/parametres" className="block rounded-md px-3 py-2 hover:bg-slate-100">Paramètres du compte</Link>}<Link role="menuitem" href="/" className="block rounded-md px-3 py-2 hover:bg-slate-100">Voir le site public</Link></div> : null}</div>
    </header>
    <section id="admin-contenu" tabIndex={-1} className="crm-main" inert={mobileOpen ? true : undefined}><div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8">{children}</div></section>
    <footer className="crm-footer" inert={mobileOpen ? true : undefined}>E.S. Viry-Châtillon © {new Date().getFullYear()} — Tous droits réservés</footer>
  </div>;
}
