import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminFamilyMediaPassPayload } from "@/lib/api/validation";
import { createFamilyMediaPass, listFamilyMediaPassesForAdmin } from "@/lib/db/family-media-passes";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 200, 1000);

  try {
    return jsonOk({ passes: await listFamilyMediaPassesForAdmin(limit) });
  } catch (error) {
    return handleDbError("admin/family-media-passes", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminFamilyMediaPassPayload(body);
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Pass Famille Média invalide.", payload.issues);
  }

  try {
    const pass = await createFamilyMediaPass(payload.data, admin.context.user.id);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "family_media_pass.created",
      entityType: "family_media_passes",
      entityId: pass.id,
      metadata: { familyId: pass.family_id, seasonId: pass.season_id, status: pass.status }
    });
    return jsonOk({ pass }, 201);
  } catch (error) {
    return handleDbError("admin/family-media-passes", error);
  }
}
