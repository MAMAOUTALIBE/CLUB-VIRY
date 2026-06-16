import { jsonOk } from "@/lib/api/http";
import { listPublicMedia } from "@/lib/db/content";
import { getFallbackMedia } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const media = await readPublicDb(() => listPublicMedia());

  if (media && (media.albums.length > 0 || media.assets.length > 0)) {
    return jsonOk(media);
  }

  return jsonOk(getFallbackMedia());
}
