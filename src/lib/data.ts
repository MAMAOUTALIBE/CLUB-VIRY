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
  /** Niveau de championnat (ex. "D2"). Chaine vide pour les categories sans championnat classe. */
  level: string;
  /** Poule du championnat, ou null tant que le district ne l'a pas publiee. */
  pool: string | null;
  season: string;
  description: string;
  image: string;
  coach: string;
  assistant: string;
  nextMatch: string;
  players: string[];
};

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
    team: "Seniors A",
    home: "ES Viry-Châtillon",
    away: "COMPACT",
    date: "Sam. 5 sept.",
    time: "18:00",
    place: "Stade Henri Longuet"
  },
  {
    team: "U18 A",
    home: "ES Viry-Châtillon",
    away: "Brétigny FC",
    date: "Dim. 6 sept.",
    time: "15:00",
    place: "Stade Henri Longuet"
  },
  {
    team: "U16 A",
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
    title: "Victoire des Seniors A !",
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
    slug: "seniors-a",
    name: "Seniors A",
    category: "Seniors",
    level: "D2",
    pool: null,
    season: "2025 / 2026",
    description: "L'équipe fanion du club, engagée en Départemental 2.",
    image: images.teamHuddle,
    coach: "ABDEDDAIM Khaled",
    assistant: "FRIHI Fouad",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "seniors-b",
    name: "Seniors B",
    category: "Seniors",
    level: "D3",
    pool: null,
    season: "2025 / 2026",
    description: "L'équipe réserve, engagée en Départemental 3 : la passerelle entre la formation et le groupe fanion.",
    image: images.pitch,
    coach: "OUARAS Chérif",
    assistant: "TRAORÉ Djibril",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "u18-a",
    name: "U18 A",
    category: "Formation",
    level: "D3",
    pool: "Poule à confirmer",
    season: "2025 / 2026",
    description: "Le groupe de fin de formation, engagé en Départemental 3, dernière marche avant les seniors.",
    image: images.training,
    coach: "JEAN ETIENNE Yoann",
    assistant: "",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "u16-a",
    name: "U16 A",
    category: "Jeunes",
    level: "D2",
    pool: null,
    season: "2025 / 2026",
    description: "Le groupe compétition de la catégorie U16, engagé en Départemental 2.",
    image: images.youthTeam,
    coach: "BURNER Axel",
    assistant: "",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "u16-b",
    name: "U16 B",
    category: "Jeunes",
    level: "D4",
    pool: "Poule à confirmer",
    season: "2025 / 2026",
    description: "Le second groupe U16, engagé en Départemental 4, pour continuer à jouer et à progresser.",
    image: images.youthTeam,
    coach: "À confirmer",
    assistant: "",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "u14-a",
    name: "U14 A",
    category: "Jeunes",
    level: "D2",
    pool: null,
    season: "2025 / 2026",
    description: "L'entrée dans le football à 11, en Départemental 2, entre apprentissage technique et exigences de la compétition.",
    image: images.youthTeam,
    coach: "ANAS ABID",
    assistant: "",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "u14-b",
    name: "U14 B",
    category: "Jeunes",
    level: "D4",
    pool: "Poule à confirmer",
    season: "2025 / 2026",
    description: "Le second groupe U14, engagé en Départemental 4, pour offrir du temps de jeu à tous les joueurs de la catégorie.",
    image: images.youthTeam,
    coach: "À confirmer",
    assistant: "",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "u13",
    name: "U13",
    category: "Jeunes",
    level: "",
    pool: null,
    season: "2025 / 2026",
    description: "La dernière année de football à 8, tournée vers le passage au football à 11.",
    image: images.youthTeam,
    coach: "ROBERTO Kévin",
    assistant: "",
    nextMatch: "Calendrier à confirmer",
    players: []
  },
  {
    slug: "feminines",
    name: "Féminines",
    category: "Féminines",
    level: "",
    pool: null,
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
    level: "",
    pool: null,
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
  "Adidas",
  "Pro Emba",
  "MS SOL"
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
