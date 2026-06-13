import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listActivePartners } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.");
  }

  try {
    const partners = await listActivePartners();
    return jsonOk({ partners });
  } catch (error) {
    return handleDbError("partners", error);
  }
}
