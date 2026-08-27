import type { NextRequest } from "next/server";

import { jsonOk, parseLimit } from "@/lib/api/http";
import { toPublicMatch } from "@/lib/api/public-projection";
import { listMatches } from "@/lib/db/teams";
import { getFallbackMatches } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 20, 50);
  const matches = await readPublicDb(() => listMatches(limit));

  if (matches && matches.length > 0) {
    return jsonOk({ matches: matches.map(toPublicMatch) });
  }

  return jsonOk({ matches: getFallbackMatches(limit).map(toPublicMatch) });
}
