import { jsonOk } from "@/lib/api/http";
import { listPublicProducts } from "@/lib/db/recruitment-shop";
import { getFallbackProducts } from "@/lib/public-fallbacks";
import { readPublicDb } from "@/lib/public-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await readPublicDb(() => listPublicProducts());

  if (products && products.products.length > 0) {
    return jsonOk(products);
  }

  return jsonOk(getFallbackProducts());
}
