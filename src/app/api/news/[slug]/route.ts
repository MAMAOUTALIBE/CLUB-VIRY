import { jsonError, jsonOk } from "@/lib/api/http";
import { getPublishedNewsBySlug } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  const { slug } = await context.params;

  try {
    const article = await getPublishedNewsBySlug(slug);

    if (!article) {
      return jsonError(404, "NOT_FOUND", "Actualite introuvable.");
    }

    return jsonOk({ article });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur actualite inconnue.");
  }
}
