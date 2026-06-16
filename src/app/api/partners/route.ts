import { jsonOk } from "@/lib/api/http";
import { listActivePartners } from "@/lib/db/content";
import { getFallbackPartners } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const partners = await readPublicDb(() => listActivePartners());

  if (partners && partners.length > 0) {
    return jsonOk({ partners });
  }

  return jsonOk({ partners: getFallbackPartners() });
}
