"use client";

import { ArrowRight, CalendarDays, ChevronDown, Menu, ShoppingBag, Ticket, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MotionDiv } from "@/components/Motion";

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
      ["Seniors R1", "/equipes/seniors-r1"],
      ["École de foot", "/equipes/ecole-de-foot"],
      ["Féminines", "/equipes/feminines"],
      ["Futsal", "/equipes/futsal"]
    ]
  },
  { label: "Actualités", href: "/actualites" },
  { label: "Calendrier", href: "/calendrier" },
  { label: "Partenaires", href: "/partenaires" },
  {
    label: "Médias",
    href: "/medias",
    children: [
      ["Photos", "/medias"],
      ["Vidéos", "/medias"],
      ["Interviews", "/medias"]
    ]
  },
  { label: "Boutique", href: "/boutique" },
  { label: "Contact", href: "/contact" }
];

const socialItems = [
  {
    label: "Facebook",
    background: "#ffffff",
    borderColor: "#1877f2",
    color: "#1877f2",
    viewBox: "0 0 24 24",
    path: "M14.2 8.4V6.7c0-.8.3-1.2 1.3-1.2h1.6V2.3c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.8H7.3v3.6h2.9V22h3.7v-9.9h2.9l.5-3.6h-3.1Z"
  },
  {
    label: "Instagram",
    background: "linear-gradient(135deg, #f58529 0%, #dd2a7b 45%, #8134af 72%, #515bd4 100%)",
    borderColor: "#dd2a7b",
    color: "#ffffff",
    viewBox: "0 0 24 24",
    path: "M7.8 2.5h8.4c3 0 5.3 2.3 5.3 5.3v8.4c0 3-2.3 5.3-5.3 5.3H7.8c-3 0-5.3-2.3-5.3-5.3V7.8c0-3 2.3-5.3 5.3-5.3Zm0 2C5.9 4.5 4.5 5.9 4.5 7.8v8.4c0 1.9 1.4 3.3 3.3 3.3h8.4c1.9 0 3.3-1.4 3.3-3.3V7.8c0-1.9-1.4-3.3-3.3-3.3H7.8Zm4.2 3.3a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm0 2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm5-2.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
  },
  {
    label: "YouTube",
    background: "#ffffff",
    borderColor: "#ff0033",
    color: "#ff0033",
    viewBox: "0 0 24 24",
    path: "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4h-.1s-3.7 0-6.6.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2 8.9 2 10.7v1.6c0 1.8.4 3.5.4 3.5s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 7.4.2 7.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.4-1.8.4-3.5v-1.6c0-1.8-.4-3.5-.4-3.5ZM10 14.7V8.8l5.7 3-5.7 2.9Z"
  },
  {
    label: "TikTok",
    background: "#ffffff",
    borderColor: "#25f4ee",
    color: "#050505",
    viewBox: "0 0 24 24",
    path: "M16.7 2.5c.3 2.6 1.8 4.2 4.3 4.4v3.4c-1.5.1-2.8-.3-4.2-1.1v6.3c0 3.2-2 5.9-5.2 6.4-4.1.6-7.5-2.6-7.2-6.7.2-3.4 3-6 6.4-6.1.4 0 .8 0 1.2.1v3.6c-.4-.1-.8-.2-1.2-.1-1.7.1-3 1.5-2.9 3.2.1 1.6 1.5 2.8 3.1 2.7 1.7-.1 2.8-1.4 2.8-3.2V2.5h3.9Z"
  },
  {
    label: "WhatsApp",
    background: "#25d366",
    borderColor: "#25d366",
    color: "#ffffff",
    viewBox: "0 0 24 24",
    path: "M12 2.1A9.8 9.8 0 0 0 2.2 11.9c0 1.7.4 3.3 1.2 4.8L2 22l5.5-1.4a9.8 9.8 0 0 0 4.6 1.2h.1A9.8 9.8 0 0 0 12 2.1Zm5.8 13.9c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.2-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5.2.6.8 2 .9 2.1.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.5.6c-.2.2-.4.4-.2.7.2.4.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.9 2.1 1 .3.2.5.2.6.4.1.1.1.7-.1 1.3Z"
  }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

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
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
          className="club-shell border-t border-[#f7c600]/30 px-4 py-4 min-[1280px]:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`focus-ring flex items-center justify-between rounded-md px-3 py-3 text-sm font-black uppercase hover:bg-white/10 ${
                    pathname === item.href ? "bg-[#f7c600] text-[#002f1d]" : "text-white"
                  }`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  {item.children ? <ChevronDown size={15} aria-hidden="true" /> : null}
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
