import {
  Apple,
  ArrowUpRight,
  Briefcase,
  BookOpen,
  Compass,
  Cpu,
  Dumbbell,
  ExternalLink,
  FileText,
  Flag,
  Laptop,
  Rocket,
  Video
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionTitle } from "@/components/SectionTitle";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/academy");

// La plateforme Academy est un service EXTERNE déjà déployé. Le site du club ne fait que
// présenter et rediriger : aucune inscription/compte n'est gérée ici (plateformes distinctes).
const ACADEMY_URL = process.env.ACADEMY_PLATFORM_URL || "https://gandal.org";

type Formation = { icon: LucideIcon; title: string; description: string; audience: string };

const FORMATIONS: Formation[] = [
  { icon: BookOpen, title: "Soutien scolaire", description: "Accompagnement aux devoirs et révisions, du primaire au lycée.", audience: "Élèves, collégiens, lycéens" },
  { icon: Laptop, title: "Numérique", description: "Maîtriser les outils numériques du quotidien et du travail.", audience: "Tous publics" },
  { icon: Cpu, title: "Intelligence artificielle", description: "Comprendre et utiliser l'IA au quotidien et en projet.", audience: "Jeunes & adultes" },
  { icon: FileText, title: "Bureautique", description: "Word, Excel, présentations : les bases pour étudier et travailler.", audience: "Tous publics" },
  { icon: Compass, title: "Orientation", description: "Construire son projet d'études et de métier sereinement.", audience: "Collégiens, lycéens" },
  { icon: Briefcase, title: "CV / Entretien", description: "Rédiger un CV percutant et réussir ses entretiens.", audience: "Chercheurs d'emploi" },
  { icon: Rocket, title: "Entrepreneuriat", description: "Passer de l'idée au projet : les clés pour entreprendre.", audience: "Jeunes & adultes" },
  { icon: Dumbbell, title: "Préparation sportive", description: "Préparation physique, prévention et performance.", audience: "Joueurs & sportifs" },
  { icon: Apple, title: "Nutrition", description: "Bien manger pour mieux performer et rester en forme.", audience: "Joueurs & familles" },
  { icon: Flag, title: "Arbitrage", description: "Apprendre les règles et se former à l'arbitrage.", audience: "Jeunes & bénévoles" },
  { icon: Video, title: "Analyse vidéo", description: "Décrypter le jeu et progresser grâce à la vidéo.", audience: "Joueurs & éducateurs" }
];

const STEPS = [
  "Je découvre les formations sur le site du club.",
  "Je clique sur « Accéder à la plateforme ».",
  "Je suis redirigé vers la plateforme Academy.",
  "Je crée mon compte avec mon email et mon mot de passe.",
  "Je choisis ma formation et je commence mon parcours."
];

const PUBLICS = [
  "Joueurs du club",
  "Parents",
  "Familles",
  "Jeunes de Viry-Châtillon",
  "Personnes externes au club",
  "Partenaires",
  "Adultes en reconversion"
];

const PRIMARY_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#f7c600] px-7 py-3.5 text-sm font-black uppercase text-[#001c10] shadow-[0_14px_30px_rgba(247,198,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white";
const SECONDARY_BTN =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 bg-black/10 px-7 py-3.5 text-sm font-black uppercase text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600]";

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Former le joueur · Accompagner l'élève · Préparer l'avenir"
        description="Une plateforme digitale de formation ouverte aux joueurs, aux familles et aux personnes extérieures au club."
        image={images.training}
        title="ES Viry-Châtillon Academy"
      >
        <div className="flex flex-wrap gap-4">
          <a className={PRIMARY_BTN} href="#formations">
            Découvrir les formations
          </a>
          <a className={SECONDARY_BTN} href={ACADEMY_URL} target="_blank" rel="noopener noreferrer">
            Accéder à la plateforme <ExternalLink size={18} aria-hidden="true" />
          </a>
        </div>
      </PageHero>

      {/* Comment ça fonctionne */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Mode d'emploi" title="Comment ça fonctionne" text="Cinq étapes simples, du site du club à votre parcours de formation." />
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <li className="official-card flex flex-col gap-3 rounded-xl bg-white p-5" key={step}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002f1d] text-base font-black text-[#f7c600]">{index + 1}</span>
              <p className="text-sm font-bold leading-6 text-[#002f1d]">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Formations */}
      <section className="club-shell px-4 py-14 text-white sm:px-6 lg:px-8" id="formations">
        <div className="mx-auto max-w-7xl">
          <SectionTitle inverse eyebrow="Catalogue" title="Les formations disponibles" text="Sportives, scolaires, numériques et professionnelles : un catalogue ouvert à tous." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATIONS.map((formation) => {
              const Icon = formation.icon;
              return (
                <article className="flex flex-col rounded-xl bg-white p-6 text-[#002f1d] shadow-lg" key={formation.title}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#07542f]/10 text-[#07542f]" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-4 text-lg font-black uppercase leading-tight">{formation.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{formation.description}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#8a6d00]">{formation.audience}</p>
                  <a
                    className="focus-ring mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#002f1d] px-4 py-2.5 text-sm font-black uppercase text-white transition hover:bg-[#07542f]"
                    href={ACADEMY_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Voir la formation <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Publics concernés */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Pour qui ?" title="Une formation ouverte à tous" text="L'inscription n'est pas réservée aux membres du club : tout le monde peut créer un compte et suivre les formations." />
        <div className="flex flex-wrap gap-3">
          {PUBLICS.map((item) => (
            <span className="rounded-full border border-[#002f1d]/15 bg-white px-4 py-2 text-sm font-black uppercase text-[#002f1d]" key={item}>
              {item}
            </span>
          ))}
        </div>
        <p className="mt-6 rounded-xl border-l-4 border-[#f7c600] bg-[#fffdf3] p-5 text-sm font-semibold leading-7 text-[#002f1d]">
          ✅ Les personnes <strong>extérieures au club</strong> peuvent aussi créer un compte et accéder aux formations, au même titre que les licenciés et leurs familles.
        </p>
      </section>

      {/* Séparation des plateformes */}
      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="official-card rounded-xl bg-white p-6">
            <h2 className="text-xl font-black uppercase text-[#002f1d]">Le site du club</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Présente le projet, les formations et le fonctionnement de l'Academy. C'est la vitrine d'information.</p>
          </div>
          <div className="official-card rounded-xl bg-white p-6">
            <h2 className="text-xl font-black uppercase text-[#002f1d]">La plateforme Academy</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Espace distinct où l'on crée son compte, se connecte, suit les formations et gère son parcours.</p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-slate-500">
          Deux espaces indépendants : la création de compte et les formations se font uniquement sur la plateforme Academy.
        </p>
      </section>

      {/* CTA final */}
      <section className="club-shell px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-black uppercase text-[#f7c600]">Prêt à commencer ?</h2>
          <p className="mt-4 text-lg text-white/85">Créez votre compte sur la plateforme Academy et accédez aux formations disponibles.</p>
          <div className="mt-8 flex justify-center">
            <a className={PRIMARY_BTN} href={ACADEMY_URL} target="_blank" rel="noopener noreferrer">
              Accéder à la plateforme Academy <ExternalLink size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
