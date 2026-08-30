import "server-only";

import {
  evaluateFamilyMediaAccess,
  familyMediaDateKey,
  requiredRightForMedia,
  type FamilyMediaAccessDecision,
  type FamilyMediaAccessSnapshot,
  type FamilyMediaPassGrant,
  type FamilyMediaRight
} from "@/lib/family-media-entitlement";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { FamilyMediaPass, MediaAsset, ProfileStatus } from "@/lib/db/types";

export type FamilyMediaSummary = Pick<
  MediaAsset,
  | "id"
  | "team_id"
  | "type"
  | "content_kind"
  | "playback_kind"
  | "title"
  | "thumbnail_url"
  | "alt_text"
  | "is_live"
  | "starts_at"
  | "ends_at"
  | "published_at"
> & { access_path: string };

export type FamilyMediaPassOverview = {
  id: string;
  status: FamilyMediaPass["status"];
  startsOn: string;
  endsOn: string;
  allowPhotos: boolean;
  allowTrainingVideos: boolean;
  allowLiveMatches: boolean;
  teamNames: string[];
};

export type PremiumMediaAsset = MediaAsset & { access_level: "FAMILY_PASS" };

export async function loadFamilyMediaAccessSnapshot(profileId: string): Promise<FamilyMediaAccessSnapshot> {
  const supabase = getSupabaseAdminClient();
  const { data: profile, error: profileError } = await supabase.from("profiles").select("status").eq("id", profileId).maybeSingle();
  if (profileError) throw new Error(`Unable to fetch family media profile: ${profileError.message}`);

  const { data: members, error: membersError } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("profile_id", profileId);
  if (membersError) throw new Error(`Unable to fetch family media memberships: ${membersError.message}`);

  const memberFamilyIds = Array.from(new Set((members ?? []).map((member) => member.family_id as string)));
  if (memberFamilyIds.length === 0) {
    return { profileStatus: (profile?.status as ProfileStatus | undefined) ?? null, familyIds: [], passes: [] };
  }

  const { data: activeFamilies, error: familiesError } = await supabase
    .from("families")
    .select("id")
    .in("id", memberFamilyIds)
    .is("deleted_at", null);
  if (familiesError) throw new Error(`Unable to verify family media families: ${familiesError.message}`);

  const familyIds = (activeFamilies ?? []).map((family) => family.id as string);
  if (familyIds.length === 0) {
    return { profileStatus: (profile?.status as ProfileStatus | undefined) ?? null, familyIds: [], passes: [] };
  }

  const { data: passRows, error: passError } = await supabase.from("family_media_passes").select("*").in("family_id", familyIds);
  if (passError) throw new Error(`Unable to fetch family media passes: ${passError.message}`);

  const passes = (passRows ?? []) as FamilyMediaPass[];
  const passIds = passes.map((pass) => pass.id);
  const scopesByPass = new Map<string, string[]>();

  if (passIds.length > 0) {
    const { data: scopes, error: scopesError } = await supabase
      .from("family_media_pass_teams")
      .select("pass_id,team_id")
      .in("pass_id", passIds);
    if (scopesError) throw new Error(`Unable to fetch family media scopes: ${scopesError.message}`);

    for (const scope of scopes ?? []) {
      scopesByPass.set(scope.pass_id as string, [...(scopesByPass.get(scope.pass_id as string) ?? []), scope.team_id as string]);
    }
  }

  return {
    profileStatus: (profile?.status as ProfileStatus | undefined) ?? null,
    familyIds,
    passes: passes.map(
      (pass): FamilyMediaPassGrant => ({
        id: pass.id,
        familyId: pass.family_id,
        status: pass.status,
        startsOn: pass.starts_on,
        endsOn: pass.ends_on,
        allowPhotos: pass.allow_photos,
        allowTrainingVideos: pass.allow_training_videos,
        allowLiveMatches: pass.allow_live_matches,
        teamIds: scopesByPass.get(pass.id) ?? []
      })
    )
  };
}

export async function authorizeFamilyMediaAccess(input: {
  profileId: string;
  right: FamilyMediaRight;
  teamId: string;
  now?: Date;
}): Promise<FamilyMediaAccessDecision> {
  const snapshot = await loadFamilyMediaAccessSnapshot(input.profileId);
  return evaluateFamilyMediaAccess(snapshot, {
    right: input.right,
    teamId: input.teamId,
    dateKey: familyMediaDateKey(input.now)
  });
}

export async function getFamilyMediaPassOverview(profileId: string): Promise<FamilyMediaPassOverview[]> {
  const snapshot = await loadFamilyMediaAccessSnapshot(profileId);
  const familyIds = new Set(snapshot.familyIds);
  const passes = snapshot.passes.filter((pass) => familyIds.has(pass.familyId));
  const teamIds = Array.from(new Set(passes.flatMap((pass) => pass.teamIds)));
  const teamNames = new Map<string, string>();

  if (teamIds.length > 0) {
    const { data, error } = await getSupabaseAdminClient().from("teams").select("id,name").in("id", teamIds).is("deleted_at", null);
    if (error) throw new Error(`Unable to fetch family media pass team names: ${error.message}`);
    for (const team of data ?? []) teamNames.set(team.id as string, team.name as string);
  }

  return passes.map((pass) => ({
    id: pass.id,
    status: pass.status,
    startsOn: pass.startsOn,
    endsOn: pass.endsOn,
    allowPhotos: pass.allowPhotos,
    allowTrainingVideos: pass.allowTrainingVideos,
    allowLiveMatches: pass.allowLiveMatches,
    teamNames: pass.teamIds.map((teamId) => teamNames.get(teamId)).filter((name): name is string => Boolean(name))
  }));
}

function hasCurrentPass(snapshot: FamilyMediaAccessSnapshot, dateKey: string): boolean {
  const familyIds = new Set(snapshot.familyIds);
  return (
    snapshot.profileStatus === "ACTIVE" &&
    snapshot.passes.some(
      (pass) =>
        familyIds.has(pass.familyId) &&
        pass.status === "ACTIVE" &&
        pass.startsOn <= dateKey &&
        pass.endsOn >= dateKey
    )
  );
}

export async function listAuthorizedFamilyMedia(
  profileId: string,
  options: { limit?: number; now?: Date } = {}
): Promise<{ authorized: boolean; assets: FamilyMediaSummary[] }> {
  const snapshot = await loadFamilyMediaAccessSnapshot(profileId);
  const dateKey = familyMediaDateKey(options.now);
  if (!hasCurrentPass(snapshot, dateKey)) return { authorized: false, assets: [] };

  const teamIds = Array.from(new Set(snapshot.passes.flatMap((pass) => pass.teamIds)));
  if (teamIds.length === 0) return { authorized: false, assets: [] };

  const now = options.now ?? new Date();
  const nowIso = now.toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("media_assets")
    .select("id,team_id,type,content_kind,playback_kind,title,thumbnail_url,alt_text,is_live,starts_at,ends_at,published_at")
    .eq("access_level", "FAMILY_PASS")
    .eq("status", "PUBLISHED")
    .in("team_id", teamIds)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false })
    .limit(Math.min(Math.max(options.limit ?? 100, 1), 200));

  if (error) throw new Error(`Unable to fetch authorized family media: ${error.message}`);

  const assets = (data ?? []) as Array<Omit<FamilyMediaSummary, "access_path">>;
  return {
    authorized: true,
    assets: assets
      .filter((asset) => {
        if (
          (asset.starts_at !== null && Date.parse(asset.starts_at) > now.getTime()) ||
          (asset.ends_at !== null && Date.parse(asset.ends_at) <= now.getTime())
        ) {
          return false;
        }
        const right = requiredRightForMedia(asset);
        return Boolean(
          right &&
            asset.team_id &&
            evaluateFamilyMediaAccess(snapshot, { right, teamId: asset.team_id, dateKey }).ok
        );
      })
      .map((asset) => ({ ...asset, access_path: `/api/family/media/${asset.id}/access` }))
  };
}

export async function getAuthorizedPremiumMedia(
  profileId: string,
  mediaId: string,
  now = new Date()
): Promise<{ decision: FamilyMediaAccessDecision; asset: PremiumMediaAsset | null }> {
  const { data, error } = await getSupabaseAdminClient()
    .from("media_assets")
    .select("*")
    .eq("id", mediaId)
    .eq("access_level", "FAMILY_PASS")
    .eq("status", "PUBLISHED")
    .not("published_at", "is", null)
    .lte("published_at", now.toISOString())
    .maybeSingle();

  if (error) throw new Error(`Unable to fetch premium media: ${error.message}`);
  if (!data) return { decision: { ok: false, reason: "RIGHT_DENIED" }, asset: null };

  const asset = data as PremiumMediaAsset;
  const right = requiredRightForMedia(asset);
  if (!right || !asset.team_id) return { decision: { ok: false, reason: "RIGHT_DENIED" }, asset: null };

  if (
    (asset.starts_at !== null && Date.parse(asset.starts_at) > now.getTime()) ||
    (asset.ends_at !== null && Date.parse(asset.ends_at) <= now.getTime())
  ) {
    return { decision: { ok: false, reason: "NO_ACTIVE_PASS" }, asset: null };
  }

  const decision = await authorizeFamilyMediaAccess({ profileId, right, teamId: asset.team_id, now });
  return { decision, asset: decision.ok ? asset : null };
}

export async function getAuthorizedLiveMatch(
  profileId: string,
  matchId: string,
  now = new Date()
): Promise<{ decision: FamilyMediaAccessDecision; followUrl: string | null }> {
  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .select("team_id,follow_url,status,access_level")
    .eq("id", matchId)
    .eq("access_level", "FAMILY_PASS")
    .eq("status", "LIVE")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(`Unable to fetch premium live match: ${error.message}`);
  if (!data?.team_id || !data.follow_url) return { decision: { ok: false, reason: "RIGHT_DENIED" }, followUrl: null };

  const decision = await authorizeFamilyMediaAccess({ profileId, right: "LIVE_MATCHES", teamId: data.team_id as string, now });
  return { decision, followUrl: decision.ok ? (data.follow_url as string) : null };
}
