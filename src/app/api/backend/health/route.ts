import { NextResponse } from "next/server";

import { APP_ROLES, ROLE_LABELS } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isSupabaseAdminConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "es-viry-backend-foundations",
    environment: {
      publicSupabaseConfigured: isSupabaseConfigured,
      adminSupabaseConfigured: isSupabaseAdminConfigured
    },
    roles: APP_ROLES.map((role) => ({
      value: role,
      label: ROLE_LABELS[role]
    }))
  });
}
