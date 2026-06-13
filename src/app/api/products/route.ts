import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listPublicProducts } from "@/lib/db/recruitment-shop";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  try {
    const products = await listPublicProducts();
    return jsonOk(products);
  } catch (error) {
    return handleDbError("products", error);
  }
}
