import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Family, FamilyMember, Payment, Player, Profile, Registration, RegistrationDocument } from "@/lib/db/types";

export type FamilyDashboard = {
  families: Family[];
  members: FamilyMember[];
  players: Player[];
};

export type AdminFamiliesPayload = {
  families: Family[];
  members: FamilyMember[];
  players: Player[];
};

export type AdminPlayersPayload = {
  players: Player[];
};

export type AdminFamilyDetail = {
  family: Family;
  members: FamilyMember[];
  players: Player[];
  registrations: Registration[];
  documents: RegistrationDocument[];
  payments: Payment[];
};

export type AdminPlayerDetail = {
  player: Player;
  family: Family | null;
  registrations: Registration[];
  documents: RegistrationDocument[];
  payments: Payment[];
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

export async function listFamiliesForAdmin(limit = 100): Promise<AdminFamiliesPayload> {
  const supabase = getSupabaseAdminClient();
  const { data: families, error: familiesError } = await supabase
    .from("families")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (familiesError) {
    throw new Error(`Unable to fetch admin families: ${familiesError.message}`);
  }

  const familyRows = (families ?? []) as Family[];
  const familyIds = familyRows.map((family) => family.id);

  if (familyIds.length === 0) {
    return { families: [], members: [], players: [] };
  }

  const [{ data: members, error: membersError }, { data: players, error: playersError }] = await Promise.all([
    supabase.from("family_members").select("*").in("family_id", familyIds).order("created_at", { ascending: false }),
    supabase.from("players").select("*").in("family_id", familyIds).order("created_at", { ascending: false })
  ]);

  if (membersError) {
    throw new Error(`Unable to fetch admin family members: ${membersError.message}`);
  }

  if (playersError) {
    throw new Error(`Unable to fetch admin family players: ${playersError.message}`);
  }

  return {
    families: familyRows,
    members: (members ?? []) as FamilyMember[],
    players: (players ?? []) as Player[]
  };
}

export async function listPlayersForAdmin(limit = 100): Promise<AdminPlayersPayload> {
  const { data, error } = await getSupabaseAdminClient()
    .from("players")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin players: ${error.message}`);
  }

  return {
    players: (data ?? []) as Player[]
  };
}

export async function getFamilyDetailForAdmin(familyId: string): Promise<AdminFamilyDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("*")
    .eq("id", familyId)
    .maybeSingle();

  if (familyError) {
    throw new Error(`Unable to fetch admin family detail: ${familyError.message}`);
  }

  if (!family) {
    return null;
  }

  const [
    { data: members, error: membersError },
    { data: players, error: playersError },
    { data: registrations, error: registrationsError }
  ] = await Promise.all([
    supabase.from("family_members").select("*").eq("family_id", familyId).order("created_at", { ascending: false }),
    supabase.from("players").select("*").eq("family_id", familyId).order("created_at", { ascending: false }),
    supabase.from("registrations").select("*").eq("family_id", familyId).order("created_at", { ascending: false })
  ]);

  if (membersError) {
    throw new Error(`Unable to fetch admin family members: ${membersError.message}`);
  }

  if (playersError) {
    throw new Error(`Unable to fetch admin family players: ${playersError.message}`);
  }

  if (registrationsError) {
    throw new Error(`Unable to fetch admin family registrations: ${registrationsError.message}`);
  }

  const registrationRows = (registrations ?? []) as Registration[];
  const registrationIds = registrationRows.map((registration) => registration.id);
  let documents: RegistrationDocument[] = [];
  let payments: Payment[] = [];

  if (registrationIds.length > 0) {
    const [{ data: documentRows, error: documentsError }, { data: paymentRows, error: paymentsError }] = await Promise.all([
      supabase.from("registration_documents").select("*").in("registration_id", registrationIds).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").in("registration_id", registrationIds).order("created_at", { ascending: false })
    ]);

    if (documentsError) {
      throw new Error(`Unable to fetch admin family documents: ${documentsError.message}`);
    }

    if (paymentsError) {
      throw new Error(`Unable to fetch admin family payments: ${paymentsError.message}`);
    }

    documents = (documentRows ?? []) as RegistrationDocument[];
    payments = (paymentRows ?? []) as Payment[];
  }

  return {
    family: family as Family,
    members: (members ?? []) as FamilyMember[],
    players: (players ?? []) as Player[],
    registrations: registrationRows,
    documents,
    payments
  };
}

export async function getPlayerDetailForAdmin(playerId: string): Promise<AdminPlayerDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .maybeSingle();

  if (playerError) {
    throw new Error(`Unable to fetch admin player detail: ${playerError.message}`);
  }

  if (!player) {
    return null;
  }

  const [{ data: family, error: familyError }, { data: registrations, error: registrationsError }] = await Promise.all([
    player.family_id ? supabase.from("families").select("*").eq("id", player.family_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("registrations").select("*").eq("player_id", playerId).order("created_at", { ascending: false })
  ]);

  if (familyError) {
    throw new Error(`Unable to fetch admin player family: ${familyError.message}`);
  }

  if (registrationsError) {
    throw new Error(`Unable to fetch admin player registrations: ${registrationsError.message}`);
  }

  const registrationRows = (registrations ?? []) as Registration[];
  const registrationIds = registrationRows.map((registration) => registration.id);
  let documents: RegistrationDocument[] = [];
  let payments: Payment[] = [];

  if (registrationIds.length > 0) {
    const [{ data: documentRows, error: documentsError }, { data: paymentRows, error: paymentsError }] = await Promise.all([
      supabase.from("registration_documents").select("*").in("registration_id", registrationIds).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").in("registration_id", registrationIds).order("created_at", { ascending: false })
    ]);

    if (documentsError) {
      throw new Error(`Unable to fetch admin player documents: ${documentsError.message}`);
    }

    if (paymentsError) {
      throw new Error(`Unable to fetch admin player payments: ${paymentsError.message}`);
    }

    documents = (documentRows ?? []) as RegistrationDocument[];
    payments = (paymentRows ?? []) as Payment[];
  }

  return {
    player: player as Player,
    family: family as Family | null,
    registrations: registrationRows,
    documents,
    payments
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
    // Compensation : éviter une famille orpheline (sans membre) qui rendrait
    // isProfileFamilyMember=false et verrouillerait le parcours d'inscription.
    await supabase.from("families").delete().eq("id", family.id);
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
