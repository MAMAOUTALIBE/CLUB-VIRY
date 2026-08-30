import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { getAuthorizedPremiumMedia } from "@/lib/db/family-media-access";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthContext(request);
  if (!auth.ok) return jsonError(auth.status, auth.code, auth.message);
  if (!isSupabaseAdminConfigured) return jsonError(503, "CONFIGURATION_ERROR", "Stockage non configuré.");

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant média invalide.");

  try {
    const { decision, asset } = await getAuthorizedPremiumMedia(auth.context.user.id, id);
    if (!decision.ok || !asset) {
      return jsonError(403, "FORBIDDEN", "Ce média n'est pas autorisé pour votre famille.");
    }

    if (asset.playback_kind === "BROADCAST_LINK" && asset.url) {
      const response = jsonOk({ kind: "BROADCAST_LINK", url: asset.url });
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }

    if (asset.storage_path) {
      const response = jsonOk({ kind: "PRIVATE_FILE", streamUrl: `/api/family/media/${asset.id}/file` });
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }

    return jsonError(404, "NOT_FOUND", "Fichier média introuvable.");
  } catch (error) {
    return handleDbError("family/media/[id]/access", error);
  }
}
