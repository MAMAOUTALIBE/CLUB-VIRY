import { handleDbError, jsonOk } from "@/lib/api/http";
import { news as fallbackNews } from "@/lib/data";
import { listPublicMedia } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import type { MediaAlbum } from "@/lib/db/types";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFallbackMedia() {
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

export async function GET() {
  if (!isSupabaseAdminConfigured) {
    return jsonOk(getFallbackMedia());
  }

  try {
    const media = await listPublicMedia();
    return jsonOk(media);
  } catch (error) {
    return handleDbError("media", error);
  }
}
