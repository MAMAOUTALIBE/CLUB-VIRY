import type { AdminMediaAssetPayload } from "@/lib/api/validation";

export type CurrentMediaAssetState = {
  album_id: string | null;
  team_id: string | null;
  type: "PHOTO" | "VIDEO";
  content_kind: "MATCH" | "TRAINING" | null;
  playback_kind: "VIDEO" | "BROADCAST_LINK";
  access_level: "PUBLIC" | "FAMILY_PASS";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  title: string;
  url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  alt_text: string | null;
  is_featured: boolean;
  is_live: boolean;
  starts_at: string | null;
  ends_at: string | null;
  published_at: string | null;
};

/**
 * Applique les nettoyages métier liés aux changements de type, d'accès et de lecture.
 * Cette projection est utilisée avant validation finale et juste avant l'écriture DB.
 */
export function normalizeMediaAssetPayload(input: AdminMediaAssetPayload): AdminMediaAssetPayload {
  const output: AdminMediaAssetPayload = { ...input };

  if (output.type === "PHOTO") {
    output.contentKind = null;
    output.playbackKind = "VIDEO";
    output.thumbnailUrl = null;
    output.isLive = false;
  }

  if (output.contentKind !== "TRAINING" || output.playbackKind !== "BROADCAST_LINK") {
    output.isLive = false;
  }

  if (output.accessLevel === "PUBLIC") {
    output.storagePath = null;
  } else if (output.playbackKind === "BROADCAST_LINK") {
    output.storagePath = null;
  } else if (output.storagePath) {
    output.url = null;
  }

  return output;
}

/** Fusionne un PATCH validé avec la ligne courante pour produire un état complet. */
export function mergeCurrentMediaAssetWithPatch(
  current: CurrentMediaAssetState | null,
  patch: AdminMediaAssetPayload
): AdminMediaAssetPayload | null {
  if (!current) return null;

  return normalizeMediaAssetPayload({
    ...(current.album_id ? { albumId: current.album_id } : {}),
    teamId: current.team_id,
    type: current.type,
    contentKind: current.content_kind,
    playbackKind: current.playback_kind,
    accessLevel: current.access_level,
    status: current.status,
    title: current.title,
    url: current.url,
    storagePath: current.storage_path,
    thumbnailUrl: current.thumbnail_url,
    ...(current.alt_text ? { altText: current.alt_text } : {}),
    isFeatured: current.is_featured,
    isLive: current.is_live,
    startsAt: current.starts_at,
    endsAt: current.ends_at,
    publishedAt: current.published_at,
    ...patch
  });
}
