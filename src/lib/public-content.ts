import "server-only";

import type { LucideIcon } from "lucide-react";

import { news as mockNews, partners as mockPartners, products as mockProducts } from "@/lib/data";
import { listPartnersForAdmin, listPublicMedia, listPublishedNews } from "@/lib/db/content";
import { listPublicProducts } from "@/lib/db/recruitment-shop";
import { getAllSettings } from "@/lib/db/settings";
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

export type DisplayPartner = { name: string; logoUrl: string | null; websiteUrl: string | null; tier: string | null };

export async function getPublicPartners(): Promise<DisplayPartner[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const rows = await listPartnersForAdmin(100);
      const active = rows
        .filter((p) => p.is_active)
        .sort((a, b) => a.order_index - b.order_index);
      if (active.length > 0) {
        return active.map((p) => ({ name: p.name, logoUrl: p.logo_url, websiteUrl: p.website_url, tier: p.tier }));
      }
    } catch {
      // repli mock
    }
  }
  return mockPartners.map((name) => ({ name, logoUrl: null, websiteUrl: null, tier: null }));
}

export type DisplayProduct = { name: string; price: string; category: string; imageUrl: string | null; icon: LucideIcon | null };

function priceFr(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency || "EUR" }).format(cents / 100);
}

export async function getPublicProducts(): Promise<DisplayProduct[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const { products } = await listPublicProducts();
      if (products.length > 0) {
        return products.map((p) => ({ name: p.name, price: priceFr(p.price_cents, p.currency), category: "Boutique", imageUrl: p.image_url, icon: null }));
      }
    } catch {
      // repli mock
    }
  }
  return mockProducts.map((p) => ({ name: p.name, price: p.price, category: p.category, imageUrl: null, icon: p.icon }));
}

export type DisplayAlbum = { title: string; image: string };

export type SiteContent = {
  socials: { facebook: string; instagram: string; youtube: string; tiktok: string; whatsapp: string };
  contact: { phone1: string; phone2: string; email: string; address: string };
  president: { name: string; message: string; photoUrl: string };
  inscriptions_banner: { text: string; active: boolean };
};

const SETTINGS_DEFAULTS: SiteContent = {
  socials: { facebook: "", instagram: "", youtube: "", tiktok: "", whatsapp: "" },
  contact: { phone1: "06 29 67 04 33", phone2: "01 69 96 67 00", email: "esvirychatillon91170@gmail.com", address: "Stade Henri Longuet, 91170 Viry-Châtillon" },
  president: { name: "Saglam Ferhat", message: "", photoUrl: "" },
  inscriptions_banner: { text: "Inscriptions des licenciés : du 09 juin jusqu'à la fin du mois de juin — rejoignez l'ES Viry-Châtillon !", active: true }
};

export async function getSiteSettings(): Promise<SiteContent> {
  if (isSupabaseAdminConfigured) {
    try {
      const all = await getAllSettings();
      return {
        socials: { ...SETTINGS_DEFAULTS.socials, ...(all.socials ?? {}) },
        contact: { ...SETTINGS_DEFAULTS.contact, ...(all.contact ?? {}) },
        president: { ...SETTINGS_DEFAULTS.president, ...(all.president ?? {}) },
        inscriptions_banner: { ...SETTINGS_DEFAULTS.inscriptions_banner, ...(all.inscriptions_banner ?? {}) }
      } as SiteContent;
    } catch {
      // repli défauts
    }
  }
  return SETTINGS_DEFAULTS;
}

export async function getPublicAlbums(): Promise<DisplayAlbum[]> {
  if (isSupabaseAdminConfigured) {
    try {
      const { albums } = await listPublicMedia();
      if (albums.length > 0) {
        return albums.map((a) => ({ title: a.title, image: a.cover_image_url || images.teamHuddle }));
      }
    } catch {
      // repli mock
    }
  }
  return mockNews.map((n) => ({ title: n.title, image: n.image }));
}
