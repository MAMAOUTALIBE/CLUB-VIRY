import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Family, FamilyMember, Player, Profile } from "@/lib/db/types";

export type FamilyDashboard = {
  families: Family[];
  members: FamilyMember[];
  players: Player[];
};

export type CreatePlayerInput = {
  familyId: string;
  createdBy: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Player["gender"];
  categoryId?: string | null;
};

export async function getFamilyDashboard(profileId: string): Promise<FamilyDashboard> {
  const supabase = getSupabaseAdminClient();

  const { data: members, error: membersError } = await supabase
    .from("family_members")
    .select("*")
    .eq("profile_id", profileId);

  if (membersError) {
    throw new Error(`Unable to fetch family members: ${membersError.message}`);
  }

  const familyIds = (members ?? []).map((member) => member.family_id as string);

  if (familyIds.length === 0) {
    return { families: [], members: [], players: [] };
  }

  const [{ data: families, error: familiesError }, { data: players, error: playersError }] = await Promise.all([
    supabase.from("families").select("*").in("id", familyIds).order("created_at", { ascending: true }),
    supabase.from("players").select("*").in("family_id", familyIds).order("created_at", { ascending: true })
  ]);

  if (familiesError) {
    throw new Error(`Unable to fetch families: ${familiesError.message}`);
  }

  if (playersError) {
    throw new Error(`Unable to fetch players: ${playersError.message}`);
  }

  return {
    families: (families ?? []) as Family[],
    members: (members ?? []) as FamilyMember[],
    players: (players ?? []) as Player[]
  };
}

export async function isProfileFamilyMember(profileId: string, familyId: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("profile_id", profileId)
    .eq("family_id", familyId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to verify family membership: ${error.message}`);
  }

  return Boolean(data);
}

export async function createFamilyForProfile(profile: Profile | null, profileId: string, fallbackEmail?: string): Promise<Family> {
  const supabase = getSupabaseAdminClient();
  const nameSource = profile?.last_name || profile?.display_name || fallbackEmail || "Membre";
  const familyName = `Famille ${nameSource}`;

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({
      name: familyName,
      primary_contact_id: profileId
    })
    .select("*")
    .single();

  if (familyError) {
    throw new Error(`Unable to create family: ${familyError.message}`);
  }

  const { error: memberError } = await supabase.from("family_members").insert({
    family_id: family.id,
    profile_id: profileId,
    relationship: "PARENT",
    is_primary_contact: true
  });

  if (memberError) {
    throw new Error(`Unable to create family member: ${memberError.message}`);
  }

  return family as Family;
}

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("players")
    .insert({
      family_id: input.familyId,
      created_by: input.createdBy,
      first_name: input.firstName,
      last_name: input.lastName,
      birth_date: input.birthDate,
      gender: input.gender,
      category_id: input.categoryId ?? null
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create player: ${error.message}`);
  }

  return data as Player;
}
