import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { isUuid, validateAdminSeasonPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateSeason } from "@/lib/db/seasons";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { softDeleteRow } from "@/lib/db/soft-delete";

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "teams:manage");
  if (!admin.ok) return admin.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  try {
    const { data, error } = await getSupabaseAdminClient().from("seasons").select("is_active").eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) throw error;
    if (!data) return jsonError(404, "NOT_FOUND", "Saison introuvable.");
    if (data.is_active) return jsonError(409, "VALIDATION_ERROR", "Désactivez la saison avant de l’archiver.");
    await softDeleteRow("seasons", id, admin.context.user.id);
    await recordActivity({ actorId: admin.context.user.id, action: "season.trashed", entityType: "seasons", entityId: id });
    return jsonOk({ trashed: true });
  } catch (error) { return handleDbError("admin/seasons/[id] DELETE", error); }
}
