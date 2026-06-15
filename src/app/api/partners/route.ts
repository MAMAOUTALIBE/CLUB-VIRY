import { handleDbError, jsonOk } from "@/lib/api/http";
import { partners as fallbackPartners } from "@/lib/data";
import { listActivePartners } from "@/lib/db/content";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFallbackPartners() {
  return fallbackPartners.map((name, index) => ({
    id: `fallback-partner-${slugify(name)}`,
    name,
    slug: slugify(name),
    logo_url: null,
    website_url: null,
    tier: null,
    description: null,
    order_index: index,
    is_active: true,
    created_at: "",
    updated_at: ""
  }));
}

export async function GET() {
  if (!isSupabaseAdminConfigured) {
    return jsonOk({ partners: getFallbackPartners() });
  }

  try {
    const partners = await listActivePartners();
    return jsonOk({ partners });
  } catch (error) {
    return handleDbError("partners", error);
  }
}
