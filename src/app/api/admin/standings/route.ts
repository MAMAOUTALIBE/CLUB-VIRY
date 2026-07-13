import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, parseLimit, readJsonBody } from "@/lib/api/http";
import { validateAdminStandingPayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { createStanding, listStandingsForAdmin } from "@/lib/db/standings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 300, 500);

  try {
    return jsonOk({ standings: await listStandingsForAdmin(limit) });
  } catch (error) {
    return handleDbError("admin/standings", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "teams:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  }

  const payload = validateAdminStandingPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Ligne de classement invalide.", payload.issues);
  }

  try {
    const standing = await createStanding(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "standing.created",
      entityType: "standings",
      entityId: standing.id,
      metadata: { competition: standing.competition, teamName: standing.team_name }
    });
    revalidatePath("/resultats");

    return jsonOk({ standing }, 201);
  } catch (error) {
    return handleDbError("admin/standings", error);
  }
}
