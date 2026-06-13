import {
  Apple,
  BookOpen,
  Briefcase,
  Clock,
  Compass,
  Cpu,
  Dumbbell,
  ExternalLink,
  FileText,
  Flag,
  GraduationCap,
  Laptop,
  Layers,
  MousePointerClick,
  Rocket,
  UserPlus,
  Video,
  Wifi
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Données partagées de la page /academy. Module sans "use client" : importable
// aussi bien par le composant serveur (page.tsx) que par les composants client
// (quiz, filtres). Aucune donnée n'invente de prix, de chiffre ou de témoignage.

export type ThemeKey = "sport" | "scolaire" | "pro" | "numerique";

export type Formation = {
  icon: LucideIcon;
  title: string;
  description: string;
  audience: string;
  outcome: string;
};

export type Theme = {
  key: ThemeKey;
  label: string;
  tagline: string;
  /** Couleur d'accent vive : fonds teintés, icônes, liserés. */
  accent: string;
  /** Variante assombrie pour le TEXTE (contraste AA sur fond clair). */
  accentText: string;
  formations: Formation[];
};

export const THEMES: Theme[] = [
  {
    key: "sport",
    label: "Sport & performance",
    tagline: "Deviens plus fort, plus malin, plus complet.",
    accent: "#16a34a",
    accentText: "#15803d",
    formations: [
      { icon: Dumbbell, title: "Préparation sportive", description: "Gagne en explosivité, en endurance et évite les blessures.", audience: "Joueurs & sportifs", outcome: "Plus fort sur le terrain" },
      { icon: Apple, title: "Nutrition", description: "Mange mieux pour mieux jouer et récupérer plus vite.", audience: "Joueurs & familles", outcome: "Plus d'énergie au quotidien" },
      { icon: Flag, title: "Arbitrage", description: "Apprends les règles et lance-toi dans l'arbitrage.", audience: "Jeunes & bénévoles", outcome: "Deviens arbitre officiel" },
      { icon: Video, title: "Analyse vidéo", description: "Décrypte le jeu et progresse grâce à la vidéo.", audience: "Joueurs & éducateurs", outcome: "Lis le jeu comme un pro" }
    ]
  },
  {
    key: "scolaire",
    label: "École & avenir",
    tagline: "Cartonne en cours et choisis ta voie.",
    accent: "#f59e0b",
    accentText: "#b45309",
    formations: [
      { icon: BookOpen, title: "Soutien scolaire", description: "Aide aux devoirs et révisions, du primaire au lycée.", audience: "Élèves, collégiens, lycéens", outcome: "De meilleures notes" },
      { icon: Compass, title: "Orientation", description: "Construis ton projet d'études et de métier sereinement.", audience: "Collégiens, lycéens", outcome: "Choisis ton orientation" }
    ]
  },
  {
    key: "pro",
    label: "Taf & projets",
    tagline: "Décroche ton job et lance tes projets.",
    accent: "#6366f1",
    accentText: "#4f46e5",
    formations: [
      { icon: Briefcase, title: "CV / Entretien", description: "Un CV qui sort du lot et des entretiens maîtrisés.", audience: "Chercheurs d'emploi", outcome: "Décroche ton stage / job" },
      { icon: Rocket, title: "Entrepreneuriat", description: "De l'idée au projet : les clés pour entreprendre.", audience: "Jeunes & adultes", outcome: "Lance ton projet" }
    ]
  },
  {
    key: "numerique",
    label: "Numérique & IA",
    tagline: "Prends de l'avance sur la tech.",
    accent: "#06b6d4",
    accentText: "#0e7490",
    formations: [
      { icon: Laptop, title: "Numérique", description: "Maîtrise les outils numériques du quotidien et du travail.", audience: "Tous publics", outcome: "À l'aise avec le digital" },
      { icon: Cpu, title: "Intelligence artificielle", description: "Utilise l'IA comme un pro (et pas que pour tes devoirs).", audience: "Jeunes & adultes", outcome: "Crée avec l'IA" },
      { icon: FileText, title: "Bureautique", description: "Word, Excel, présentations : les bases pour étudier et bosser.", audience: "Tous publics", outcome: "Prêt pour les études & le travail" }
    ]
  }
];

export const TOTAL_FORMATIONS = THEMES.reduce((sum, theme) => sum + theme.formations.length, 0);

export type Atout = {
  icon: LucideIcon;
  count?: number;
  unit?: string;
  value?: string;
  label: string;
  accent: string;
};

export const ATOUTS: Atout[] = [
  { icon: GraduationCap, count: TOTAL_FORMATIONS, unit: "formations", label: "Sport · école · pro · numérique", accent: "#16a34a" },
  { icon: Layers, count: THEMES.length, unit: "univers", label: "Pour tous les profils", accent: "#6366f1" },
  { icon: Wifi, value: "100% en ligne", label: "Depuis ton téléphone", accent: "#06b6d4" },
  { icon: Clock, value: "À ton rythme", label: "Quand tu veux, où tu veux", accent: "#f59e0b" }
];

export type Step = { icon: LucideIcon; label: string };

export const STEPS: Step[] = [
  { icon: Compass, label: "Tu découvres les formations sur le site du club." },
  { icon: MousePointerClick, label: "Tu cliques sur « Je me lance »." },
  { icon: ExternalLink, label: "Tu arrives sur la plateforme Academy." },
  { icon: UserPlus, label: "Tu crées ton compte en quelques clics." },
  { icon: Rocket, label: "Tu choisis ta formation et c'est parti !" }
];

export type Profile = { icon: LucideIcon; label: string; text: string; accent: string };

// Cartes "profils" aspirationnelles (PAS des témoignages : aucun nom ni chiffre inventé).
export const PROFILES: Profile[] = [
  { icon: Dumbbell, label: "Joueur / sportif", text: "Gagne en explosivité, soigne ta récup et analyse ton jeu comme un pro.", accent: "#16a34a" },
  { icon: BookOpen, label: "Collégien / lycéen", text: "Rattrape ton retard, gagne en méthode et choisis ton orientation sereinement.", accent: "#f59e0b" },
  { icon: Briefcase, label: "En recherche d'emploi", text: "Un CV qui sort du lot, des entretiens maîtrisés et ton premier job en ligne de mire.", accent: "#6366f1" },
  { icon: Cpu, label: "Curieux du numérique", text: "Apprivoise l'IA et les outils numériques pour étudier, créer et bosser.", accent: "#06b6d4" }
];

export type Public = { label: string; highlight?: boolean };

export const PUBLICS: Public[] = [
  { label: "Joueurs du club" },
  { label: "Parents" },
  { label: "Familles" },
  { label: "Jeunes de Viry-Châtillon", highlight: true },
  { label: "Personnes externes au club" },
  { label: "Partenaires" },
  { label: "Adultes en reconversion" }
];

export type FaqItem = { q: string; a: string };

// FAQ factuelle : uniquement des réponses vérifiables (pas de prix, pas de diplôme inventé).
export const FAQ: FaqItem[] = [
  {
    q: "Faut-il être licencié au club pour s'inscrire ?",
    a: "Non. La plateforme est ouverte à tout le monde : licenciés, familles, jeunes de Viry-Châtillon et personnes extérieures au club."
  },
  {
    q: "Où se passent les formations ?",
    a: "100% en ligne. Tu peux suivre les formations depuis ton téléphone, ta tablette ou ton ordinateur, où que tu sois."
  },
  {
    q: "Je peux avancer à mon rythme ?",
    a: "Oui. Tu te connectes quand tu veux et tu progresses à ton rythme, sans contrainte d'horaire."
  },
  {
    q: "Comment je m'inscris ?",
    a: "Tu cliques sur « Je me lance », tu es redirigé vers la plateforme Academy et tu y crées ton compte en quelques clics."
  },
  {
    q: "Le compte du site et celui de la plateforme, c'est pareil ?",
    a: "Non, ce sont deux espaces indépendants. Le site du club présente les formations ; la création de compte et le suivi se font uniquement sur la plateforme Academy."
  },
  {
    q: "Il y a quoi comme formations ?",
    a: `${TOTAL_FORMATIONS} formations réparties en ${THEMES.length} univers : sport & performance, école & avenir, taf & projets, et numérique & IA.`
  }
];

export type QuizOption = { label: string; theme: ThemeKey };
export type QuizQuestion = { question: string; options: QuizOption[] };

export const QUIZ: QuizQuestion[] = [
  {
    question: "Ton objectif n°1 en ce moment ?",
    options: [
      { label: "Performer sur le terrain", theme: "sport" },
      { label: "Réussir à l'école", theme: "scolaire" },
      { label: "Décrocher un job ou un stage", theme: "pro" },
      { label: "Maîtriser le numérique & l'IA", theme: "numerique" }
    ]
  },
  {
    question: "Tu préfères apprendre comment ?",
    options: [
      { label: "En bougeant, du concret", theme: "sport" },
      { label: "Avec de la méthode et des cours", theme: "scolaire" },
      { label: "Sur des projets réels", theme: "pro" },
      { label: "Sur écran, avec des outils", theme: "numerique" }
    ]
  },
  {
    question: "Ce qui te motive le plus ?",
    options: [
      { label: "Progresser physiquement", theme: "sport" },
      { label: "Avoir de meilleures notes", theme: "scolaire" },
      { label: "Préparer mon avenir pro", theme: "pro" },
      { label: "Créer avec la technologie", theme: "numerique" }
    ]
  }
];
