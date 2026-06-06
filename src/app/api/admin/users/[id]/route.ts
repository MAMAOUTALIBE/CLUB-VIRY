import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminUserUpdatePayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { updateProfileForAdmin } from "@/lib/db/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "admin:manage_users");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminUserUpdatePayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Utilisateur invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const profile = await updateProfileForAdmin(id, payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "profile.updated",
      entityType: "profiles",
      entityId: profile.id,
      metadata: {
        role: profile.role,
        status: profile.status
      }
    });

    return jsonOk({ profile });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur mise a jour utilisateur inconnue.");
  }
}
