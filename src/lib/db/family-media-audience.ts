import "server-only";

import { familyMediaDateKey } from "@/lib/family-media-entitlement";
import { countDistinctActiveAudienceFamilies } from "@/lib/family-media-audience";
import type { FamilyMediaAudiencePreviewPayload } from "@/lib/api/validation";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

const RIGHT_COLUMN = {
  PHOTOS: "allow_photos",
  TRAINING_VIDEOS: "allow_training_videos",
  LIVE_MATCHES: "allow_live_matches"
} as const;

export async function countCurrentFamilyMediaAudience(
  input: FamilyMediaAudiencePreviewPayload,
  now = new Date()
): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { data: scopes, error: scopesError } = await supabase
    .from("family_media_pass_teams")
    .select("pass_id")
    .eq("team_id", input.teamId);
  if (scopesError) throw new Error(`Unable to fetch media audience scopes: ${scopesError.message}`);

  const passIds = Array.from(new Set((scopes ?? []).map((scope) => scope.pass_id as string)));
  if (passIds.length === 0) return 0;

  const dateKey = familyMediaDateKey(now);
  const { data: passes, error: passesError } = await supabase
    .from("family_media_passes")
    .select("family_id")
    .in("id", passIds)
    .eq("status", "ACTIVE")
    .lte("starts_on", dateKey)
    .gte("ends_on", dateKey)
    .eq(RIGHT_COLUMN[input.right], true);
  if (passesError) throw new Error(`Unable to fetch media audience passes: ${passesError.message}`);

  const candidateFamilyIds = Array.from(new Set((passes ?? []).map((pass) => pass.family_id as string)));
  if (candidateFamilyIds.length === 0) return 0;

  const { data: families, error: familiesError } = await supabase
    .from("families")
    .select("id")
    .in("id", candidateFamilyIds)
    .is("deleted_at", null);
  if (familiesError) throw new Error(`Unable to fetch media audience families: ${familiesError.message}`);

  const activeFamilyIds = (families ?? []).map((family) => family.id as string);
  if (activeFamilyIds.length === 0) return 0;

  const { data: members, error: membersError } = await supabase
    .from("family_members")
    .select("family_id,profile_id")
    .in("family_id", activeFamilyIds);
  if (membersError) throw new Error(`Unable to fetch media audience members: ${membersError.message}`);

  const profileIds = Array.from(new Set((members ?? []).map((member) => member.profile_id as string)));
  if (profileIds.length === 0) return 0;

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .in("id", profileIds)
    .eq("status", "ACTIVE");
  if (profilesError) throw new Error(`Unable to fetch media audience profiles: ${profilesError.message}`);

  return countDistinctActiveAudienceFamilies(
    (members ?? []).map((member) => ({
      familyId: member.family_id as string,
      profileId: member.profile_id as string
    })),
    (profiles ?? []).map((profile) => profile.id as string)
  );
}
