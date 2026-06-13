import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminRegistrationReviewPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { getRegistrationDetailForAdmin, reviewRegistration } from "@/lib/db/registrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "registrations:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;

  try {
    const registration = await getRegistrationDetailForAdmin(id);

    if (!registration) {
      return jsonError(404, "NOT_FOUND", "Dossier introuvable.");
    }

    return jsonOk(registration);
  } catch (error) {
    return handleDbError("admin/registrations/[id]", error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminContext(request, "registrations:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminRegistrationReviewPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Revue de dossier invalide.", payload.issues);
  }

  const { id } = await context.params;

  try {
    const registration = await reviewRegistration(id, payload.data, admin.context.user.id);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "registration.reviewed",
      entityType: "registrations",
      entityId: registration.id,
      metadata: { status: registration.status }
    });

    return jsonOk({ registration });
  } catch (error) {
    return handleDbError("admin/registrations/[id]", error);
  }
}
