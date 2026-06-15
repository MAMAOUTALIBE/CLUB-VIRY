import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getPublishedNewsBySlug } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { getPublicNewsBySlug } from "@/lib/public-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (!isSupabaseAdminConfigured) {
    const article = await getPublicNewsBySlug(slug);

    if (!article) {
      return jsonError(404, "NOT_FOUND", "Actualite introuvable.");
    }

    return jsonOk({ article });
  }

  try {
    const article = await getPublishedNewsBySlug(slug);

    if (!article) {
      return jsonError(404, "NOT_FOUND", "Actualite introuvable.");
    }

    return jsonOk({ article });
  } catch (error) {
    return handleDbError("news/[slug]", error);
  }
}
