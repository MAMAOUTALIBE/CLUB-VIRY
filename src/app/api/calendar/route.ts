import type { NextRequest } from "next/server";

import { jsonOk, parseLimit } from "@/lib/api/http";
import { toPublicEvent, toPublicMatch } from "@/lib/api/public-projection";
import { listPublicCalendar } from "@/lib/db/calendar";
import { getFallbackCalendar } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateParam(value: string | null): string | undefined {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return undefined;
  }

  return value;
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 50, 100);
  const from = getDateParam(request.nextUrl.searchParams.get("from"));
  const to = getDateParam(request.nextUrl.searchParams.get("to"));
  const calendar = await readPublicDb(() => listPublicCalendar({ limit, from, to }));

  if (calendar && (calendar.events.length > 0 || calendar.matches.length > 0)) {
    return jsonOk({ events: calendar.events.map(toPublicEvent), matches: calendar.matches.map(toPublicMatch) });
  }

  const fallback = getFallbackCalendar(limit);
  return jsonOk({ events: fallback.events.map(toPublicEvent), matches: fallback.matches.map(toPublicMatch) });
}
