import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { getPublishedNewsBySlug } from "@/lib/db/content";
import { getFallbackNewsArticleBySlug } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const article = (await readPublicDb(() => getPublishedNewsBySlug(slug))) ?? getFallbackNewsArticleBySlug(slug);

    if (!article) {
      return jsonError(404, "NOT_FOUND", "Actualite introuvable.");
    }

    return jsonOk({ article });
  } catch (error) {
    return handleDbError("news/[slug]", error);
  }
}
