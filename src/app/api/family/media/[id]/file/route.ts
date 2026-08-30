import type { NextRequest } from "next/server";

import { handleDbError, jsonError } from "@/lib/api/http";
import { isUuid } from "@/lib/api/validation";
import { getAuthContext } from "@/lib/auth/session";
import { getAuthorizedPremiumMedia } from "@/lib/db/family-media-access";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAMILY_MEDIA_BUCKET = "family-media";
const SINGLE_RANGE_PATTERN = /^bytes=(?:\d+-\d*|-\d+)$/;
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm"
};

function downloadFilename(title: string, storagePath: string): string {
  const extension = storagePath.split(".").pop()?.toLowerCase();
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "media-es-viry";
  return extension ? `${base}.${extension}` : base;
}

type RouteContext = { params: Promise<{ id: string }> };

function storageObjectUrl(storagePath: string): URL {
  const storageOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storageOrigin) throw new Error("Supabase storage origin is not configured.");

  const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
  return new URL(`/storage/v1/object/${FAMILY_MEDIA_BUCKET}/${encodedPath}`, storageOrigin);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthContext(request);
  if (!auth.ok) return jsonError(auth.status, auth.code, auth.message);
  if (!isSupabaseAdminConfigured) return jsonError(503, "CONFIGURATION_ERROR", "Stockage non configuré.");

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "VALIDATION_ERROR", "Identifiant média invalide.");

  try {
    const { decision, asset } = await getAuthorizedPremiumMedia(auth.context.user.id, id);
    if (!decision.ok || !asset?.storage_path || asset.playback_kind === "BROADCAST_LINK") {
      return jsonError(403, "FORBIDDEN", "Ce média n'est pas autorisé pour votre famille.");
    }

    const range = request.headers.get("range");
    if (range && !SINGLE_RANGE_PATTERN.test(range)) {
      return jsonError(416, "VALIDATION_ERROR", "Plage de lecture invalide.");
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return jsonError(503, "CONFIGURATION_ERROR", "Stockage non configuré.");

    const storageResponse = await fetch(storageObjectUrl(asset.storage_path), {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        ...(range ? { Range: range } : {})
      },
      redirect: "error",
      signal: request.signal
    });

    if (storageResponse.status === 404) {
      await storageResponse.body?.cancel();
      return jsonError(404, "NOT_FOUND", "Fichier média introuvable.");
    }

    if (storageResponse.status === 416) {
      await storageResponse.body?.cancel();
      return new Response(null, {
        status: 416,
        headers: {
          ...(storageResponse.headers.get("content-range")
            ? { "Content-Range": storageResponse.headers.get("content-range")! }
            : {}),
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, no-store"
        }
      });
    }

    if (storageResponse.status !== 200 && storageResponse.status !== 206) {
      await storageResponse.body?.cancel();
      return jsonError(502, "SUPABASE_ERROR", "Le fichier média ne peut pas être lu actuellement.");
    }

    const extension = asset.storage_path.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
    const contentLength = storageResponse.headers.get("content-length");
    const contentRange = storageResponse.headers.get("content-range");
    const shouldDownload = request.nextUrl.searchParams.get("download") === "1";
    const disposition = shouldDownload
      ? `attachment; filename*=UTF-8''${encodeURIComponent(downloadFilename(asset.title, asset.storage_path))}`
      : "inline";

    return new Response(storageResponse.body, {
      status: storageResponse.status,
      headers: {
        "Content-Type": contentType,
        ...(contentLength ? { "Content-Length": contentLength } : {}),
        ...(contentRange ? { "Content-Range": contentRange } : {}),
        "Accept-Ranges": "bytes",
        "Content-Disposition": disposition,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return handleDbError("family/media/[id]/file", error);
  }
}
