import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminUserUpdatePayload } from "@/lib/api/validation";
import { canAdminUpdateProfile } from "@/lib/auth";
import { recordActivity } from "@/lib/db/foundations";
import { getProfileForAdmin, updateProfileForAdmin } from "@/lib/db/profiles";

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

  const actorRole = admin.context.profile?.role;

  if (!actorRole) {
    return jsonError(403, "FORBIDDEN", "Profil club introuvable.");
  }

  try {
    const target = await getProfileForAdmin(id);

    if (!target) {
      return jsonError(404, "NOT_FOUND", "Utilisateur introuvable.");
    }

    // Anti-élévation de privilèges : un admin ne peut ni se promouvoir lui-même,
    // ni gérer/attribuer un rôle de niveau supérieur ou égal au sien (sauf SUPER_ADMIN).
    const guard = canAdminUpdateProfile({
      actorRole,
      actorId: admin.context.user.id,
      targetId: target.id,
      targetCurrentRole: target.role,
      requestedRole: payload.data.role,
      changesStatus: payload.data.status !== undefined
    });

    if (!guard.ok) {
      return jsonError(403, "FORBIDDEN", guard.message);
    }

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
    return handleDbError("admin/users/[id]", error);
  }
}
