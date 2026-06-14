import {
  Apple,
  BookOpen,
  Briefcase,
  Clock,
  Compass,
  Cpu,
  Dumbbell,
  FileText,
  Flag,
  GraduationCap,
  Laptop,
  Rocket,
  UserPlus,
  Users,
  Video,
  Wifi
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Données partagées de la page /academy (vitrine de présentation : la plateforme
// de formation est un service EXTERNE déjà développé). Aucune donnée n'invente de
// prix, de chiffre ou de témoignage.

const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

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
  /** Description courte affichée sur la carte d'univers. */
  blurb: string;
  /** Image d'illustration de l'univers. */
  image: string;
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
    blurb: "Entraîne ton corps et ton mental pour performer sur le terrain au quotidien.",
    image: UNSPLASH("1579952363873-27f3bade9f55"),
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
    blurb: "Travaille, apprends et construis ton projet d'études sereinement.",
    image: UNSPLASH("1503676260728-1c00da094a0b"),
    accent: "#f59e0b",
    accentText: "#b45309",
    formations: [
      { icon: BookOpen, title: "Soutien scolaire", description: "Aide aux devoirs et révisions, du primaire au lycée.", audience: "Élèves, collégiens, lycéens", outcome: "De meilleures notes" },
      { icon: Compass, title: "Orientation", description: "Construis ton projet d'études et de métier sereinement.", audience: "Collégiens, lycéens", outcome: "Choisis ton orientation" }
    ]
  },
  {
    key: "pro",
    label: "Emploi & entrepreneuriat",
    tagline: "Décroche ton job et lance tes projets.",
    blurb: "Prépare ton entrée dans le monde professionnel ou lance tes projets.",
    image: UNSPLASH("1521791136064-7986c2920216"),
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
    blurb: "Maîtrise les outils d'aujourd'hui et de demain, à ton rythme.",
    image: UNSPLASH("1518770660439-4636190af475"),
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

// Formations « phares » mises en avant sur la home Academy (6 max).
export type FeaturedFormation = {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  level: string;
  accent: string;
  accentText: string;
};

export const FEATURED_FORMATIONS: FeaturedFormation[] = [
  { icon: Dumbbell, title: "Préparation sportive", description: "Développe ta condition physique et tes qualités athlétiques.", image: UNSPLASH("1551958219-acbc608c6377"), level: "Tous niveaux", accent: "#16a34a", accentText: "#15803d" },
  { icon: Apple, title: "Nutrition", description: "Mieux manger pour mieux jouer et mieux récupérer.", image: UNSPLASH("1490645935967-10de6ba17061"), level: "Tous niveaux", accent: "#16a34a", accentText: "#15803d" },
  { icon: Compass, title: "Orientation", description: "Construis ton projet d'études et trouve ta voie.", image: UNSPLASH("1488190211105-8b0e65b80b4e"), level: "Tous niveaux", accent: "#f59e0b", accentText: "#b45309" },
  { icon: Briefcase, title: "CV / Entretien", description: "Rédige un CV efficace et réussis tes entretiens.", image: UNSPLASH("1521737604893-d14cc237f11d"), level: "Tous niveaux", accent: "#6366f1", accentText: "#4f46e5" },
  { icon: Cpu, title: "Intelligence artificielle", description: "Utilise l'IA comme un pro pour tes études et tes projets.", image: UNSPLASH("1531297484001-80022131f5a1"), level: "Tous niveaux", accent: "#06b6d4", accentText: "#0e7490" },
  { icon: FileText, title: "Bureautique", description: "Excel, Word, PowerPoint : les bases pour gagner en efficacité.", image: UNSPLASH("1517245386807-bb43f82c33c4"), level: "Tous niveaux", accent: "#06b6d4", accentText: "#0e7490" }
];

export type Atout = {
  icon: LucideIcon;
  count?: number;
  unit?: string;
  value?: string;
  label: string;
  accent: string;
};

export const ATOUTS: Atout[] = [
  { icon: GraduationCap, count: TOTAL_FORMATIONS, unit: "formations", label: "Pour tous les objectifs", accent: "#16a34a" },
  { icon: Wifi, value: "100% en ligne", label: "Depuis ton téléphone", accent: "#06b6d4" },
  { icon: Users, value: "Ouvert à tous", label: "Sans prérequis", accent: "#6366f1" },
  { icon: Clock, value: "À ton rythme", label: "Quand tu veux, où tu veux", accent: "#f59e0b" }
];

export type Step = { icon: LucideIcon; label: string; text: string };

export const STEPS: Step[] = [
  { icon: Compass, label: "Découvre", text: "Explore les formations et choisis ton univers." },
  { icon: UserPlus, label: "Crée ton compte", text: "Inscription rapide et sans engagement, sur la plateforme Academy." },
  { icon: Rocket, label: "Commence ta formation", text: "Apprends à ton rythme, où tu veux, quand tu veux." }
];

export type Public = { label: string };

export const PUBLICS: Public[] = [
  { label: "Joueurs" },
  { label: "Parents" },
  { label: "Familles" },
  { label: "Étudiants" },
  { label: "Adultes" },
  { label: "Partenaires" },
  { label: "Personnes extérieures" }
];

export type FaqItem = { q: string; a: string };

// FAQ courte et factuelle (3 questions).
export const FAQ: FaqItem[] = [
  {
    q: "Faut-il être licencié au club ?",
    a: "Non. La plateforme est ouverte à tout le monde : licenciés comme personnes extérieures au club."
  },
  {
    q: "Comment s'inscrire ?",
    a: "Clique sur « Accéder à la plateforme » : tu es redirigé vers la plateforme Academy où tu crées ton compte en quelques clics."
  },
  {
    q: "Où se déroulent les formations ?",
    a: "100% en ligne : depuis ton téléphone, ta tablette ou ton ordinateur, où que tu sois."
  }
];
