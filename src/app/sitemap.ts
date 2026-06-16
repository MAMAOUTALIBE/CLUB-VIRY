import type { MetadataRoute } from "next";

import { getClubOfficials, getPublicNews, getPublicTeams } from "@/lib/public-content";

// Pages publiques indexables. Les zones privées (/admin, /espace-membre, /espace-educateur)
// sont volontairement EXCLUES : elles ne doivent pas être indexées.
const STATIC_ROUTES = [
  "",
  "/le-club",
  "/le-club/histoire",
  "/le-club/mot-du-president",
  "/le-club/bureau",
  "/le-club/dirigeants",
  "/le-club/organigramme",
  "/le-club/encadrement",
  "/le-club/installations",
  "/le-club/codes-de-conduite",
  "/le-club/stade-henri-longuet",
  "/academy",
  "/formation/ecole-de-foot",
  "/formation/football-a-11",
  "/formation/projet-ecole-de-foot",
  "/formation/stages",
  "/equipes",
  "/actualites",
  "/calendrier",
  "/resultats",
  "/inscriptions",
  "/detections-recrutement",
  "/partenaires",
  "/medias",
  "/boutique",
  "/boutique/conditions-generales",
  "/boutique/livraison-retour",
  "/contact",
  "/mentions-legales",
  "/politique-confidentialite",
  "/plan-du-site"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [news, teams, officials] = await Promise.all([getPublicNews(50), getPublicTeams(), getClubOfficials()]);
    const allOfficials = [...officials.bureau, ...officials.dirigeants];
    dynamicEntries = [
      ...news.map((article) => ({
        url: `${baseUrl}/actualites/${article.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6
      })),
      ...teams.map((team) => ({
        url: `${baseUrl}/equipes/${team.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6
      })),
      ...allOfficials.map((official) => ({
        url: `${baseUrl}/le-club/organigramme/${official.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5
      }))
    ];
  } catch {
    // Base indisponible : on conserve au moins les routes statiques.
  }

  return [...staticEntries, ...dynamicEntries];
}
