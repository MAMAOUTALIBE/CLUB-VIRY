import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminFamilyPayload } from "@/lib/api/validation";
import { createFamilyForAdmin, listFamiliesForAdmin } from "@/lib/db/family";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 100, 2000);

  try {
    const payload = await listFamiliesForAdmin(limit);
    return jsonOk(payload);
  } catch (error) {
    return handleDbError("admin/families", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminFamilyPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Famille invalide.", payload.issues);
  }

  try {
    const family = await createFamilyForAdmin(payload.data.name);

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family.created",
      entityType: "families",
      entityId: family.id,
      metadata: { name: family.name }
    });

    return jsonOk({ family });
  } catch (error) {
    return handleDbError("admin/families", error);
  }
}
