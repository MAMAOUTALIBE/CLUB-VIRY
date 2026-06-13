import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminOfficialPayload } from "@/lib/api/validation";
import { createOfficial, listOfficialsForAdmin } from "@/lib/db/officials";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 200) || 200, 500);

  try {
    const officials = await listOfficialsForAdmin(limit);
    return jsonOk({ officials });
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur dirigeants admin inconnue.");
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const body = await readJsonBody(request);

  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateAdminOfficialPayload(body);

  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Dirigeant invalide.", payload.issues);
  }

  try {
    const official = await createOfficial(payload.data);
    await recordActivity({
      actorId: admin.context.user.id,
      action: "official.created",
      entityType: "club_officials",
      entityId: official.id,
      metadata: { full_name: official.full_name, category: official.category }
    });

    return jsonOk({ official }, 201);
  } catch (error) {
    return jsonError(500, "SUPABASE_ERROR", error instanceof Error ? error.message : "Erreur creation dirigeant inconnue.");
  }
}
