import type { MetadataRoute } from "next";

const routes = [
  "",
  "/le-club",
  "/le-club/histoire",
  "/le-club/mot-du-president",
  "/le-club/organigramme",
  "/le-club/stade-henri-longuet",
  "/equipes",
  "/actualites",
  "/calendrier",
  "/inscriptions",
  "/detections-recrutement",
  "/partenaires",
  "/medias",
  "/boutique",
  "/contact",
  "/espace-membre",
  "/espace-educateur",
  "/admin"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7
  }));
}
