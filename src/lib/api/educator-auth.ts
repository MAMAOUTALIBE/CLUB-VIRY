import "server-only";

import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/http";
import { getAuthContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import type { AuthContext } from "@/lib/auth/session";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export type EducatorContext = AuthContext & {
  canManageAllTeams: boolean;
};

export type EducatorContextResult =
  | {
      ok: true;
      context: EducatorContext;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function getEducatorContext(request: NextRequest): Promise<EducatorContextResult> {
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

  const role = auth.context.profile?.role;

  if (!role) {
    return {
      ok: false,
      response: jsonError(403, "FORBIDDEN", "Profil club introuvable.")
    };
  }

  const canManageOwnTeams = hasPermission(role, "educator:manage_own_teams");
  const canManageAllTeams = hasPermission(role, "teams:manage");

  if (!canManageOwnTeams && !canManageAllTeams) {
    return {
      ok: false,
      response: jsonError(403, "FORBIDDEN", "Permission educateur insuffisante.")
    };
  }

  return {
    ok: true,
    context: {
      ...auth.context,
      canManageAllTeams
    }
  };
}
