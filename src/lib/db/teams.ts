import "server-only";

import type { AdminMatchPayload, AdminTeamPayload, AdminTeamPlayerPayload, AdminTeamStaffPayload } from "@/lib/api/validation";
import { hasPermission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/auth/roles";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Match, Player, Team, TeamPlayer, TeamStaff } from "@/lib/db/types";

/**
 * Un membre du staff ne peut etre rattache qu'a un compte EXISTANT capable
 * d'acceder a l'espace educateur (role avec educator:manage_own_teams ou teams:manage).
 * Garde-fou serveur : l'isolation educateur repose sur team_staff.profile_id.
 */
export async function isLinkableEducatorProfile(profileId: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient().from("profiles").select("role").eq("id", profileId).maybeSingle();

  if (error) {
    throw new Error(`Unable to verify staff profile: ${error.message}`);
  }

  if (!data) {
    return false;
  }

  const role = (data as { role: AppRole }).role;
  return hasPermission(role, "educator:manage_own_teams") || hasPermission(role, "teams:manage");
}

export type TeamDetail = {
  team: Team;
  staff: TeamStaff[];
  matches: Match[];
};

export type TeamRoster = TeamDetail & {
  players: Array<{
    assignment: TeamPlayer;
    player: Player | null;
  }>;
};

function matchPayloadToRow(input: AdminMatchPayload) {
  return {
    ...(input.teamId !== undefined ? { team_id: input.teamId ?? null } : {}),
    ...(input.seasonId !== undefined ? { season_id: input.seasonId ?? null } : {}),
    ...(input.opponentName ? { opponent_name: input.opponentName } : {}),
    ...(input.opponentLogoUrl !== undefined ? { opponent_logo_url: input.opponentLogoUrl ?? null } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.startsAt ? { starts_at: input.startsAt } : {}),
    ...(input.venue !== undefined ? { venue: input.venue ?? null } : {}),
    ...(input.competition !== undefined ? { competition: input.competition ?? null } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.homeScore !== undefined ? { home_score: input.homeScore } : {}),
    ...(input.awayScore !== undefined ? { away_score: input.awayScore } : {}),
    ...(input.notes !== undefined ? { notes: input.notes ?? null } : {})
  };
}

function slugifyTeamName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function teamPayloadToRow(input: AdminTeamPayload) {
  return {
    ...(input.seasonId !== undefined ? { season_id: input.seasonId ?? null } : {}),
    ...(input.categoryId !== undefined ? { category_id: input.categoryId ?? null } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.level !== undefined ? { level: input.level ?? null } : {}),
    ...(input.ageRange !== undefined ? { age_range: input.ageRange ?? null } : {}),
    ...(input.gender ? { gender: input.gender } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.coverImageUrl !== undefined ? { cover_image_url: input.coverImageUrl ?? null } : {}),
    ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {})
  };
}

function teamStaffPayloadToRow(teamId: string, input: AdminTeamStaffPayload) {
  return {
    team_id: teamId,
    ...(input.profileId !== undefined ? { profile_id: input.profileId ?? null } : {}),
    display_name: input.displayName,
    role_title: input.roleTitle,
    is_head_coach: input.isHeadCoach ?? false
  };
}

function teamPlayerPayloadToRow(teamId: string, input: AdminTeamPlayerPayload) {
  return {
    team_id: teamId,
    player_id: input.playerId,
    ...(input.position !== undefined ? { position: input.position ?? null } : {}),
    ...(input.shirtNumber !== undefined ? { shirt_number: input.shirtNumber } : {})
  };
}

export async function listTeams(): Promise<Team[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("teams")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch teams: ${error.message}`);
  }

  return (data ?? []) as Team[];
}

export async function listTeamsForAdmin(limit = 100): Promise<Team[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("teams")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch admin teams: ${error.message}`);
  }

  return (data ?? []) as Team[];
}

export async function getTeamBySlug(slug: string): Promise<TeamDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("slug", slug).maybeSingle();

  if (teamError) {
    throw new Error(`Unable to fetch team: ${teamError.message}`);
  }

  if (!team) {
    return null;
  }

  const [{ data: staff, error: staffError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase.from("team_staff").select("*").eq("team_id", team.id).order("is_head_coach", { ascending: false }),
    supabase.from("matches").select("*").eq("team_id", team.id).order("starts_at", { ascending: true })
  ]);

  if (staffError) {
    throw new Error(`Unable to fetch team staff: ${staffError.message}`);
  }

  if (matchesError) {
    throw new Error(`Unable to fetch team matches: ${matchesError.message}`);
  }

  return {
    team: team as Team,
    staff: (staff ?? []) as TeamStaff[],
    matches: (matches ?? []) as Match[]
  };
}

export async function listMatches(limit = 20): Promise<Match[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .select("*")
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch matches: ${error.message}`);
  }

  return (data ?? []) as Match[];
}

export async function createTeam(input: AdminTeamPayload): Promise<Team> {
  const { data, error } = await getSupabaseAdminClient()
    .from("teams")
    .insert({
      ...teamPayloadToRow(input),
      slug: input.slug ?? slugifyTeamName(input.name as string),
      gender: input.gender ?? "MIXTE",
      is_active: input.isActive ?? true
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create team: ${error.message}`);
  }

  return data as Team;
}

export async function updateTeam(id: string, input: AdminTeamPayload): Promise<Team> {
  const { data, error } = await getSupabaseAdminClient().from("teams").update(teamPayloadToRow(input)).eq("id", id).select("*").single();

  if (error) {
    throw new Error(`Unable to update team: ${error.message}`);
  }

  return data as Team;
}

export async function addTeamStaff(teamId: string, input: AdminTeamStaffPayload): Promise<TeamStaff> {
  const { data, error } = await getSupabaseAdminClient().from("team_staff").insert(teamStaffPayloadToRow(teamId, input)).select("*").single();

  if (error) {
    throw new Error(`Unable to add team staff: ${error.message}`);
  }

  return data as TeamStaff;
}

export async function assignTeamPlayer(teamId: string, input: AdminTeamPlayerPayload): Promise<TeamPlayer> {
  const { data, error } = await getSupabaseAdminClient()
    .from("team_players")
    .upsert(teamPlayerPayloadToRow(teamId, input), { onConflict: "team_id,player_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to assign team player: ${error.message}`);
  }

  return data as TeamPlayer;
}

/** Retire un joueur d'une équipe (clé composite team_id + player_id, pas d'id de ligne). */
export async function removeTeamPlayer(teamId: string, playerId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("team_players")
    .delete()
    .eq("team_id", teamId)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(`Unable to remove team player: ${error.message}`);
  }
}

export type AssignablePlayer = { id: string; first_name: string; last_name: string; birth_date: string | null };

/**
 * Liste PII-minimisee des joueurs du club, pour le selecteur d'affectation cote educateur.
 * Ne projette QUE id + prenom + nom + date de naissance (la route convertit en annee) :
 * jamais license_number / medical_notes / family_id / profile_id.
 */
export async function listAssignablePlayers(limit = 500): Promise<AssignablePlayer[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("players")
    .select("id, first_name, last_name, birth_date")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch assignable players: ${error.message}`);
  }

  return (data ?? []) as AssignablePlayer[];
}

/** Affecte un joueur a une equipe SI l'educateur gere cette equipe (sinon null). */
export async function assignTeamPlayerForEducator(
  teamId: string,
  profileId: string,
  canManageAllTeams: boolean,
  input: AdminTeamPlayerPayload
): Promise<TeamPlayer | null> {
  const allowed = await canManageTeam(teamId, profileId, canManageAllTeams);

  if (!allowed) {
    return null;
  }

  return assignTeamPlayer(teamId, input);
}

/** Retire un joueur d'une equipe SI l'educateur gere cette equipe (renvoie false sinon). */
export async function removeTeamPlayerForEducator(
  teamId: string,
  profileId: string,
  canManageAllTeams: boolean,
  playerId: string
): Promise<boolean> {
  const allowed = await canManageTeam(teamId, profileId, canManageAllTeams);

  if (!allowed) {
    return false;
  }

  await removeTeamPlayer(teamId, playerId);
  return true;
}

/** Met à jour un membre du staff (identifié par son id propre). */
export async function updateTeamStaff(staffId: string, input: AdminTeamStaffPayload): Promise<TeamStaff> {
  const { data, error } = await getSupabaseAdminClient()
    .from("team_staff")
    .update({
      ...(input.profileId !== undefined ? { profile_id: input.profileId ?? null } : {}),
      display_name: input.displayName,
      role_title: input.roleTitle,
      is_head_coach: input.isHeadCoach ?? false
    })
    .eq("id", staffId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update team staff: ${error.message}`);
  }

  return data as TeamStaff;
}

/** Supprime un membre du staff. */
export async function removeTeamStaff(staffId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient().from("team_staff").delete().eq("id", staffId);

  if (error) {
    throw new Error(`Unable to remove team staff: ${error.message}`);
  }
}

/**
 * Roster public d'une équipe par slug — SANS contrôle d'accès éducateur.
 * Ne projette QUE des champs joueurs non sensibles (jamais license/medical/birth_date/family),
 * conformément à la protection PII : seuls prénom + nom servent à l'affichage public tronqué.
 */
export async function getPublicTeamRosterBySlug(slug: string): Promise<TeamRoster | null> {
  const supabase = getSupabaseAdminClient();
  // Cohérence de visibilité : une équipe désactivée (absente du listing) ne doit pas
  // rester consultable par URL directe — même filtre is_active que listTeams().
  const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();

  if (teamError) {
    throw new Error(`Unable to fetch public team: ${teamError.message}`);
  }

  if (!team) {
    return null;
  }

  const [{ data: staff, error: staffError }, { data: matches, error: matchesError }, { data: assignments, error: assignmentsError }] =
    await Promise.all([
      supabase.from("team_staff").select("*").eq("team_id", team.id).order("is_head_coach", { ascending: false }),
      supabase.from("matches").select("*").eq("team_id", team.id).order("starts_at", { ascending: true }),
      supabase
        .from("team_players")
        .select("*")
        .eq("team_id", team.id)
        .order("shirt_number", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
    ]);

  if (staffError) {
    throw new Error(`Unable to fetch public roster staff: ${staffError.message}`);
  }

  if (matchesError) {
    throw new Error(`Unable to fetch public roster matches: ${matchesError.message}`);
  }

  if (assignmentsError) {
    throw new Error(`Unable to fetch public roster players: ${assignmentsError.message}`);
  }

  const rosterAssignments = (assignments ?? []) as TeamPlayer[];
  const playerIds = rosterAssignments.map((assignment) => assignment.player_id);
  const { data: players, error: playersError } =
    playerIds.length > 0
      ? await supabase.from("players").select("id, first_name, last_name").in("id", playerIds)
      : { data: [], error: null };

  if (playersError) {
    throw new Error(`Unable to fetch public players: ${playersError.message}`);
  }

  const playerById = new Map((players ?? []).map((player) => [player.id as string, player as Player]));

  return {
    team: team as Team,
    staff: (staff ?? []) as TeamStaff[],
    matches: (matches ?? []) as Match[],
    players: rosterAssignments.map((assignment) => ({
      assignment,
      player: playerById.get(assignment.player_id) ?? null
    }))
  };
}

async function isTeamStaffMember(teamId: string, profileId: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdminClient()
    .from("team_staff")
    .select("id")
    .eq("team_id", teamId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to verify team staff access: ${error.message}`);
  }

  return Boolean(data);
}

export async function canManageTeam(teamId: string | null, profileId: string, canManageAllTeams: boolean): Promise<boolean> {
  if (!teamId) {
    return canManageAllTeams;
  }

  if (canManageAllTeams) {
    return true;
  }

  return isTeamStaffMember(teamId, profileId);
}

async function getTeamsByIds(teamIds: string[]): Promise<Team[]> {
  if (teamIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("teams")
    .select("*")
    .in("id", teamIds)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch educator teams: ${error.message}`);
  }

  return (data ?? []) as Team[];
}

async function getTeamStaffByTeamIds(teamIds: string[]): Promise<TeamStaff[]> {
  if (teamIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("team_staff")
    .select("*")
    .in("team_id", teamIds)
    .order("is_head_coach", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch educator team staff: ${error.message}`);
  }

  return (data ?? []) as TeamStaff[];
}

async function getTeamMatchesByTeamIds(teamIds: string[]): Promise<Match[]> {
  if (teamIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .select("*")
    .in("team_id", teamIds)
    .order("starts_at", { ascending: true })
    .limit(100);

  if (error) {
    throw new Error(`Unable to fetch educator team matches: ${error.message}`);
  }

  return (data ?? []) as Match[];
}

export async function listTeamsForEducator(profileId: string, canManageAllTeams: boolean): Promise<TeamDetail[]> {
  const teams = canManageAllTeams
    ? await listTeams()
    : await (async () => {
        const { data, error } = await getSupabaseAdminClient()
          .from("team_staff")
          .select("team_id")
          .eq("profile_id", profileId);

        if (error) {
          throw new Error(`Unable to fetch educator staff teams: ${error.message}`);
        }

        const teamIds = Array.from(new Set((data ?? []).map((row) => row.team_id).filter(Boolean)));
        return getTeamsByIds(teamIds);
      })();

  const teamIds = teams.map((team) => team.id);
  const [staff, matches] = await Promise.all([getTeamStaffByTeamIds(teamIds), getTeamMatchesByTeamIds(teamIds)]);

  return teams.map((team) => ({
    team,
    staff: staff.filter((staffMember) => staffMember.team_id === team.id),
    matches: matches.filter((match) => match.team_id === team.id)
  }));
}

export async function getEducatorTeamRoster(
  teamId: string,
  profileId: string,
  canManageAllTeams: boolean
): Promise<TeamRoster | null> {
  const allowed = await canManageTeam(teamId, profileId, canManageAllTeams);

  if (!allowed) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data: team, error: teamError } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();

  if (teamError) {
    throw new Error(`Unable to fetch educator team: ${teamError.message}`);
  }

  if (!team) {
    return null;
  }

  const [{ data: staff, error: staffError }, { data: matches, error: matchesError }, { data: assignments, error: assignmentsError }] =
    await Promise.all([
      supabase.from("team_staff").select("*").eq("team_id", teamId).order("is_head_coach", { ascending: false }),
      supabase.from("matches").select("*").eq("team_id", teamId).order("starts_at", { ascending: true }),
      supabase.from("team_players").select("*").eq("team_id", teamId).order("created_at", { ascending: true })
    ]);

  if (staffError) {
    throw new Error(`Unable to fetch educator roster staff: ${staffError.message}`);
  }

  if (matchesError) {
    throw new Error(`Unable to fetch educator roster matches: ${matchesError.message}`);
  }

  if (assignmentsError) {
    throw new Error(`Unable to fetch educator roster players: ${assignmentsError.message}`);
  }

  const rosterAssignments = (assignments ?? []) as TeamPlayer[];
  const playerIds = rosterAssignments.map((assignment) => assignment.player_id);
  const { data: players, error: playersError } =
    playerIds.length > 0
      ? await supabase.from("players").select("*").in("id", playerIds)
      : { data: [], error: null };

  if (playersError) {
    throw new Error(`Unable to fetch educator players: ${playersError.message}`);
  }

  const playerById = new Map((players ?? []).map((player) => [player.id, player as Player]));

  return {
    team: team as Team,
    staff: (staff ?? []) as TeamStaff[],
    matches: (matches ?? []) as Match[],
    players: rosterAssignments.map((assignment) => ({
      assignment,
      player: playerById.get(assignment.player_id) ?? null
    }))
  };
}

export async function createMatch(input: AdminMatchPayload): Promise<Match> {
  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .insert({
      ...matchPayloadToRow(input),
      location: input.location ?? "HOME",
      status: input.status ?? "SCHEDULED"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create match: ${error.message}`);
  }

  return data as Match;
}

export async function createMatchForEducator(
  profileId: string,
  canManageAllTeams: boolean,
  input: AdminMatchPayload
): Promise<Match | null> {
  if (!input.teamId) {
    return null;
  }

  const allowed = await canManageTeam(input.teamId, profileId, canManageAllTeams);

  if (!allowed) {
    return null;
  }

  return createMatch(input);
}

export async function updateMatch(id: string, input: AdminMatchPayload): Promise<Match> {
  const { data, error } = await getSupabaseAdminClient()
    .from("matches")
    .update(matchPayloadToRow(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update match: ${error.message}`);
  }

  return data as Match;
}

export async function updateMatchForEducator(
  matchId: string,
  profileId: string,
  canManageAllTeams: boolean,
  input: AdminMatchPayload
): Promise<Match | null> {
  const { data: existingMatch, error } = await getSupabaseAdminClient().from("matches").select("*").eq("id", matchId).maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch educator match: ${error.message}`);
  }

  if (!existingMatch) {
    return null;
  }

  const match = existingMatch as Match;
  const targetTeamId = input.teamId ?? match.team_id;
  const allowed = await canManageTeam(targetTeamId, profileId, canManageAllTeams);

  if (!allowed) {
    return null;
  }

  return updateMatch(matchId, input);
}
