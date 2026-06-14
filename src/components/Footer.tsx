"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, MapPin, User } from "lucide-react";
import { socialItems } from "@/lib/socials";

type FooterProps = {
  socials?: Record<string, string>;
  contact?: { address?: string };
};

function socialHref(socials: Record<string, string> | undefined, label: string): string {
  return (socials?.[label.toLowerCase()] ?? "").trim();
}

const columns = [
  {
    title: "Le Club",
    links: [
      ["Histoire", "/le-club/histoire"],
      ["Mot du président", "/le-club/mot-du-president"],
      ["Organigramme", "/le-club/organigramme"],
      ["Encadrement", "/le-club/encadrement"],
      ["Stade", "/le-club/stade-henri-longuet"]
    ]
  },
  {
    title: "Équipes",
    links: [
      ["École de foot", "/equipes/ecole-de-foot"],
      ["Seniors", "/equipes/seniors-r1"],
      ["Féminines", "/equipes/feminines"],
      ["Futsal", "/equipes/futsal"]
    ]
  },
  {
    title: "Infos pratiques",
    links: [
      ["Inscriptions", "/inscriptions"],
      ["Academy", "/academy"],
      ["Détections", "/detections-recrutement"],
      ["Calendrier", "/calendrier"],
      ["Contact", "/contact"]
    ]
  },
  {
    title: "Boutique",
    links: [
      ["Tous les produits", "/boutique"],
      ["Conditions générales", "/boutique/conditions-generales"],
      ["Livraison & retour", "/boutique/livraison-retour"]
    ]
  }
];

export function Footer({ socials, contact }: FooterProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="club-shell relative overflow-hidden border-t-4 border-[#f7c600] text-white">
      {/* Halos décoratifs */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#f7c600]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#07542f]/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr_1.5fr]">
          {/* Bloc marque */}
          <div>
            <div className="flex items-center gap-4">
              <img
                decoding="async"
                loading="lazy"
                className="h-[88px] w-[88px] shrink-0 rounded-full object-contain drop-shadow-xl"
                src="/club-logo.svg"
                alt="ES Viry-Châtillon Football"
                width={88}
                height={88}
              />
              <div>
                <p className="text-lg font-black uppercase leading-tight">ES Viry-Châtillon</p>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f7c600]">Football</p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
              Site officiel de l'ES Viry-Châtillon Football. Jaune et Vert pour toujours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3" aria-label="Réseaux sociaux">
              {socialItems.map((social) => {
                const href = socialHref(socials, social.label);
                const live = /^(https?:|mailto:|tel:)/.test(href);
                const className = "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border ring-1 ring-white/10 transition duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-[#f7c600]/60";
                const style = {
                  background: social.background,
                  borderColor: social.borderColor,
                  color: social.color,
                  boxShadow: social.label === "TikTok" ? "1.5px 0 0 #fe2c55, -1.5px 0 0 #25f4ee" : undefined
                };
                const icon = (
                  <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox={social.viewBox}>
                    <path d={social.path} />
                  </svg>
                );

                // Lien cliquable seulement si une vraie URL existe ; sinon icone decorative
                // (pas de lien mort vers "#").
                return live ? (
                  <a key={social.label} href={href} target="_blank" rel="noopener noreferrer" aria-label={social.label} title={social.label} className={className} style={style}>
                    {icon}
                  </a>
                ) : (
                  <span key={social.label} role="img" aria-label={social.label} title={social.label} className={className} style={style}>
                    {icon}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Colonnes de liens */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">{column.title}</h2>
                <span aria-hidden="true" className="mt-2 block h-[2px] w-8 rounded-full bg-[#f7c600]/60" />
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map(([label, href]) => (
                    <li key={href}>
                      <Link className="focus-ring group inline-flex items-center gap-2 text-white/75 transition hover:text-[#f7c600]" href={href}>
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#f7c600]/0 transition group-hover:bg-[#f7c600]" />
                        <span className="transition group-hover:translate-x-0.5">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Bloc contact + CTA */}
          <div>
            <div className="club-panel relative isolate overflow-hidden rounded-2xl p-6">
              {/* Fond : photo de stade HD (nette) + voile vert qui la teinte aux couleurs du club */}
              <Image
                src="https://images.unsplash.com/photo-1540379708242-14a809bef941?auto=format&fit=crop&w=2000&q=80"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-center"
                style={{ zIndex: 0 }}
              />
              <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#001c10]/88 via-[#00351f]/76 to-[#001c10]/90" aria-hidden="true" />
              <div className="relative z-[2]">
                <p className="font-script text-4xl leading-none text-[#f7c600]">Jaune et Vert</p>
                <p className="mt-1 text-lg font-bold italic text-white/90">pour toujours !</p>
                <div className="mt-5 space-y-3 text-sm text-white/80">
                  <p className="flex items-start gap-3">
                    <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[#f7c600]" size={18} />
                    <span>{contact?.address?.trim() || "Stade Henri Longuet · Avenue de l'Armée Leclerc · 91170 Viry-Châtillon"}</span>
                  </p>
                  <Link className="focus-ring flex items-center gap-3 transition hover:text-[#f7c600]" href="/contact">
                    <Mail aria-hidden="true" className="shrink-0 text-[#f7c600]" size={18} />
                    <span>Nous contacter</span>
                  </Link>
                </div>
              </div>
            </div>
            <Link
              className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#001c10] shadow-[0_14px_30px_rgba(247,198,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white"
              href="/inscriptions"
            >
              Rejoindre le club
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 ES Viry-Châtillon Football — Tous droits réservés</p>
          <div className="flex flex-wrap gap-5" aria-label="Accès réservés">
            <Link className="focus-ring inline-flex items-center gap-1.5 transition hover:text-[#f7c600]" href="/espace-membre">
              <User aria-hidden="true" size={14} />
              Espace membre
            </Link>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link className="focus-ring transition hover:text-[#f7c600]" href="/mentions-legales">
              Mentions légales
            </Link>
            <Link className="focus-ring transition hover:text-[#f7c600]" href="/politique-confidentialite">
              Politique de confidentialité
            </Link>
            <Link className="focus-ring transition hover:text-[#f7c600]" href="/plan-du-site">
              Plan du site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
