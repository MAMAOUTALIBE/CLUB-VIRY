import type { NextRequest } from "next/server";

import { handleDbError, jsonError } from "@/lib/api/http";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHOTO_BUCKET = "educator-photos";
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

// Proxy PUBLIC de la photo d'un éducateur : Supabase étant interne, on streame
// l'image depuis le storage. On ne sert que les profils publics.
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!uuidPattern.test(id)) {
    return jsonError(400, "VALIDATION_ERROR", "Identifiant invalide.");
  }
  if (!isSupabaseAdminConfigured) {
    return jsonError(503, "CONFIGURATION_ERROR", "Stockage non configure.");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("avatar_path, public_profile")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return handleDbError("media/educator", error);
    }
    if (!profile || !profile.public_profile || !profile.avatar_path) {
      return jsonError(404, "NOT_FOUND", "Photo introuvable.");
    }

    const { data, error: downloadError } = await supabase.storage.from(PHOTO_BUCKET).download(profile.avatar_path as string);
    if (downloadError || !data) {
      return jsonError(404, "NOT_FOUND", "Photo introuvable.");
    }

    const arrayBuffer = await data.arrayBuffer();
    const ext = String(profile.avatar_path).split(".").pop()?.toLowerCase() ?? "";
    // Content-Type épinglé à une allowlist (jamais déduit de data.type / du client).
    const contentType = MIME_BY_EXTENSION[ext] ?? "application/octet-stream";

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(arrayBuffer.byteLength),
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch (error) {
    return handleDbError("media/educator", error);
  }
}
