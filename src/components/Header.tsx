"use client";

import { ArrowRight, CalendarDays, ChevronDown, Menu, ShoppingBag, Ticket, User, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MotionDiv } from "@/components/Motion";
import { socialItems } from "@/lib/socials";

const ANNOUNCEMENT =
  "Inscriptions des licenciés : du 09 juin jusqu'à la fin du mois de juin — rejoignez l'ES Viry-Châtillon !";

const navItems = [
  { label: "Accueil", href: "/" },
  {
    label: "Le Club",
    href: "/le-club",
    children: [
      ["Histoire", "/le-club/histoire"],
      ["Mot du Président", "/le-club/mot-du-president"],
      ["Organigramme", "/le-club/organigramme"],
      ["Stade Henri Longuet", "/le-club/stade-henri-longuet"]
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
  { label: "Actualités", href: "/actualites" },
  { label: "Calendrier", href: "/calendrier" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Médias", href: "/medias" },
  { label: "Boutique", href: "/boutique" },
  { label: "Contact", href: "/contact" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Surlignage de l'item actif : le parent reste actif sur ses sous-pages
  // (ex. « Le Club » sur /le-club/histoire). Logique partagee desktop + mobile.
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

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

  // Menu mobile : Echap ferme et restaure le focus sur le bouton ; a l'ouverture,
  // le focus est deplace sur le premier element du panneau (pattern disclosure).
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    mobileMenuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
          <div className="marquee min-w-0 flex-1 text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
            <span className="sr-only">{ANNOUNCEMENT}</span>
            <div className="marquee__track" aria-hidden="true">
              {[0, 1].map((half) => (
                <div className="flex shrink-0 items-center" key={half}>
                  {[0, 1, 2].map((index) => (
                    <span className="inline-flex items-center gap-2 whitespace-nowrap px-8" key={index}>
                      <CalendarDays className="shrink-0 text-[#f7c600]" size={20} aria-hidden="true" />
                      {ANNOUNCEMENT}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 xl:flex">
              <span className="text-white/82">Suivez-nous :</span>
              {socialItems.map((item) => (
                <span
                  aria-label={item.label}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border transition hover:scale-105"
                  key={item.label}
                  role="img"
                  style={{
                    background: item.background,
                    borderColor: item.borderColor,
                    color: item.color,
                    boxShadow: item.label === "TikTok" ? "2px 0 0 #fe2c55, -2px 0 0 #25f4ee" : undefined
                  }}
                  title={item.label}
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox={item.viewBox}>
                    <path d={item.path} />
                  </svg>
                </span>
              ))}
            </div>
            <div className="flex overflow-hidden rounded-md border border-[#f7c600]/35">
              <Link className="focus-ring inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase hover:bg-white/10" href="/calendrier">
                <Ticket size={16} aria-hidden="true" />
                Matchs
              </Link>
              <Link className="focus-ring inline-flex items-center gap-2 border-l border-[#f7c600]/30 px-4 py-2 text-xs font-black uppercase text-[#f7c600] hover:bg-white/10" href="/boutique">
                <ShoppingBag size={16} aria-hidden="true" />
                Boutique
              </Link>
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
          <span className="hidden max-w-[240px] truncate text-lg font-black uppercase tracking-tight text-white transition hover:text-[#f7c600] sm:block lg:text-xl">
            ES Viry-Châtillon
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-white/12 bg-white/[0.045] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-xl min-[1280px]:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div className="group relative" key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-black uppercase transition min-[1500px]:px-4 min-[1500px]:text-[13px] ${
                    active ? "bg-[#f7c600] text-[#001c10] shadow-[0_8px_22px_rgba(247,198,0,0.24)]" : "text-white/90 hover:bg-white/8 hover:text-[#f7c600]"
                  }`}
                  href={item.href}
                >
                  {item.label}
                  {item.children ? <ChevronDown size={13} aria-hidden="true" /> : null}
                </Link>
                {item.children ? (
                  <div className="pointer-events-none absolute left-0 top-[calc(100%+16px)] w-72 translate-y-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="club-panel rounded-lg p-3 shadow-2xl">
                      <p className="px-3 pb-2 text-xs font-black uppercase text-[#f7c600]">{item.label}</p>
                      <div className="grid gap-1">
                        {item.children.map(([label, href]) => (
                          <Link className="focus-ring rounded-md px-3 py-3 text-sm font-black uppercase text-white/85 hover:bg-white/10 hover:text-[#f7c600]" href={href} key={`${item.label}-${label}-${href}`}>
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="ml-auto flex flex-none items-center gap-2">
          <Link className="focus-ring hidden h-11 items-center gap-2 rounded-full border border-white/18 bg-white/5 px-4 text-xs font-black uppercase hover:border-[#f7c600]/65 hover:text-[#f7c600] min-[1800px]:inline-flex" href="/espace-membre">
            <User size={18} aria-hidden="true" />
            Mon espace
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
          className="club-shell border-t border-[#f7c600]/30 px-4 py-4 min-[1280px]:hidden"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
        >
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`focus-ring flex items-center justify-between rounded-md px-3 py-3 text-sm font-black uppercase hover:bg-white/10 ${
                    isActive(item.href) ? "bg-[#f7c600] text-[#002f1d]" : "text-white"
                  }`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <div className="ml-3 mt-1 grid gap-1 border-l border-[#f7c600]/30 pl-3">
                    {item.children.map(([label, href]) => (
                      <Link className="focus-ring rounded px-3 py-2 text-xs font-black uppercase text-white/75 hover:text-[#f7c600]" href={href} key={`${item.label}-${label}-${href}`} onClick={() => setOpen(false)}>
                        {label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Link
              className="focus-ring mt-2 rounded-md bg-[#f7c600] px-3 py-3 text-center text-sm font-black uppercase text-[#002f1d]"
              href="/inscriptions"
              onClick={() => setOpen(false)}
            >
              Rejoindre le club
            </Link>
          </div>
        </MotionDiv>
      ) : null}
    </header>
  );
}
