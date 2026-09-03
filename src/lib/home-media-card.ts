import type { MediaAsset } from "@/lib/db/types";
import type { MobileMatchCard } from "@/lib/mobile-match-feed";

export type HomepageMediaAsset = Pick<
  MediaAsset,
  "id" | "content_kind" | "playback_kind" | "status" | "type" | "title" | "url" | "thumbnail_url" | "is_live" | "starts_at" | "ends_at" | "published_at" | "created_at"
> & { teams?: { name: string } | null };

export type HomeMediaCard =
  | { kind: "LIVE_MATCH"; match: MobileMatchCard }
  | {
      kind: "VIDEO";
      id: string;
      contentKind: "MATCH" | "TRAINING";
      playbackKind: "VIDEO" | "BROADCAST_LINK";
      isLive: boolean;
      title: string;
      videoUrl: string;
      coverImageUrl: string | null;
      teamName: string | null;
      publishedAt: string;
    };

function validDate(value: string | null): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isVisibleVideo(asset: HomepageMediaAsset, now: number): boolean {
  if (asset.type !== "VIDEO" || asset.status !== "PUBLISHED" || !asset.content_kind || !asset.url?.trim()) return false;
  const publishedAt = validDate(asset.published_at);
  if (publishedAt === null || publishedAt > now) return false;
  const startsAt = validDate(asset.starts_at);
  const endsAt = validDate(asset.ends_at);
  if (asset.starts_at && startsAt === null) return false;
  if (asset.ends_at && endsAt === null) return false;
  return (startsAt === null || startsAt <= now) && (endsAt === null || endsAt > now);
}

function latest(assets: HomepageMediaAsset[]): HomepageMediaAsset | null {
  return [...assets].sort((left, right) => {
    const publicationDelta = (validDate(right.published_at) ?? 0) - (validDate(left.published_at) ?? 0);
    return publicationDelta || (validDate(right.created_at) ?? 0) - (validDate(left.created_at) ?? 0);
  })[0] ?? null;
}

function toVideoCard(asset: HomepageMediaAsset | null): HomeMediaCard | null {
  if (!asset?.content_kind) return null;
  return {
    kind: "VIDEO",
    id: asset.id,
    contentKind: asset.content_kind,
    playbackKind: asset.playback_kind,
    isLive: asset.is_live,
    title: asset.title,
    videoUrl: asset.url ?? "",
    coverImageUrl: asset.thumbnail_url,
    teamName: asset.teams?.name?.trim() || null,
    publishedAt: asset.published_at ?? asset.created_at
  };
}

export function selectHomeMediaCard(liveMatch: MobileMatchCard | null, assets: HomepageMediaAsset[], now = new Date()): HomeMediaCard | null {
  if (liveMatch) return { kind: "LIVE_MATCH", match: liveMatch };

  const visible = assets.filter((asset) => isVisibleVideo(asset, now.getTime()));
  const latestMatchVideo = latest(visible.filter((asset) => asset.content_kind === "MATCH" && !asset.is_live));
  if (latestMatchVideo) return toVideoCard(latestMatchVideo);

  const latestTrainingVideo = latest(visible.filter((asset) => asset.content_kind === "TRAINING" && !asset.is_live));
  return toVideoCard(latestTrainingVideo);
}
