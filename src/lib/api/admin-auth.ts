import "server-only";

import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/http";
import type { Permission } from "@/lib/auth";
import { getAuthContext, hasPermission, requirePermission } from "@/lib/auth";
import type { AuthContext } from "@/lib/auth/session";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

/**
 * Un acteur peut-il publier du contenu ? (permission content:publish). Sert à
 * empêcher un CONTRIBUTEUR de passer un contenu en PUBLISHED — il reste en brouillon.
 */
export function canPublishContent(context: AuthContext): boolean {
  const role = context.profile?.role;
  return role ? hasPermission(role, "content:publish") : false;
}

export type AdminContextResult =
  | {
      ok: true;
      context: AuthContext;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function getAdminContext(request: NextRequest, permission: Permission): Promise<AdminContextResult> {
  const auth = await getAuthContext(request);

  if (!auth.ok) {
    return {
      ok: false,
      response: jsonError(auth.status, auth.code, auth.message)
    };
  }

  if (!isSupabaseAdminConfigured) {
    return {
      ok: false,
      response: jsonError(503, "CONFIGURATION_ERROR", "Supabase service role n'est pas encore configure.")
    };
  }

  const access = requirePermission(auth.context, permission);

  if (!access.ok) {
    return {
      ok: false,
      response: jsonError(access.status, access.code, access.message)
    };
  }

  return {
    ok: true,
    context: auth.context
  };
}
