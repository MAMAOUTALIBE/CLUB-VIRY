"use client";

import { ArrowRight, CalendarDays, ChevronDown, Menu, User, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MotionDiv } from "@/components/Motion";
import { socialItems } from "@/lib/socials";

const DEFAULT_ANNOUNCEMENT =
  "Inscriptions des licenciés : du 09 juin jusqu'à la fin du mois de juin — rejoignez l'ES Viry-Châtillon !";

type HeaderProps = {
  banner?: { text?: string; active?: boolean };
  socials?: Record<string, string>;
};

// URL réelle d'un réseau (depuis les paramètres CRM) ; vide = icône décorative.
function socialHref(socials: Record<string, string> | undefined, label: string): string {
  return (socials?.[label.toLowerCase()] ?? "").trim();
}

const navItems = [
  {
    label: "Le Club",
    href: "/le-club",
    children: [
      ["Histoire", "/le-club/histoire"],
      ["Galerie photos", "/le-club/galerie"],
      ["Mot du Président", "/le-club/mot-du-president"],
      ["Bureau", "/le-club/bureau"],
      ["Dirigeants", "/le-club/dirigeants"],
      ["Organigramme", "/le-club/organigramme"],
      ["Encadrement", "/le-club/encadrement"],
      ["Installations", "/le-club/installations"],
      ["Codes de conduite", "/le-club/codes-de-conduite"],
      ["Stade Henri Longuet", "/le-club/stade-henri-longuet"],
      ["Partenaires", "/partenaires"]
    ]
  },
  {
    label: "Formation",
    href: "/formation",
    children: [
      ["École de foot", "/formation/ecole-de-foot"],
      ["Football à 11", "/formation/football-a-11"],
      ["Projet école de foot", "/formation/projet-ecole-de-foot"],
      ["Stages", "/formation/stages"]
    ]
  },
  {
    label: "Équipes",
    href: "/equipes",
    children: [
      ["Toutes les équipes", "/equipes"],
      ["Seniors D1", "/equipes/seniors-r1"],
      ["École de foot", "/equipes/ecole-de-foot"],
      ["Féminines", "/equipes/feminines"],
      ["Futsal", "/equipes/futsal"]
    ]
  },
  { label: "Academy", href: "/academy" },
  {
    label: "Actu & Médias",
    href: "/actualites",
    children: [
      ["Actualités", "/actualites"],
      ["Calendrier", "/calendrier"],
      ["Résultats", "/resultats"],
      ["Médias", "/medias"]
    ]
  },
  { label: "Boutique", href: "/boutique" },
  {
    label: "Nous rejoindre",
    href: "/inscriptions",
    children: [
      ["Inscriptions", "/inscriptions"],
      ["Détections / recrutement", "/detections-recrutement"],
      ["Contact", "/contact"]
    ]
  }
];

const mobileNavGroups = [
  {
    label: "Le Club",
    href: "/le-club",
    links: [
      ["Présentation", "/le-club"],
      ["Histoire", "/le-club/histoire"],
      ["Galerie photos", "/le-club/galerie"],
      ["Installations", "/le-club/installations"],
      ["Codes de conduite", "/le-club/codes-de-conduite"]
    ]
  },
  {
    label: "Formation",
    href: "/formation",
    links: [
      ["Formation", "/formation"],
      ["Équipes", "/equipes"],
      ["Academy", "/academy"],
      ["École de foot", "/formation/ecole-de-foot"],
      ["Football à 11", "/formation/football-a-11"],
      ["Stages", "/formation/stages"]
    ]
  },
  {
    label: "Actu & Médias",
    href: "/actualites",
    links: [
      ["Actualités", "/actualites"],
      ["Calendrier", "/calendrier"],
      ["Résultats", "/resultats"],
      ["Médias", "/medias"]
    ]
  },
  {
    label: "Boutique",
    href: "/boutique",
    links: [["Boutique", "/boutique"]]
  },
  {
    label: "Nous rejoindre",
    href: "/inscriptions",
    links: [
      ["Inscriptions", "/inscriptions"],
      ["Détections", "/detections-recrutement"],
      ["Partenaires", "/partenaires"],
      ["Contact", "/contact"]
    ]
  }
];

export function Header({ banner, socials }: HeaderProps) {
  const announcement = banner?.text?.trim() || DEFAULT_ANNOUNCEMENT;
  const bannerActive = banner?.active !== false;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState(mobileNavGroups[0]?.href ?? "");
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Surlignage de l'item actif : le parent reste actif sur ses sous-pages
  // (ex. « Le Club » sur /le-club/histoire). Logique partagee desktop + mobile.
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  // Un item parent reste surligné quand on visite l'une de ses sous-pages
  // (ex. « Le Club » actif sur /partenaires, « Actu & Médias » sur /calendrier).
  const isItemActive = (item: { href: string; children?: string[][] }) =>
    isActive(item.href) || (item.children?.some(([, href]) => isActive(href)) ?? false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Expose la hauteur réelle du header en variable CSS (--header-h)
  // pour que le hero puisse occuper exactement 100vh - header (zéro scroll).
  useEffect(() => {
    function applyHeaderHeight() {
      const el = headerRef.current;
      if (!el) return;
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    }

    applyHeaderHeight();
    window.addEventListener("resize", applyHeaderHeight);

    if (document.fonts?.ready) {
      document.fonts.ready.then(applyHeaderHeight).catch(() => {});
    }

    return () => window.removeEventListener("resize", applyHeaderHeight);
  }, []);

  // Menu mobile : Echap ferme, Tab reste dans le panneau, et le focus revient au bouton.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key === "Tab") {
        const focusable = Array.from(
          mobileMenuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []
        ).filter((element) => !element.hasAttribute("inert"));

        if (!focusable.length) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    setOpenMobileGroup((current) => current || mobileNavGroups[0]?.href || "");
    mobileMenuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Verrouille le scroll de la page tant que le menu mobile est ouvert
  // (evite de scroller le contenu derriere le panneau).
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Menus deroulants desktop (pattern disclosure) : Echap ferme et rend le focus au
  // declencheur ; un clic en dehors de la nav ferme le menu ouvert.
  useEffect(() => {
    if (!openMenu) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const trigger = document.getElementById(`menu-trigger-${openMenu}`);
        setOpenMenu(null);
        trigger?.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [openMenu]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b border-[#f7c600]/25 text-white transition-all duration-300 ${
        scrolled ? "bg-[#00120b]/94 shadow-2xl backdrop-blur-xl" : "bg-[#00120b]/98 shadow-xl"
      }`}
    >
      <div className="hidden border-b border-[#f7c600]/20 bg-black/30 text-xs font-bold lg:block">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-6 px-6 py-1">
          {bannerActive ? (
            <div className="marquee min-w-0 flex-1 text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
              <span className="sr-only">{announcement}</span>
              <div className="marquee__track" aria-hidden="true">
                {[0, 1].map((half) => (
                  <div className="flex shrink-0 items-center" key={half}>
                    {[0, 1, 2].map((index) => (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap px-8" key={index}>
                        <CalendarDays className="shrink-0 text-[#f7c600]" size={20} aria-hidden="true" />
                        {announcement}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 xl:flex">
              <span className="whitespace-nowrap text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">Suivez-nous :</span>
              {socialItems.map((item) => {
                const href = socialHref(socials, item.label);
                const live = /^(https?:|mailto:|tel:)/.test(href);
                const className = "inline-flex h-7 w-7 items-center justify-center rounded-full border transition hover:scale-105";
                const style = {
                  background: item.background,
                  borderColor: item.borderColor,
                  color: item.color,
                  boxShadow: item.label === "TikTok" ? "2px 0 0 #fe2c55, -2px 0 0 #25f4ee" : undefined
                };
                const icon = (
                  <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox={item.viewBox}>
                    <path d={item.path} />
                  </svg>
                );

                return live ? (
                  <a aria-label={item.label} className={`focus-ring ${className}`} href={href} key={item.label} rel="noopener noreferrer" style={style} target="_blank" title={item.label}>
                    {icon}
                  </a>
                ) : (
                  <span aria-label={item.label} className={className} key={item.label} role="img" style={style} title={item.label}>
                    {icon}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <nav
        className={`mx-auto flex max-w-[1680px] items-center gap-4 px-4 transition-all sm:px-6 lg:px-8 ${
          scrolled ? "py-1.5" : "py-2"
        }`}
        aria-label="Navigation principale"
      >
        <Link className="focus-ring flex min-w-0 flex-none items-center gap-3" href="/" onClick={() => setOpen(false)}>
          <img
            className={`shrink-0 rounded-full object-contain drop-shadow-xl transition-all duration-300 ${scrolled ? "h-10 w-10 lg:h-11 lg:w-11" : "h-11 w-11 lg:h-12 lg:w-12"}`}
            src="/club-logo.svg"
            alt="ES Viry-Châtillon Football"
            width={60}
            height={60}
          />
          <span className="block max-w-[190px] truncate text-sm font-black uppercase tracking-tight text-white transition hover:text-[#f7c600] sm:max-w-[240px] sm:text-lg lg:text-xl">
            ES Viry-Châtillon
          </span>
        </Link>

        <div ref={desktopNavRef} className="hidden min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-white/12 bg-white/[0.045] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-xl min-[1280px]:flex">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const triggerClass = `focus-ring relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black uppercase transition min-[1500px]:px-4 min-[1500px]:text-[13px] ${
              active ? "bg-[#f7c600] text-[#001c10] shadow-[0_8px_22px_rgba(247,198,0,0.24)]" : "text-white/90 hover:bg-white/8 hover:text-[#f7c600]"
            }`;

            if (!item.children) {
              return (
                <Link aria-current={active ? "page" : undefined} className={triggerClass} href={item.href} key={item.href}>
                  {item.label}
                </Link>
              );
            }

            const expanded = openMenu === item.href;
            return (
              <div
                className="relative"
                key={item.href}
                onMouseEnter={() => setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setOpenMenu((current) => (current === item.href ? null : current));
                  }
                }}
              >
                <button
                  aria-current={active ? "page" : undefined}
                  aria-controls={`submenu-${item.href}`}
                  aria-expanded={expanded}
                  aria-haspopup="true"
                  className={triggerClass}
                  id={`menu-trigger-${item.href}`}
                    onClick={() => setOpenMenu((current) => (current === item.href ? null : item.href))}
                  type="button"
                >
                  {item.label}
                  <ChevronDown size={13} aria-hidden="true" className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                <div
                  id={`submenu-${item.href}`}
                  inert={!expanded}
                  className={`absolute left-0 top-full w-72 pt-4 transition duration-200 ${
                    expanded ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                >
                  <div className="club-panel rounded-lg p-3 shadow-2xl">
                    <Link
                      className="focus-ring mb-1 block rounded-md px-3 py-2 text-xs font-black uppercase text-[#f7c600] hover:bg-white/10"
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                    >
                      {item.label} — voir la page
                    </Link>
                    <div className="grid gap-1">
                      {item.children.map(([label, href]) => (
                        <Link
                          className="focus-ring rounded-md px-3 py-3 text-sm font-black uppercase text-white/85 hover:bg-white/10 hover:text-[#f7c600]"
                          href={href}
                          key={`${item.label}-${label}-${href}`}
                          onClick={() => setOpenMenu(null)}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ml-auto flex flex-none items-center gap-2">
          <Link
            className="focus-ring hidden h-11 items-center gap-2 rounded-full border border-white/18 bg-white/5 px-4 text-xs font-black uppercase hover:border-[#f7c600]/65 hover:text-[#f7c600] min-[1280px]:inline-flex"
            href="/espace-membre"
            title="Mon espace"
          >
            <User size={18} aria-hidden="true" />
            <span className="hidden min-[1500px]:inline">Mon espace</span>
          </Link>
          <Link
            className="focus-ring hidden h-11 items-center gap-2 rounded-full bg-[#f7c600] px-5 text-xs font-black uppercase text-[#001c10] shadow-[0_12px_28px_rgba(247,198,0,0.22)] transition hover:bg-white min-[1280px]:inline-flex"
            href="/inscriptions"
          >
            Rejoindre
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <button
            ref={menuButtonRef}
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="focus-ring rounded-md border border-white/18 p-2 hover:bg-white/10 min-[1280px]:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {open ? (
        <MotionDiv
          ref={mobileMenuRef}
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-50 overflow-y-auto overscroll-contain border-t border-[#f7c600]/30 bg-[#001c10] px-4 py-4 min-[1280px]:hidden"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
        >
          <div className="mx-auto flex h-full max-w-7xl flex-col gap-3">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#f7c600]/25 pb-3">
              <div>
                <p className="text-xs font-black uppercase text-[#f7c600]">Menu</p>
                <p className="text-lg font-black uppercase text-white">ES Viry-Châtillon</p>
              </div>
              <button
                className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/18 text-white"
                onClick={() => {
                  setOpen(false);
                  menuButtonRef.current?.focus();
                }}
                type="button"
              >
                <span className="sr-only">Fermer le menu</span>
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pr-1">
              {mobileNavGroups.map((group) => {
                const expanded = openMobileGroup === group.href;
                const active = isActive(group.href) || group.links.some(([, href]) => isActive(href));
                return (
                  <section className="rounded-lg border border-white/12 bg-white/[0.04]" key={group.href}>
                    <button
                      aria-expanded={expanded}
                      className={`focus-ring flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-black uppercase ${
                        active ? "bg-[#f7c600] text-[#002f1d]" : "text-white"
                      }`}
                      onClick={() => setOpenMobileGroup((current) => (current === group.href ? "" : group.href))}
                      type="button"
                    >
                      {group.label}
                      <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded ? (
                      <div className="grid gap-1 px-2 py-2">
                        {group.links.map(([label, href]) => (
                          <Link
                            aria-current={isActive(href) ? "page" : undefined}
                            className="focus-ring min-h-11 rounded-md px-3 py-3 text-sm font-bold uppercase text-white/82 hover:bg-white/10 hover:text-[#f7c600]"
                            href={href}
                            key={`${group.label}-${href}`}
                            onClick={() => setOpen(false)}
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>

            <div className="grid shrink-0 gap-2 border-t border-[#f7c600]/30 pt-3">
              <Link
                className="focus-ring flex items-center gap-2 rounded-md border border-white/18 px-3 py-3 text-sm font-black uppercase text-white hover:bg-white/10"
                href="/espace-membre"
                onClick={() => setOpen(false)}
              >
                <User size={18} aria-hidden="true" />
                Mon espace
              </Link>
              <Link
                className="focus-ring rounded-md border border-white/18 px-3 py-3 text-center text-sm font-black uppercase text-white hover:bg-white/10"
                href="/connexion"
                onClick={() => setOpen(false)}
              >
                Connexion
              </Link>
              <Link
                className="focus-ring rounded-md bg-[#f7c600] px-3 py-3 text-center text-sm font-black uppercase text-[#002f1d]"
                href="/inscriptions"
                onClick={() => setOpen(false)}
              >
                Rejoindre le club
              </Link>
            </div>
          </div>
        </MotionDiv>
      ) : null}
    </header>
  );
}
