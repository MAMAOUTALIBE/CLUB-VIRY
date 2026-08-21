import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminPlayerUpdatePayload } from "@/lib/api/validation";
import { getPlayerDetailForAdmin, updatePlayerForAdmin } from "@/lib/db/family";
import { recordActivity } from "@/lib/db/foundations";
import { softDeleteRow } from "@/lib/db/soft-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const player = await getPlayerDetailForAdmin(id);

    if (!player) {
      return jsonError(404, "NOT_FOUND", "Joueur introuvable.");
    }

    return jsonOk(player);
  } catch (error) {
    return handleDbError("admin/players/[id]", error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant joueur invalide.");
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminPlayerUpdatePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Fiche joueur invalide.", payload.issues);
  }

  try {
    const player = await updatePlayerForAdmin(id, payload.data);

    if (!player) {
      return jsonError(404, "NOT_FOUND", "Joueur introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "player.updated",
      entityType: "players",
      entityId: id,
      metadata: { fields: Object.keys(payload.data) }
    });

    return jsonOk({ player });
  } catch (error) {
    return handleDbError("admin/players/[id]", error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "players:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }

  try {
    // Archivage seulement : dossiers d'inscription, convocations et paiements
    // référencent ce joueur. La purge définitive passe par la corbeille.
    const trashed = await softDeleteRow("players", id, admin.context.user.id);

    if (!trashed) {
      return jsonError(404, "NOT_FOUND", "Joueur introuvable.");
    }

    await recordActivity({
      actorId: admin.context.user.id,
      action: "player.trashed",
      entityType: "players",
      entityId: id
    });

    return jsonOk({ trashed: true });
  } catch (error) {
    return handleDbError("admin/players/[id]", error);
  }
}
