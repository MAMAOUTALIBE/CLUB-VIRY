import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { AppRole } from "@/lib/auth/roles";
import type { ProfileStatus } from "@/lib/db/types";
import { listProfilesForAdmin } from "@/lib/db/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_USER_ROLES: readonly AppRole[] = [
  "SUPER_ADMIN",
  "ADMIN_CLUB",
  "DIRIGEANT",
  "EDUCATEUR",
  "FAMILLE",
  "JOUEUR",
  "MEMBRE",
  "PARTENAIRE",
  "VISITEUR"
];

const PROFILE_STATUSES: readonly ProfileStatus[] = ["ACTIVE", "PENDING", "SUSPENDED", "ARCHIVED"];

function parseRole(value: string | null): AppRole | undefined {
  return ADMIN_USER_ROLES.includes(value as AppRole) ? (value as AppRole) : undefined;
}

function parseStatus(value: string | null): ProfileStatus | undefined {
  return PROFILE_STATUSES.includes(value as ProfileStatus) ? (value as ProfileStatus) : undefined;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100) || 100, 500);
  const role = parseRole(request.nextUrl.searchParams.get("role"));
  const status = parseStatus(request.nextUrl.searchParams.get("status"));

  try {
    const users = await listProfilesForAdmin({ limit, role, status });
    return jsonOk({ users });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur utilisateurs admin inconnue.");
  }
}
