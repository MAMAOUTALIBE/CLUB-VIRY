import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminSeasonPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateSeason } from "@/lib/db/seasons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminSeasonPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Saison invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const season = await updateSeason(id, payload.data);

    if (!season) {
      return jsonError(404, "NOT_FOUND", "Saison introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "season.updated",
      entityType: "seasons",
      entityId: season.id,
      metadata: { name: season.name, isActive: season.is_active }
    });

    return jsonOk({ season });
  } catch (error) {
    return handleDbError("admin/seasons/[id]", error);
  }
}
