import Image from "next/image";
import {
  ArrowRight,
  Dumbbell,
  ExternalLink,
  GraduationCap,
  Handshake,
  Rocket,
  User,
  UserPlus,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DesktopOnly, MobileCard, MobileScreen } from "@/components/MobilePage";
import { SectionTitle } from "@/components/SectionTitle";
import { Stagger, StaggerItem } from "@/components/Motion";
import { AcademyCta } from "@/components/academy/AcademyCta";
import { ReassuranceBand } from "@/components/academy/ReassuranceBand";
import { StickyAcademyCta } from "@/components/academy/StickyAcademyCta";
import { FEATURED_FORMATIONS, PUBLICS } from "@/lib/academy-data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/academy");

// Plateforme Academy = service EXTERNE déjà développé. La page ne fait que présenter
// et rediriger via ACADEMY_PLATFORM_URL (aucune URL en dur). Sans URL, les CTA sont désactivés.
const ACADEMY_URL = process.env.ACADEMY_PLATFORM_URL?.trim() ?? "";

const PUBLIC_ICON: Record<string, LucideIcon> = {
  Joueurs: Dumbbell,
  Parents: Users,
  Familles: Users,
  Étudiants: GraduationCap,
  Adultes: User,
  Partenaires: Handshake,
  "Personnes extérieures": UserPlus
};

// Image du hero. Pour la scène Academy immersive (licencié + laptops + ballon),
// dépose l'image dans public/ et remplace la valeur ci-dessous, ex. "/academy-hero.jpg".
const HERO_IMAGE = "/stade/imagepelouse.webp";

const PILLARS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Dumbbell, title: "Former le joueur", text: "Développe ton potentiel sur le terrain." },
  { icon: GraduationCap, title: "Accompagner l'élève", text: "Construis ton parcours scolaire et personnel." },
  { icon: Rocket, title: "Préparer l'avenir", text: "Maîtrise les compétences d'aujourd'hui et de demain." }
];

const PRIMARY_BTN =
  "ac-btn-gold focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-black uppercase tracking-[0.04em] transition hover:-translate-y-0.5";
const SECONDARY_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 bg-black/10 px-7 py-3.5 text-sm font-black uppercase tracking-[0.04em] text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600]";
const DARK_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#002f1d] px-6 py-3 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_12px_28px_-14px_rgba(0,31,19,0.6)] transition hover:-translate-y-0.5 hover:bg-[#07542f]";

export default function AcademyPage() {
  const academyCtaHref = ACADEMY_URL || "/contact";
  return (
    <>
      <MobileScreen
        eyebrow="Academy"
        title="Sport. École. Avenir."
        description="Une plateforme pour progresser sur le terrain, à l’école et dans son projet personnel."
        actions={[{ href: academyCtaHref, label: ACADEMY_URL ? "Accéder" : "Demander l'accès" }]}
      >
        <div className="grid h-full content-start gap-3 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <MobileCard key={pillar.title}>
              <h2 className="text-lg font-black uppercase text-[#002f1d]">{pillar.title}</h2>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{pillar.text}</p>
            </MobileCard>
          ))}
          <div className="md:col-span-3">
          <MobileCard>
            <p className="text-xs font-black uppercase text-[#664d00]">Publics</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PUBLICS.slice(0, 6).map((item) => (
                <span className="rounded-md bg-[#07542f]/8 px-2.5 py-1 text-xs font-black uppercase text-[#002f1d]" key={item.label}>
                  {item.label}
                </span>
              ))}
            </div>
          </MobileCard>
          </div>
        </div>
      </MobileScreen>
      <DesktopOnly>
      {/* ── SECTION 1 — Hero premium immersif ── */}
      <section className="image-tint stadium-grid relative isolate overflow-hidden border-b-4 border-[#f7c600] text-white">
        <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover object-center" style={{ zIndex: 0 }} />
        {/* Overlay cinématographique : sombre à gauche (lisibilité du texte), respire à droite (scène) + fond chaud bas */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#001c10]/95 via-[#001c10]/80 to-[#001c10]/35" aria-hidden="true" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#001c10]/75 via-transparent to-[#001c10]/30" aria-hidden="true" />
        <div className="relative z-[2] mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 3xl:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f7c600] [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">Forme-toi. Progresse. Réussis.</p>
            <h1 className="mt-4 [text-shadow:0_3px_16px_rgba(0,0,0,0.6)]">
              <span className="block text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">ES Viry-Châtillon</span>
              <span className="block text-5xl font-black uppercase leading-[0.85] text-[#f7c600] sm:text-7xl lg:text-8xl">Academy</span>
            </h1>
            <p className="mt-5 text-xl font-black uppercase tracking-wide text-white sm:text-2xl [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">Sport. École. Métier. Numérique.</p>
            <div className="gold-divider mt-5" aria-hidden="true" />

            {/* 3 piliers en mini-cartes verre */}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-xl border border-white/15 bg-[#001c10]/55 p-4 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f7c600]/45 hover:bg-[#001c10]/65"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7c600]/15 text-[#f7c600] ring-1 ring-[#f7c600]/30" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <p className="mt-3 text-sm font-black uppercase leading-tight text-white">{pillar.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/75">{pillar.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <AcademyCta url={ACADEMY_URL} className={PRIMARY_BTN}>
                Accéder à la plateforme <ExternalLink size={18} aria-hidden="true" />
              </AcademyCta>
              <a className={SECONDARY_BTN} href="#formations">
                Découvrir les formations <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chiffres clés (bande premium, juste sous le hero) ── */}
      <ReassuranceBand />

      {/* ── SECTION — Formations phares ── */}
      <section id="formations" className="scroll-mt-[var(--header-h)] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle eyebrow="Catalogue" title="Nos formations phares" />
            <AcademyCta url={ACADEMY_URL} className={DARK_BTN}>
              Voir toutes les formations <ArrowRight size={16} aria-hidden="true" />
            </AcademyCta>
          </div>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6">
            {FEATURED_FORMATIONS.map((formation) => {
              const Icon = formation.icon;
              return (
                <StaggerItem key={formation.title} className="h-full">
                  <article className="premium-card group flex h-full flex-col overflow-hidden rounded-2xl bg-white">
                    <div className="relative h-44 overflow-hidden">
                      <Image src={formation.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/80 via-[#001c10]/15 to-transparent" aria-hidden="true" />
                      <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg ring-1 ring-white/20" style={{ background: formation.accent }} aria-hidden="true">
                        <Icon size={22} />
                      </span>
                      <span className="absolute right-4 top-4 rounded-full bg-[#001c10]/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#f7c600] ring-1 ring-[#f7c600]/30 backdrop-blur">
                        {formation.level}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-black uppercase leading-tight text-[#002f1d]">{formation.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{formation.description}</p>
                      <AcademyCta url={ACADEMY_URL} className="focus-ring -ml-1 mt-3 inline-flex w-fit items-center gap-1.5 px-1 py-1.5 text-xs font-black uppercase">
                        <span style={{ color: formation.accentText }}>Découvrir</span>
                        <ArrowRight size={14} style={{ color: formation.accentText }} aria-hidden="true" />
                      </AcademyCta>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ── SECTION FINALE — Pour qui + CTA (carte premium sur photo stade retravaillée) ── */}
      <section className="light-sweep relative isolate overflow-hidden px-4 py-20 text-white sm:px-6 lg:px-8">
        <Image src="/stade/imagepelouse.webp" alt="" fill sizes="100vw" className="object-cover object-center" style={{ zIndex: 0 }} />
        {/* Voile léger : la photo du stade reste bien visible (la carte gère la lisibilité du texte). */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#001c10]/55 via-[#001c10]/30 to-[#001c10]/55" aria-hidden="true" />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(247,198,0,0.18), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative z-[2] mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#f7c600]/30 bg-[#001c10]/55 p-8 text-center shadow-[0_30px_70px_-20px_rgba(0,18,11,0.6)] backdrop-blur-md sm:p-12">
            <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f7c600]/15 blur-3xl" aria-hidden="true" />
            <p className="relative text-xs font-black uppercase tracking-[0.22em] text-[#f7c600]">Pour qui ?</p>
            <h2 className="relative mt-3 text-4xl font-black uppercase leading-[0.95] tracking-[-0.01em] sm:text-5xl">
              Ouvert à <span className="text-gradient-gold">tous</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-white/80">
              Pas besoin d'être licencié : l'Academy est faite pour tout le monde, licenciés comme personnes extérieures.
            </p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-2.5">
              {PUBLICS.map((item) => {
                const Icon = PUBLIC_ICON[item.label] ?? Users;
                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-[#f7c600]/25 bg-white/[0.06] px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-white/90 transition hover:border-[#f7c600]/60 hover:bg-white/[0.1]"
                  >
                    <Icon size={15} className="text-[#f7c600]" aria-hidden="true" />
                    {item.label}
                  </span>
                );
              })}
            </div>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AcademyCta url={ACADEMY_URL} className={PRIMARY_BTN}>
                Je commence maintenant <ExternalLink size={18} aria-hidden="true" />
              </AcademyCta>
              <a className={SECONDARY_BTN} href="#formations">
                Voir les formations <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <StickyAcademyCta academyUrl={ACADEMY_URL} />
      </DesktopOnly>
    </>
  );
}
