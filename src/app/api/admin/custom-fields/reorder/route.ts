import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateReorderPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { reorderRows } from "@/lib/db/ordering";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Réorganise l'ordre d'affichage des champs personnalisés (glisser-déposer). */
export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");
  if (!admin.ok) return admin.response;

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateReorderPayload(body);
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Ordre invalide.", payload.issues);
  }

  try {
    await reorderRows("custom_field_definitions", payload.data.ids);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "custom_field.reordered",
      entityType: "custom_field_definitions",
      metadata: { count: payload.data.ids.length }
    });
    return jsonOk({ reordered: true });
  } catch (error) {
    return handleDbError("admin/custom-fields/reorder", error);
  }
}
