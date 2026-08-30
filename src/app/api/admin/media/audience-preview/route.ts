import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { validateFamilyMediaAudiencePreviewPayload } from "@/lib/api/validation";
import { countCurrentFamilyMediaAudience } from "@/lib/db/family-media-audience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "content:manage");
  if (!admin.ok) return admin.response;

  const payload = validateFamilyMediaAudiencePreviewPayload({
    teamId: request.nextUrl.searchParams.get("teamId"),
    right: request.nextUrl.searchParams.get("right")
  });
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Aperçu d’audience invalide.", payload.issues);

  try {
    const count = await countCurrentFamilyMediaAudience(payload.data);
    const response = jsonOk({ count });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return handleDbError("admin/media/audience-preview", error);
  }
}
