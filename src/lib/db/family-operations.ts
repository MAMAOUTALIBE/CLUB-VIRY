import "server-only";

import { familyMediaDateKey, isFamilyMediaPassCurrent, requiredRightForMedia } from "@/lib/family-media-entitlement";
import {
  buildFamilyOperationsAnomalies,
  canLoadFamilyOperationsResources,
  type FamilyOperationsAnomalyCode
} from "@/lib/family-operations-state";
import { listFamilyAccessAccountsForAdmin, type FamilyAccessAccount } from "@/lib/db/family-access";
import {
  listFamilyMediaPassesForFamilyAdmin,
  type AdminFamilyMediaPass
} from "@/lib/db/family-media-passes";
import { listSeasonsForAdmin } from "@/lib/db/seasons";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { listTeamsForAdmin } from "@/lib/db/teams";
import type { MediaAsset, Season, Team } from "@/lib/db/types";

export type FamilyOperationsResource = Pick<
  MediaAsset,
  "id" | "team_id" | "type" | "content_kind" | "playback_kind" | "title" | "is_live" | "starts_at" | "ends_at" | "published_at"
> & { team_name: string | null };

export type FamilyOperationsSummary = {
  family: { id: string; name: string };
  accounts: FamilyAccessAccount[];
  currentPass: AdminFamilyMediaPass | null;
  seasons: Season[];
  teams: Team[];
  resources: FamilyOperationsResource[];
  resourcesTruncated: boolean;
  anomalies: Array<{ code: FamilyOperationsAnomalyCode; label: string }>;
};

function passIsCurrent(pass: AdminFamilyMediaPass, dateKey: string): boolean {
  return isFamilyMediaPassCurrent(
    { status: pass.status, startsOn: pass.starts_on, endsOn: pass.ends_on },
    dateKey
  );
}

function selectOperationalPass(passes: AdminFamilyMediaPass[], seasons: Season[], dateKey: string): AdminFamilyMediaPass | null {
  const operationalSeason =
    seasons.find((season) => season.is_active) ??
    seasons.find((season) => season.starts_on <= dateKey && season.ends_on >= dateKey) ??
    null;

  if (operationalSeason) return passes.find((pass) => pass.season_id === operationalSeason.id) ?? null;
  return passes.find((pass) => pass.starts_on <= dateKey && pass.ends_on >= dateKey) ?? passes[0] ?? null;
}

function passAllowsResource(pass: AdminFamilyMediaPass, asset: Pick<MediaAsset, "type" | "content_kind">): boolean {
  const right = requiredRightForMedia(asset);
  if (right === "PHOTOS") return pass.allow_photos;
  if (right === "TRAINING_VIDEOS") return pass.allow_training_videos;
  if (right === "LIVE_MATCHES") return pass.allow_live_matches;
  return false;
}

export async function getFamilyOperationsSummaryForAdmin(
  familyId: string,
  now = new Date()
): Promise<FamilyOperationsSummary | null> {
  const supabase = getSupabaseAdminClient();
  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("id,name")
    .eq("id", familyId)
    .is("deleted_at", null)
    .maybeSingle();
  if (familyError) throw new Error(`Unable to fetch family operations family: ${familyError.message}`);
  if (!family) return null;

  const [accounts, passes, seasons, teams] = await Promise.all([
    listFamilyAccessAccountsForAdmin(familyId),
    listFamilyMediaPassesForFamilyAdmin(familyId),
    listSeasonsForAdmin(50),
    listTeamsForAdmin(500)
  ]);
  if (accounts === null) return null;

  const dateKey = familyMediaDateKey(now);
  const currentPass = selectOperationalPass(passes, seasons, dateKey);
  const current = currentPass ? passIsCurrent(currentPass, dateKey) : false;
  const scopedTeamIds = currentPass?.teams.map((team) => team.id) ?? [];
  const accountStatuses = accounts.map((account) => account.status);
  let resources: FamilyOperationsResource[] = [];
  let resourcesTruncated = false;

  if (
    currentPass &&
    canLoadFamilyOperationsResources({ accountStatuses, passIsCurrent: current, teamCount: scopedTeamIds.length })
  ) {
    const nowIso = now.toISOString();
    const accessFilters = [
      currentPass.allow_photos ? "type.eq.PHOTO" : null,
      currentPass.allow_training_videos ? "and(type.eq.VIDEO,content_kind.eq.TRAINING)" : null,
      currentPass.allow_live_matches ? "and(type.eq.VIDEO,content_kind.eq.MATCH)" : null
    ].filter((filter): filter is string => Boolean(filter));
    const { data, error } = await supabase
      .from("media_assets")
      .select("id,team_id,type,content_kind,playback_kind,title,is_live,starts_at,ends_at,published_at")
      .eq("access_level", "FAMILY_PASS")
      .eq("status", "PUBLISHED")
      .in("team_id", scopedTeamIds)
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .or(accessFilters.join(","))
      .order("published_at", { ascending: false })
      .limit(101);
    if (error) throw new Error(`Unable to fetch family operations resources: ${error.message}`);

    const teamsById = new Map(teams.map((team) => [team.id, team.name]));
    const visible = ((data ?? []) as Array<Omit<FamilyOperationsResource, "team_name">>).filter(
      (asset) =>
        passAllowsResource(currentPass, asset) &&
        (asset.starts_at === null || Date.parse(asset.starts_at) <= now.getTime()) &&
        (asset.ends_at === null || Date.parse(asset.ends_at) > now.getTime())
    );
    resourcesTruncated = visible.length > 100;
    resources = visible.slice(0, 100).map((asset) => ({
      ...asset,
      team_name: asset.team_id ? teamsById.get(asset.team_id) ?? null : null
    }));
  }

  const anomalies = buildFamilyOperationsAnomalies({
    accountStatuses,
    hasPass: currentPass !== null,
    passIsCurrent: current,
    teamCount: scopedTeamIds.length,
    resourceCount: resources.length
  });

  return {
    family: { id: family.id as string, name: family.name as string },
    accounts,
    currentPass,
    seasons,
    teams,
    resources,
    resourcesTruncated,
    anomalies
  };
}
