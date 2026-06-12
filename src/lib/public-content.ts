import "server-only";

import { news as mockNews } from "@/lib/data";
import { listPublishedNews } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { images } from "@/lib/images";
import { slugify } from "@/lib/slug";

/**
 * Couche de lecture publique du contenu éditorial.
 * - Si Supabase est configuré ET qu'il y a du contenu publié → on lit la base
 *   (ce que l'admin a saisi dans le CRM).
 * - Sinon (mode vitrine, ou base vide, ou erreur) → repli sur les données mockées,
 *   pour que le site reste toujours présentable.
 */
export type DisplayNews = {
  title: string;
  slug: string;
  date: string;
  isoDate: string;
  category: string;
  excerpt: string;
  image: string;
  content?: string;
};

const frDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function formatFr(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : frDate.format(d);
}

function fromMock(): DisplayNews[] {
  return mockNews.map((n) => ({
    title: n.title,
    slug: slugify(n.title),
    date: n.date,
    isoDate: n.isoDate,
    category: n.category,
    excerpt: n.excerpt,
    image: n.image
  }));
}

export async function getPublicNews(limit = 12): Promise<DisplayNews[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listPublishedNews(limit);
      if (rows.length > 0) {
        return rows.map((a) => {
          const iso = a.published_at ?? a.created_at;
          return {
            title: a.title,
            slug: a.slug || slugify(a.title),
            date: formatFr(iso),
            isoDate: (iso ?? "").slice(0, 10),
            category: "Actualité",
            excerpt: a.excerpt ?? "",
            image: a.cover_image_url || images.teamHuddle,
            content: a.content
          };
        });
      }
    } catch {
      // repli mock ci-dessous
    }
  }
  return fromMock();
}

export async function getPublicNewsBySlug(slug: string): Promise<DisplayNews | null> {
  const all = await getPublicNews(50);
  return all.find((n) => n.slug === slug) ?? null;
}
