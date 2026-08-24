import type { NextRequest } from "next/server";
import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { validateAdminSavedViewPayload } from "@/lib/api/validation";
import { createSavedView, listSavedViews } from "@/lib/db/saved-views";
import { recordActivity } from "@/lib/db/foundations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;
  const scope = request.nextUrl.searchParams.get("scope");
  if (!scope || !/^[a-z0-9_-]+$/.test(scope)) return jsonError(400, "VALIDATION_ERROR", "Portée invalide.");
  try {
    return jsonOk({ savedViews: await listSavedViews(scope, admin.context.user.id) });
  } catch (error) {
    return handleDbError("admin/saved-views", error);
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext(request, "admin:access");
  if (!admin.ok) return admin.response;
  const body = await readJsonBody(request);
  if (body === undefined) return jsonError(400, "INVALID_JSON", "Le corps de la requête doit être un JSON valide.");
  const payload = validateAdminSavedViewPayload(body);
  if (!payload.ok) return jsonError(400, "VALIDATION_ERROR", "Vue invalide.", payload.issues);
  try {
    const view = await createSavedView(payload.data, admin.context.user.id);
    await recordActivity({ actorId: admin.context.user.id, action: "saved_view.created", entityType: "saved_views", entityId: view.id, metadata: { scope: view.scope, name: view.name } });
    return jsonOk({ savedView: view }, 201);
  } catch (error) {
    return handleDbError("admin/saved-views", error);
  }
}
