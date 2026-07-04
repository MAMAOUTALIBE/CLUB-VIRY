import {
  Award,
  Building2,
  CalendarDays,
  Dumbbell,
  Flag,
  Handshake,
  HeartHandshake,
  Shield,
  Shirt,
  Target,
  Trophy,
  Users
} from "lucide-react";
import { images } from "./images";

export type Team = {
  slug: string;
  name: string;
  category: string;
  season: string;
  description: string;
  image: string;
  coach: string;
  assistant: string;
  nextMatch: string;
  players: string[];
};

export const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Le Club", href: "/le-club" },
  { label: "Équipes", href: "/equipes" },
  { label: "Actualités", href: "/actualites" },
  { label: "Calendrier", href: "/calendrier" },
  { label: "Résultats", href: "/resultats" },
  { label: "Inscriptions", href: "/inscriptions" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Boutique", href: "/boutique" },
  { label: "Contact", href: "/contact" }
];

export const clubStats = [
  { label: "Licenciés", value: "+600", icon: Users },
  { label: "Éducateurs", value: "50", icon: Award },
  { label: "Équipes", value: "30", icon: Shield },
  { label: "Places", value: "5 700", icon: Building2 },
  { label: "Depuis", value: "1958", icon: CalendarDays }
];

export const values = [
  { title: "Respect", text: "Le respect de chacun, règle du jeu.", icon: Handshake },
  { title: "Travail", text: "Le travail et l'effort sont nos moteurs.", icon: Dumbbell },
  { title: "Solidarité", text: "On se tire toujours vers le haut.", icon: HeartHandshake },
  { title: "Ambition", text: "Viser l'excellence pour aller plus loin.", icon: Target },
  { title: "Passion", text: "Une passion qui nous unit tous.", icon: Trophy }
];

export const matches = [
  {
    team: "Seniors D1",
    home: "ES Viry-Châtillon",
    away: "COMPACT",
    date: "Sam. 5 sept.",
    time: "18:00",
    place: "Stade Henri Longuet"
  },
  {
    team: "U18 R1",
    home: "ES Viry-Châtillon",
    away: "Brétigny FC",
    date: "Dim. 6 sept.",
    time: "15:00",
    place: "Stade Henri Longuet"
  },
  {
    team: "U15 R1",
    home: "ES Viry-Châtillon",
    away: "Evry FC",
    date: "Sam. 5 sept.",
    time: "15:00",
    place: "Stade Henri Longuet"
  }
];

// `isoDate` (AAAA-MM-JJ) est la version machine de `date` : utilisee pour <time datetime>
// et le datePublished du JSON-LD NewsArticle.
export const news = [
  {
    title: "Victoire des Seniors D1 !",
    date: "24 mai 2026",
    isoDate: "2026-05-24",
    category: "Équipes",
    excerpt: "Un match maîtrisé de bout en bout et une belle dynamique collective.",
    image: images.teamHuddle
  },
  {
    title: "Stage de perfectionnement",
    date: "29 avr. 2026",
    isoDate: "2026-04-29",
    category: "Jeunes",
    excerpt: "Vacances d'avril : une semaine de travail, de plaisir et de progression.",
    image: images.training
  },
  {
    title: "Détection U13 : les dates à retenir",
    date: "5 avr. 2026",
    isoDate: "2026-04-05",
    category: "Détections",
    excerpt: "Le club accueille les jeunes talents du territoire pour préparer demain.",
    image: images.youthTeam
  },
  {
    title: "Tournoi U11 : un beau week-end",
    date: "12 avr. 2026",
    isoDate: "2026-04-12",
    category: "Événements",
    excerpt: "Bénévoles, éducateurs et familles réunis autour du football.",
    image: images.football
  },
  {
    title: "École de foot : un bel élan",
    date: "31 mars 2026",
    isoDate: "2026-03-31",
    category: "Jeunes",
    excerpt: "Retour sur un mois de mars riche en émotions et en progrès.",
    image: images.pitch
  }
];

export const teams: Team[] = [
  {
    slug: "seniors-r1",
    name: "Seniors D1",
    category: "Seniors",
    season: "2025 / 2026",
    description: "L'équipe fanion porte les couleurs jaune et verte au niveau départemental (D1).",
    image: images.teamHuddle,
    coach: "Yanis B.",
    assistant: "Mourad S.",
    nextMatch: "Samedi 5 septembre à 18:00 contre COMPACT",
    players: ["A. Diallo", "M. Traoré", "S. Keita", "I. Camara", "N. Benali", "T. Martin", "K. Diop", "R. Silva"]
  },
  {
    slug: "u18-r1",
    name: "U18 R1",
    category: "Formation",
    season: "2025 / 2026",
    description: "Un groupe de formation exigeant, préparé pour franchir les étapes seniors.",
    image: images.training,
    coach: "Karim M.",
    assistant: "Lina R.",
    nextMatch: "Dimanche 6 septembre à 15:00 contre Brétigny FC",
    players: ["L. Mendy", "A. Petit", "J. Morel", "F. Sylla", "D. Sow", "B. Kone"]
  },
  {
    slug: "u15-r1",
    name: "U15 R1",
    category: "Jeunes",
    season: "2025 / 2026",
    description: "Une génération encadrée avec rigueur, plaisir et progression individuelle.",
    image: images.youthTeam,
    coach: "Thomas R.",
    assistant: "Nabil A.",
    nextMatch: "Samedi 5 septembre à 15:00 contre Evry FC",
    players: ["R. N'Diaye", "I. Lopez", "M. Bamba", "Y. Cohen", "P. Lefort", "S. Diallo"]
  },
  {
    slug: "feminines",
    name: "Féminines",
    category: "Féminines",
    season: "2025 / 2026",
    description: "Le développement du football féminin avec ambition et accompagnement.",
    image: images.pitch,
    coach: "Sarah L.",
    assistant: "Julie C.",
    nextMatch: "Calendrier à confirmer",
    players: ["L. Bernard", "A. Henry", "C. Moreau", "M. Sissoko", "E. Garcia"]
  },
  {
    slug: "ecole-de-foot",
    name: "École de foot",
    category: "U6 à U11",
    season: "2025 / 2026",
    description: "L'apprentissage des fondamentaux dans un cadre familial et structurant.",
    image: images.youthTeam,
    coach: "Collectif éducateurs",
    assistant: "Référents catégories",
    nextMatch: "Plateaux du week-end",
    players: ["Groupes U6", "Groupes U7", "Groupes U8", "Groupes U9", "Groupes U10", "Groupes U11"]
  }
];

export const partners = [
  "Essonne Département",
  "Ville de Viry-Châtillon",
  "Intersport",
  "E.Leclerc",
  "Engie",
  "Crédit Mutuel",
  "Nike",
  "Adidas"
];

export const products = [
  { name: "Maillot domicile", price: "45,00 €", category: "Textile", icon: Shirt },
  { name: "Maillot extérieur", price: "45,00 €", category: "Textile", icon: Shirt },
  { name: "Survêtement", price: "60,00 €", category: "Textile", icon: Shield },
  { name: "Veste à capuche", price: "55,00 €", category: "Textile", icon: Shield },
  { name: "Sac de sport", price: "30,00 €", category: "Accessoires", icon: Flag },
  { name: "Casquette", price: "16,00 €", category: "Accessoires", icon: Trophy }
];

export const adminModules = [
  "Actualités",
  "Équipes",
  "Joueurs",
  "Matchs",
  "Résultats",
  "Calendrier",
  "Inscriptions",
  "Détections",
  "Boutique",
  "Produits",
  "Commandes",
  "Partenaires",
  "Médias",
  "Pages CMS"
];
