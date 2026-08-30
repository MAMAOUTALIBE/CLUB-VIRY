import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminFamilyMediaPassPayload } from "@/lib/api/validation";
import { getFamilyMediaPassForAdmin, updateFamilyMediaPass } from "@/lib/db/family-media-passes";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant de pass invalide.");

  try {
    const pass = await getFamilyMediaPassForAdmin(id);
    if (!pass) return jsonError(404, "NOT_FOUND", "Pass Famille Média introuvable.");
    return jsonOk({ pass });
  } catch (error) {
    return handleDbError("admin/family-media-passes/[id]", error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant de pass invalide.");

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminFamilyMediaPassPayload(body, { partial: true });
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Pass Famille Média invalide.", payload.issues);
  }

  try {
    const pass = await updateFamilyMediaPass(id, payload.data, admin.context.user.id);
    if (!pass) return jsonError(404, "NOT_FOUND", "Pass Famille Média introuvable.");

    await recordActivity({
      actorId: admin.context.user.id,
      action: "family_media_pass.updated",
      entityType: "family_media_passes",
      entityId: pass.id,
      metadata: {
        status: pass.status,
        rights: {
          photos: pass.allow_photos,
          trainingVideos: pass.allow_training_videos,
          liveMatches: pass.allow_live_matches
        },
        teamIds: pass.teams.map((team) => team.id)
      }
    });
    return jsonOk({ pass });
  } catch (error) {
    return handleDbError("admin/family-media-passes/[id]", error);
  }
}
