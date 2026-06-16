import type { NextRequest } from "next/server";

import { jsonOk, parseLimit } from "@/lib/api/http";
import { listPublishedNews } from "@/lib/db/content";
import { getFallbackNewsArticles } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 12, 50);
  const news = await readPublicDb(() => listPublishedNews(limit));

  if (news && news.length > 0) {
    return jsonOk({ news });
  }

  return jsonOk({ news: getFallbackNewsArticles(limit) });
}
