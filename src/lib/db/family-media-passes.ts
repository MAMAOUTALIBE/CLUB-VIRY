import "server-only";

import type { AdminFamilyMediaPassBulkPayload, AdminFamilyMediaPassPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { FamilyMediaPass, FamilyMediaPassStatus, Team } from "@/lib/db/types";

export type AdminFamilyMediaPass = FamilyMediaPass & {
  family_name: string;
  season_name: string;
  teams: Team[];
};

type FamilyMediaPassWriteInput = {
  familyId: string;
  seasonId: string;
  status: FamilyMediaPassStatus;
  startsOn: string;
  endsOn: string;
  allowPhotos: boolean;
  allowTrainingVideos: boolean;
  allowLiveMatches: boolean;
  teamIds: string[];
  reviewNote: string | null;
};

async function hydratePasses(rows: FamilyMediaPass[]): Promise<AdminFamilyMediaPass[]> {
  if (rows.length === 0) return [];

  const supabase = getSupabaseAdminClient();
  const familyIds = Array.from(new Set(rows.map((row) => row.family_id)));
  const seasonIds = Array.from(new Set(rows.map((row) => row.season_id)));
  const passIds = rows.map((row) => row.id);

  const [familiesResult, seasonsResult, scopesResult] = await Promise.all([
    supabase.from("families").select("id,name").in("id", familyIds),
    supabase.from("seasons").select("id,name").in("id", seasonIds),
    supabase.from("family_media_pass_teams").select("pass_id,team_id").in("pass_id", passIds)
  ]);

  if (familiesResult.error) throw new Error(`Unable to fetch media pass families: ${familiesResult.error.message}`);
  if (seasonsResult.error) throw new Error(`Unable to fetch media pass seasons: ${seasonsResult.error.message}`);
  if (scopesResult.error) throw new Error(`Unable to fetch media pass team scopes: ${scopesResult.error.message}`);

  const scopes = (scopesResult.data ?? []) as Array<{ pass_id: string; team_id: string }>;
  const teamIds = Array.from(new Set(scopes.map((scope) => scope.team_id)));
  let teams: Team[] = [];

  if (teamIds.length > 0) {
    const { data, error } = await supabase.from("teams").select("*").in("id", teamIds);
    if (error) throw new Error(`Unable to fetch media pass teams: ${error.message}`);
    teams = (data ?? []) as Team[];
  }

  const familyNames = new Map((familiesResult.data ?? []).map((family) => [family.id as string, family.name as string]));
  const seasonNames = new Map((seasonsResult.data ?? []).map((season) => [season.id as string, season.name as string]));
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const teamIdsByPass = new Map<string, string[]>();

  for (const scope of scopes) {
    teamIdsByPass.set(scope.pass_id, [...(teamIdsByPass.get(scope.pass_id) ?? []), scope.team_id]);
  }

  return rows.map((row) => ({
    ...row,
    family_name: familyNames.get(row.family_id) ?? "Famille inconnue",
    season_name: seasonNames.get(row.season_id) ?? "Saison inconnue",
    teams: (teamIdsByPass.get(row.id) ?? []).map((teamId) => teamsById.get(teamId)).filter((team): team is Team => Boolean(team))
  }));
}

export async function listFamilyMediaPassesForAdmin(limit = 200): Promise<AdminFamilyMediaPass[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("family_media_passes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Unable to fetch family media passes: ${error.message}`);
  return hydratePasses((data ?? []) as FamilyMediaPass[]);
}

export async function listFamilyMediaPassesForFamilyAdmin(familyId: string): Promise<AdminFamilyMediaPass[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("family_media_passes")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to fetch family media passes: ${error.message}`);
  return hydratePasses((data ?? []) as FamilyMediaPass[]);
}

export async function getFamilyMediaPassForAdmin(id: string): Promise<AdminFamilyMediaPass | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("family_media_passes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Unable to fetch family media pass: ${error.message}`);
  if (!data) return null;

  const [pass] = await hydratePasses([data as FamilyMediaPass]);
  return pass ?? null;
}

async function saveFamilyMediaPass(id: string | null, input: FamilyMediaPassWriteInput, actorId: string): Promise<AdminFamilyMediaPass> {
  const { data, error } = await getSupabaseAdminClient().rpc("save_family_media_pass", {
    p_id: id,
    p_family_id: input.familyId,
    p_season_id: input.seasonId,
    p_status: input.status,
    p_starts_on: input.startsOn,
    p_ends_on: input.endsOn,
    p_allow_photos: input.allowPhotos,
    p_allow_training_videos: input.allowTrainingVideos,
    p_allow_live_matches: input.allowLiveMatches,
    p_team_ids: input.teamIds,
    p_review_note: input.reviewNote,
    p_actor_id: actorId
  });

  if (error) throw new Error(`Unable to save family media pass: ${error.message}`);

  const saved = await getFamilyMediaPassForAdmin(data as string);
  if (!saved) throw new Error("Unable to load the saved family media pass.");
  return saved;
}

export async function createFamilyMediaPass(input: AdminFamilyMediaPassPayload, actorId: string): Promise<AdminFamilyMediaPass> {
  return saveFamilyMediaPass(
    null,
    {
      familyId: input.familyId!,
      seasonId: input.seasonId!,
      status: input.status ?? "PENDING_REVIEW",
      startsOn: input.startsOn!,
      endsOn: input.endsOn!,
      allowPhotos: input.allowPhotos ?? false,
      allowTrainingVideos: input.allowTrainingVideos ?? false,
      allowLiveMatches: input.allowLiveMatches ?? false,
      teamIds: input.teamIds!,
      reviewNote: input.reviewNote ?? null
    },
    actorId
  );
}

export async function updateFamilyMediaPass(
  id: string,
  input: AdminFamilyMediaPassPayload,
  actorId: string
): Promise<AdminFamilyMediaPass | null> {
  const current = await getFamilyMediaPassForAdmin(id);
  if (!current) return null;

  return saveFamilyMediaPass(
    id,
    {
      familyId: input.familyId ?? current.family_id,
      seasonId: input.seasonId ?? current.season_id,
      status: input.status ?? current.status,
      startsOn: input.startsOn ?? current.starts_on,
      endsOn: input.endsOn ?? current.ends_on,
      allowPhotos: input.allowPhotos ?? current.allow_photos,
      allowTrainingVideos: input.allowTrainingVideos ?? current.allow_training_videos,
      allowLiveMatches: input.allowLiveMatches ?? current.allow_live_matches,
      teamIds: input.teamIds ?? current.teams.map((team) => team.id),
      reviewNote: input.reviewNote !== undefined ? input.reviewNote : current.review_note
    },
    actorId
  );
}

export type BulkFamilyMediaPassStatusResult = {
  succeeded: string[];
  failed: Array<{ id: string; reason: "NOT_FOUND" }>;
};

export async function bulkUpdateFamilyMediaPassStatus(
  ids: string[],
  status: AdminFamilyMediaPassBulkPayload["status"],
  actorId: string
): Promise<BulkFamilyMediaPassStatusResult> {
  const reviewed = status === "ACTIVE";
  const { data, error } = await getSupabaseAdminClient()
    .from("family_media_passes")
    .update({
      status,
      updated_by: actorId,
      ...(reviewed ? { reviewed_by: actorId, reviewed_at: new Date().toISOString() } : {})
    })
    .in("id", ids)
    .select("id");

  if (error) throw new Error(`Unable to bulk update family media passes: ${error.message}`);

  const updatedIds = new Set((data ?? []).map((row) => row.id as string));
  return {
    succeeded: ids.filter((id) => updatedIds.has(id)),
    failed: ids.filter((id) => !updatedIds.has(id)).map((id) => ({ id, reason: "NOT_FOUND" as const }))
  };
}
