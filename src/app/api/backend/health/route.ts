import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase";
import { isSupabaseAdminConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "es-viry-backend-foundations",
    mode: isSupabaseConfigured && isSupabaseAdminConfigured ? "crm" : "vitrine",
    environment: {
      publicSupabaseConfigured: isSupabaseConfigured,
      adminSupabaseConfigured: isSupabaseAdminConfigured
    }
  });
}
