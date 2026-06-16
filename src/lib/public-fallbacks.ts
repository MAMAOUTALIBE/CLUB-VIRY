import "server-only";

import { matches as fallbackMatches, news as fallbackNews, partners as fallbackPartners, products as fallbackProducts, teams as fallbackTeams } from "@/lib/data";
import type { PublicCalendarPayload } from "@/lib/db/calendar";
import type { PublicProductsPayload } from "@/lib/db/recruitment-shop";
import type { Match, MediaAlbum, NewsArticle, Partner, Team } from "@/lib/db/types";
import { slugify } from "@/lib/slug";

const clubName = "ES Viry-Châtillon";
const fallbackMatchDates = ["2026-09-05T18:00:00+02:00", "2026-09-06T15:00:00+02:00", "2026-09-05T15:00:00+02:00"];

export function getFallbackNewsArticles(limit = 12): NewsArticle[] {
  return fallbackNews.slice(0, limit).map((article, index) => {
    const iso = `${article.isoDate}T00:00:00+02:00`;
    return {
      id: `fallback-news-${index + 1}`,
      title: article.title,
      slug: slugify(article.title),
      excerpt: article.excerpt,
      content: article.excerpt,
      cover_image_url: article.image,
      status: "PUBLISHED",
      published_at: iso,
      author_id: null,
      team_id: null,
      notified_at: null,
      seo_title: null,
      seo_description: null,
      created_at: iso,
      updated_at: iso
    };
  });
}

export function getFallbackNewsArticleBySlug(slug: string): NewsArticle | null {
  return getFallbackNewsArticles(50).find((article) => article.slug === slug) ?? null;
}

export function getFallbackTeams(): Team[] {
  const now = new Date().toISOString();
  return fallbackTeams.map((team, index) => ({
    id: `fallback-team-${team.slug}`,
    season_id: null,
    category_id: null,
    name: team.name,
    slug: team.slug,
    level: null,
    age_range: team.category,
    gender: "MIXTE",
    description: team.description,
    cover_image_url: team.image,
    order_index: index,
    is_active: true,
    created_at: now,
    updated_at: now
  }));
}

export function getFallbackMatches(limit = 20): Match[] {
  const now = new Date().toISOString();
  return fallbackMatches.slice(0, limit).map((match, index) => ({
    id: `fallback-match-${index + 1}`,
    team_id: null,
    season_id: null,
    opponent_name: match.away,
    opponent_logo_url: null,
    location: "HOME",
    starts_at: fallbackMatchDates[index] ?? now,
    venue: match.place,
    competition: match.team,
    status: "SCHEDULED",
    home_score: null,
    away_score: null,
    notes: null,
    created_at: now,
    updated_at: now
  }));
}

export function getFallbackRecentResults(): Match[] {
  const now = new Date().toISOString();
  const rows: Array<[string, string, string, number, number]> = [
    ["Seniors D1", "COMPACT", "2026-06-14T18:00:00+02:00", 2, 1],
    ["U18 R1", "Brétigny FC", "2026-06-08T15:00:00+02:00", 1, 1],
    ["U15 R1", "Evry FC", "2026-06-07T15:00:00+02:00", 3, 0]
  ];

  return rows.map(([competition, opponent, startsAt, homeScore, awayScore], index) => ({
    id: `fallback-result-${index + 1}`,
    team_id: null,
    season_id: null,
    opponent_name: opponent,
    opponent_logo_url: null,
    location: "HOME",
    starts_at: startsAt,
    venue: "Stade Henri Longuet",
    competition,
    status: "FINISHED",
    home_score: homeScore,
    away_score: awayScore,
    notes: null,
    created_at: now,
    updated_at: now
  }));
}

export function getFallbackCalendar(limit = 50): PublicCalendarPayload {
  return { events: [], matches: getFallbackMatches(limit) };
}

export function getFallbackProducts(): PublicProductsPayload {
  const categoryNames = Array.from(new Set(fallbackProducts.map((product) => product.category)));
  const now = new Date().toISOString();
  const categories = categoryNames.map((name, index) => ({
    id: `fallback-category-${slugify(name)}`,
    name,
    slug: slugify(name),
    order_index: index,
    is_active: true,
    created_at: now,
    updated_at: now
  }));

  return {
    categories,
    products: fallbackProducts.map((product, index) => {
      const category = categories.find((item) => item.name === product.category);
      return {
        id: `fallback-product-${slugify(product.name)}`,
        category_id: category?.id ?? null,
        name: product.name,
        slug: slugify(product.name),
        description: null,
        image_url: null,
        status: "ACTIVE",
        price_cents: Math.round(Number(product.price.replace(",", ".").replace(/[^\d.]/g, "")) * 100),
        currency: "EUR",
        order_index: index,
        created_at: now,
        updated_at: now
      };
    }),
    variants: []
  };
}

export function getFallbackPartners(): Partner[] {
  const now = new Date().toISOString();
  return fallbackPartners.map((name, index) => ({
    id: `fallback-partner-${slugify(name)}`,
    name,
    slug: slugify(name),
    logo_url: null,
    website_url: null,
    tier: null,
    description: null,
    order_index: index,
    is_active: true,
    created_at: now,
    updated_at: now
  }));
}

export function getFallbackMedia() {
  const albums: MediaAlbum[] = fallbackNews.map((item) => ({
    id: `fallback-album-${slugify(item.title)}`,
    title: item.title,
    slug: slugify(item.title),
    description: item.excerpt,
    cover_image_url: item.image,
    status: "PUBLISHED",
    published_at: `${item.isoDate}T00:00:00+02:00`,
    created_at: `${item.isoDate}T00:00:00+02:00`,
    updated_at: `${item.isoDate}T00:00:00+02:00`
  }));

  return { albums, assets: [] };
}

export { clubName };
