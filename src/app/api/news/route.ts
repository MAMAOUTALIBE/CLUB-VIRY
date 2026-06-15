import type { NextRequest } from "next/server";

import { handleDbError, jsonOk, parseLimit } from "@/lib/api/http";
import { listPublishedNews } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { getPublicNews } from "@/lib/public-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 12, 50);

  try {
    if (!isSupabaseAdminConfigured) {
      const news = await getPublicNews(limit);
      return jsonOk({ news: news.slice(0, limit) });
    }

    const news = await listPublishedNews(limit);
    return jsonOk({ news });
  } catch (error) {
    return handleDbError("news", error);
  }
}
