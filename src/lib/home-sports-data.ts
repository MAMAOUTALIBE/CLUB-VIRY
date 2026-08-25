export type TrainingSlot = { id?: string; time: string; pitch: "T1" | "T2" | "T3" | "T4"; group?: string; educator?: string; comment?: string };
export type TrainingRow = { category: string; subtitle: string; accent: string; days: TrainingSlot[][] };
export type UpcomingMatch = { category: string; home: string; away: string; date: string; time: string; venue: string };
export type RecentResult = { category: string; home: string; away: string; homeScore: number; awayScore: number; date: string; venue: string };
export type FeaturedNews = { badge: string; title: string; description: string; date: string; category: string; image: string; href: string };

export const trainingSchedule: TrainingRow[] = [
  { category: "U6 à U10", subtitle: "École primaire", accent: "#f7c600", days: [[], [{ time: "17h30 – 19h00", pitch: "T4", group: "A – B" }], [{ time: "10h00 – 11h30", pitch: "T2" }, { time: "11h30 – 13h00", pitch: "T2", group: "U8/U9 A" }], [], [{ time: "17h30 – 19h00", pitch: "T4" }]] },
  { category: "U11 à U14", subtitle: "Collège", accent: "#ef5b8c", days: [[{ time: "17h30 – 19h00", pitch: "T2", group: "C – B – A" }], [{ time: "17h30 – 19h00", pitch: "T2", group: "C – B – A" }], [{ time: "14h00 – 15h30", pitch: "T2", group: "A – B – C" }, { time: "15h30 – 17h00", pitch: "T2", group: "A – B – C" }], [{ time: "17h30 – 19h00", pitch: "T2", group: "A – B" }], [{ time: "17h30 – 19h00", pitch: "T2", group: "A – B – C" }]] },
  { category: "U16 à U18", subtitle: "Lycée", accent: "#f47b35", days: [[], [{ time: "19h00 – 20h30", pitch: "T4", group: "Féminines" }], [{ time: "19h00 – 20h30", pitch: "T2", group: "U16" }], [{ time: "19h00 – 20h30", pitch: "T2", group: "Féminines" }], [{ time: "19h00 – 20h30", pitch: "T2", group: "U18" }, { time: "20h30 – 22h00", pitch: "T2", group: "U18" }]] },
  { category: "Féminines", subtitle: "", accent: "#f15b88", days: [[{ time: "19h00 – 20h30", pitch: "T4" }], [], [{ time: "19h00 – 20h30", pitch: "T2" }], [{ time: "19h00 – 20h30", pitch: "T4" }], []] },
  { category: "Séniors", subtitle: "Football adulte", accent: "#b8d34a", days: [[{ time: "20h00 – 22h00", pitch: "T2", group: "Séniors B" }, { time: "20h00 – 22h00", pitch: "T1", group: "Vétérans" }], [{ time: "20h00 – 22h00", pitch: "T1", group: "Séniors A" }], [{ time: "20h30 – 22h00", pitch: "T4", group: "Séniors A" }], [{ time: "20h00 – 22h00", pitch: "T1", group: "Séniors A – B" }, { time: "20h30 – 22h00", pitch: "T2", group: "Séniors A" }], [{ time: "20h00 – 22h00", pitch: "T1", group: "Séniors A" }]] }
];

export const upcomingMatches: UpcomingMatch[] = [
  { category: "Séniors A", home: "ES Viry", away: "COMPACT", date: "Sam. 5 sept. 2026", time: "18:00", venue: "Stade Henri Longuet" },
  { category: "U18 A", home: "ES Viry", away: "Brétigny FC", date: "Dim. 6 sept. 2026", time: "15:00", venue: "Stade Henri Longuet" },
  { category: "U16 A", home: "ES Viry", away: "Evry FC", date: "Sam. 5 sept. 2026", time: "15:00", venue: "Stade Henri Longuet" }
];

export const recentResults: RecentResult[] = [
  { category: "Séniors A", home: "ES Viry", away: "Morsang FC", homeScore: 3, awayScore: 1, date: "30 août 2026", venue: "Stade Henri Longuet" },
  { category: "U18 A", home: "Brétigny FC", away: "ES Viry", homeScore: 1, awayScore: 2, date: "30 août 2026", venue: "Stade des Tilleuls" },
  { category: "U16 A", home: "ES Viry", away: "Ste Geneviève", homeScore: 4, awayScore: 0, date: "29 août 2026", venue: "Stade Henri Longuet" }
];

export const featuredNews: FeaturedNews = {
  badge: "À la une", title: "Belle victoire des Séniors A !", description: "Un match maîtrisé de bout en bout et une belle dynamique collective.",
  date: "30 août 2026", category: "Séniors A", image: "/stade/tribune2.jpg", href: "/actualites"
};
