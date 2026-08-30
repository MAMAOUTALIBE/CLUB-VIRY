import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { getFamilyOperationsSummaryForAdmin } from "@/lib/db/family-operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant famille invalide.");

  try {
    const summary = await getFamilyOperationsSummaryForAdmin(id);
    if (!summary) return jsonError(404, "NOT_FOUND", "Famille introuvable.");
    return jsonOk({ summary });
  } catch (error) {
    return handleDbError("admin/families/[id]/operations", error);
  }
}
