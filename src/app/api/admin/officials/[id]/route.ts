import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminOfficialPayload } from "@/lib/api/validation";
import { updateOfficial } from "@/lib/db/officials";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminOfficialPayload(body, { partial: true });

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Dirigeant invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const official = await updateOfficial(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "official.updated",
      entityType: "club_officials",
      entityId: official.id,
      metadata: { full_name: official.full_name, is_active: official.is_active }
    });

    return jsonOk({ official });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour dirigeant inconnue.");
  }
}
