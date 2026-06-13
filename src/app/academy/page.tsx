import { ArrowRight, CheckCircle2, ChevronDown, ExternalLink, GraduationCap } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { Stagger, StaggerItem } from "@/components/Motion";
import { AcademyCta } from "@/components/academy/AcademyCta";
import { FormationsExplorer } from "@/components/academy/FormationsExplorer";
import { OrientationQuiz } from "@/components/academy/OrientationQuiz";
import { ReassuranceBand } from "@/components/academy/ReassuranceBand";
import { ShareButton } from "@/components/academy/ShareButton";
import { StickyAcademyCta } from "@/components/academy/StickyAcademyCta";
import { FAQ, PROFILES, PUBLICS, STEPS, THEMES, TOTAL_FORMATIONS } from "@/lib/academy-data";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/academy");

// Plateforme Academy = service EXTERNE. Le site ne fait que présenter et rediriger via
// ACADEMY_PLATFORM_URL (aucune URL en dur). Sans URL, les boutons d'accès sont désactivés.
const ACADEMY_URL = process.env.ACADEMY_PLATFORM_URL?.trim() ?? "";

const HERO_PILLS = ["100% en ligne", "Ouvert à tous", "À ton rythme", `${TOTAL_FORMATIONS} formations`];

const PRIMARY_BTN =
  "ac-btn-gold focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-black uppercase tracking-[0.04em] transition hover:-translate-y-0.5 sm:w-auto";
const SECONDARY_BTN =
  "focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/70 bg-black/10 px-7 py-3.5 text-sm font-black uppercase tracking-[0.04em] text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600] sm:w-auto";
const SOLID_GREEN_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#002f1d] px-7 py-3.5 text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_12px_28px_-14px_rgba(0,31,19,0.6)] transition hover:-translate-y-0.5 hover:bg-[#07542f]";
const GHOST_DARK_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3.5 text-sm font-black uppercase tracking-[0.04em] text-white transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600]";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a }
  }))
};

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Progresse sur le terrain ET en dehors"
        description="Ton terrain pour progresser : sport, école, taf, numérique & IA. Des formations en ligne, à suivre à ton rythme."
        image={images.training}
        title="ES Viry-Châtillon Academy"
      >
        <div className="flex flex-col gap-5">
          <span className="ac-eyebrow-dot w-fit rounded-full bg-[#001c10]/35 px-4 py-1.5 text-[0.72rem] font-black uppercase tracking-[0.14em] text-[#ffd84d] ring-1 ring-[#f7c600]/35 backdrop-blur">
            <GraduationCap size={14} aria-hidden="true" /> Plateforme de formation 100% en ligne
          </span>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a className={PRIMARY_BTN} href="#formations">
              Voir les formations
            </a>
            <AcademyCta url={ACADEMY_URL} className={SECONDARY_BTN}>
              Je me lance <ExternalLink size={18} aria-hidden="true" />
            </AcademyCta>
          </div>
          <div className="flex flex-wrap gap-2">
            {HERO_PILLS.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/20 bg-black/20 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </PageHero>

      {/* Bande de réassurance (compteurs animés) */}
      <ReassuranceBand />

      {/* Comment ça fonctionne — parcours timeline */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="C'est simple" title="Ton parcours en 5 min chrono" text="Du clic à ta première formation : 5 étapes, zéro galère." />
          <Stagger className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Ligne de progression (desktop) */}
            <span
              className="absolute left-[8%] right-[8%] top-8 hidden h-[3px] rounded-full bg-gradient-to-r from-[#07542f] via-[#f7c600] to-[#07542f] shadow-[0_0_16px_rgba(247,198,0,0.35)] lg:block"
              aria-hidden="true"
            />
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.label} className="relative flex flex-col items-center text-center">
                  <span className="relative z-[1] flex h-16 w-16 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600] shadow-[0_12px_28px_-10px_rgba(0,31,19,0.6)] ring-[3px] ring-white">
                    <Icon size={26} aria-hidden="true" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#ffd84d] to-[#f7c600] text-sm font-black text-[#001c10] ring-2 ring-white">
                      {index + 1}
                    </span>
                  </span>
                  <p className="mt-5 text-sm font-bold leading-7 text-[#102018]">{step.label}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
          <div className="mt-12 flex justify-center">
            <AcademyCta url={ACADEMY_URL} className={SOLID_GREEN_BTN}>
              Je me lance maintenant <ArrowRight size={18} aria-hidden="true" />
            </AcademyCta>
          </div>
        </div>
      </section>

      {/* Quiz d'orientation */}
      <section className="bg-[#f5f7f4] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle centered eyebrow="Pas sûr de ton choix ?" title="Quelle formation est faite pour toi ?" text="Réponds à 3 questions, on te dit par où commencer." />
          <OrientationQuiz academyUrl={ACADEMY_URL} />
        </div>
      </section>

      {/* Formations groupées par thème + filtres */}
      <section className="ac-pitch scroll-mt-[var(--header-h)] px-4 py-20 text-white sm:px-6 lg:px-8" id="formations">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            inverse
            eyebrow={`${TOTAL_FORMATIONS} formations · ${THEMES.length} univers`}
            title="Choisis ton terrain de jeu"
            text="Sport, école, pro, numérique : filtre par univers et trouve la formation faite pour toi."
          />
          <FormationsExplorer academyUrl={ACADEMY_URL} />
        </div>
      </section>

      {/* Pour qui : profils + publics */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Pour qui ?" title="Licencié ou pas, c'est pour toi" text="Pas besoin d'avoir une licence : tout le monde peut créer un compte et se former." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILES.map((profile) => {
            const Icon = profile.icon;
            const styleVars = { "--ac-accent": profile.accent } as React.CSSProperties;
            return (
              <div className="ac-frame ac-corner relative flex flex-col overflow-hidden p-6" key={profile.label} style={styleVars}>
                <span className="ac-accent-bar" aria-hidden="true" />
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ background: `${profile.accent}1a`, color: profile.accent, borderColor: `${profile.accent}33` }} aria-hidden="true">
                  <Icon size={24} />
                </span>
                <h3 className="mt-4 text-base font-black uppercase leading-tight tracking-[-0.005em] text-[#002f1d]">{profile.label}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{profile.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {PUBLICS.map((item) => (
            <span
              className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.04em] ${
                item.highlight
                  ? "bg-gradient-to-b from-[#ffd84d] to-[#f7c600] text-[#001c10] shadow-[0_8px_18px_-8px_rgba(247,198,0,0.6)]"
                  : "border border-[#002f1d]/15 bg-white text-[#002f1d]"
              }`}
              key={item.label}
            >
              {item.label}
            </span>
          ))}
        </div>

        <p className="mt-6 flex items-start gap-3 rounded-2xl border-l-4 border-[#f7c600] bg-[#fffdf3] p-5 text-sm font-semibold leading-7 text-[#002f1d] shadow-[0_14px_34px_-18px_rgba(0,31,19,0.22)]">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#07542f]" aria-hidden="true" />
          <span>
            Tu n'es pas au club ? <strong>Aucun problème.</strong> Tu crées ton compte et tu te formes, comme tout le monde.
          </span>
        </p>
      </section>

      {/* Séparation des plateformes */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="ac-frame relative overflow-hidden p-7">
            <span className="ac-accent-bar" style={{ "--ac-accent": "#f7c600" } as React.CSSProperties} aria-hidden="true" />
            <span className="ac-eyebrow-dot text-xs font-black uppercase tracking-[0.12em] text-[#8a6d00]">Vitrine</span>
            <h2 className="mt-2 text-xl font-black uppercase text-[#002f1d]">Le site du club</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Présente le projet, les formations et le fonctionnement de l'Academy. C'est la vitrine d'information.</p>
          </div>
          <div className="ac-frame relative overflow-hidden p-7">
            <span className="ac-accent-bar" style={{ "--ac-accent": "#f7c600" } as React.CSSProperties} aria-hidden="true" />
            <span className="ac-eyebrow-dot text-xs font-black uppercase tracking-[0.12em] text-[#8a6d00]">Plateforme</span>
            <h2 className="mt-2 text-xl font-black uppercase text-[#002f1d]">La plateforme Academy</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Espace distinct où tu crées ton compte, tu te connectes, tu suis les formations et tu gères ton parcours.</p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-semibold italic text-slate-500">
          Deux espaces indépendants : la création de compte et les formations se font uniquement sur la plateforme Academy.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionTitle centered eyebrow="Questions fréquentes" title="Tout ce que tu veux savoir" />
        <div className="grid gap-4">
          {FAQ.map((item) => (
            <details className="ac-frame group relative overflow-hidden" key={item.q}>
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 p-6 text-base font-black uppercase tracking-[0.01em] text-[#002f1d] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07542f]/8 text-[#07542f] transition group-open:bg-[#f7c600]/20 group-open:text-[#8a6d00]">
                  <ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden="true" />
                </span>
              </summary>
              <span className="ac-accent-bar opacity-0 transition group-open:opacity-100" style={{ "--ac-accent": "#f7c600" } as React.CSSProperties} aria-hidden="true" />
              <p className="px-6 pb-6 text-sm leading-7 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </section>

      {/* CTA final */}
      <section className="club-shell light-sweep relative overflow-hidden px-4 py-24 text-center text-white sm:px-6 lg:px-8">
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(247,198,0,0.16), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="ac-corner relative z-[1] mx-auto max-w-3xl">
          <h2 className="text-gradient-gold text-4xl font-black uppercase tracking-[-0.01em] sm:text-6xl">Allez, on s'y met.</h2>
          <div className="ac-rule-gold mx-auto mt-5 max-w-[10rem]" aria-hidden="true" />
          <p className="mt-5 text-lg leading-8 text-white/85">Crée ton compte sur la plateforme Academy et lance ta première formation.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <AcademyCta url={ACADEMY_URL} className={PRIMARY_BTN}>
              Je commence maintenant <ExternalLink size={18} aria-hidden="true" />
            </AcademyCta>
            <ShareButton className={GHOST_DARK_BTN} title="ES Viry-Châtillon Academy" text="Découvre les formations en ligne de l'ES Viry-Châtillon Academy 👇" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">Ouvert à tous · 100% en ligne · À ton rythme</p>
        </div>
      </section>

      <StickyAcademyCta academyUrl={ACADEMY_URL} />
    </>
  );
}
