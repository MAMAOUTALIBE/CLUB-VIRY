import type { MetadataRoute } from "next";

import { getClubOfficials, getPublicEducators, getPublicNews, getPublicTeams } from "@/lib/public-content";

// Le plan de site lit la base (actualités, équipes, dirigeants, éducateurs). Sans
// `revalidate`, Next.js le fige au BUILD — or l'image Docker est construite hors du
// réseau Supabase, donc le rendu de build ne voit QUE les données de repli. Résultat :
// un sitemap mocké servi un an (s-maxage=31536000). On le régénère donc toutes les
// heures côté serveur, où la base est bien joignable.
export const revalidate = 3600;

// Pages publiques indexables. Les zones privées (/admin, /espace-membre, /espace-educateur)
// sont volontairement EXCLUES : elles ne doivent pas être indexées.
const STATIC_ROUTES = [
  "",
  "/le-club",
  "/le-club/histoire",
  "/le-club/galerie",
  "/le-club/organigramme",
  "/le-club/infrastructures",
  "/le-club/valeurs-partenaires",
  "/academy",
  "/equipes",
  "/actualites",
  "/calendrier",
  "/resultats",
  "/inscriptions",
  "/detections-recrutement",
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
    const [news, teams, officials, educators] = await Promise.all([getPublicNews(50), getPublicTeams(), getClubOfficials(), getPublicEducators()]);
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
      })),
      // Fiches éducateurs : publiques et liées depuis /academy, au même titre que
      // les fiches dirigeants ci-dessus — elles manquaient au plan de site.
      ...educators.map((educator) => ({
        url: `${baseUrl}/le-club/encadrement/${educator.slug}`,
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
