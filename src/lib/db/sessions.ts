import "server-only";

import { notifyMatchCallups, notifyTeamSessionChange } from "@/lib/db/family-notifications";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { canManageTeam } from "@/lib/db/teams";

export type TrainingSession = {
  id: string;
  team_id: string;
  starts_at: string;
  duration_min: number | null;
  location: string | null;
  theme: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSE" | "BLESSE";
export type CallupStatus = "CONVOQUE" | "REMPLACANT" | "NON_CONVOQUE" | "BLESSE";

export type SessionAttendance = { id: string; session_id: string; player_id: string; status: AttendanceStatus; created_at: string };
export type MatchCallup = { id: string; match_id: string; player_id: string; status: CallupStatus; created_at: string };

export type TrainingSessionInput = {
  teamId: string;
  startsAt: string;
  durationMin?: number | null;
  location?: string | null;
  theme?: string | null;
  notes?: string | null;
};

/** Ensemble des player_id appartenant a l'effectif d'une equipe (pour valider les ecritures). */
async function getTeamPlayerIds(teamId: string): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdminClient().from("team_players").select("player_id").eq("team_id", teamId);

  if (error) {
    throw new Error(`Unable to fetch team roster ids: ${error.message}`);
  }

  return new Set((data ?? []).map((r) => (r as { player_id: string }).player_id));
}

// ----------------- SEANCES -----------------

/** Liste les seances d'une equipe SI l'educateur la gere (null sinon). */
export async function listTrainingSessionsForEducator(teamId: string, profileId: string, canManageAllTeams: boolean): Promise<TrainingSession[] | null> {
  if (!(await canManageTeam(teamId, profileId, canManageAllTeams))) {
    return null;
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("training_sessions")
    .select("*")
    .eq("team_id", teamId)
    .order("starts_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch training sessions: ${error.message}`);
  }

  return (data ?? []) as TrainingSession[];
}

/** Cree une seance pour une equipe SI l'educateur la gere (null sinon). */
export async function createTrainingSessionForEducator(profileId: string, canManageAllTeams: boolean, input: TrainingSessionInput): Promise<TrainingSession | null> {
  if (!(await canManageTeam(input.teamId, profileId, canManageAllTeams))) {
    return null;
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("training_sessions")
    .insert({
      team_id: input.teamId,
      starts_at: input.startsAt,
      duration_min: input.durationMin ?? null,
      location: input.location ?? null,
      theme: input.theme ?? null,
      notes: input.notes ?? null,
      created_by: profileId
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create training session: ${error.message}`);
  }

  const session = data as TrainingSession;
  await notifyTeamSessionChange(session.team_id, "created", { startsAt: session.starts_at, location: session.location, theme: session.theme });
  return session;
}

async function getSessionIfManaged(sessionId: string, profileId: string, canManageAllTeams: boolean): Promise<TrainingSession | null> {
  const { data, error } = await getSupabaseAdminClient().from("training_sessions").select("*").eq("id", sessionId).maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch training session: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const session = data as TrainingSession;
  return (await canManageTeam(session.team_id, profileId, canManageAllTeams)) ? session : null;
}

/** Supprime une seance SI l'educateur gere son equipe. */
export async function deleteTrainingSessionForEducator(sessionId: string, profileId: string, canManageAllTeams: boolean): Promise<boolean> {
  const session = await getSessionIfManaged(sessionId, profileId, canManageAllTeams);

  if (!session) {
    return false;
  }

  const { error } = await getSupabaseAdminClient().from("training_sessions").delete().eq("id", sessionId);

  if (error) {
    throw new Error(`Unable to delete training session: ${error.message}`);
  }

  await notifyTeamSessionChange(session.team_id, "cancelled", { startsAt: session.starts_at, location: session.location, theme: session.theme });
  return true;
}

// ----------------- PRESENCES -----------------

export async function getSessionAttendanceForEducator(sessionId: string, profileId: string, canManageAllTeams: boolean): Promise<SessionAttendance[] | null> {
  const session = await getSessionIfManaged(sessionId, profileId, canManageAllTeams);

  if (!session) {
    return null;
  }

  const { data, error } = await getSupabaseAdminClient().from("session_attendance").select("*").eq("session_id", sessionId);

  if (error) {
    throw new Error(`Unable to fetch session attendance: ${error.message}`);
  }

  return (data ?? []) as SessionAttendance[];
}

/** Enregistre (upsert) les presences d'une seance SI l'educateur gere son equipe. */
export async function setSessionAttendanceForEducator(
  sessionId: string,
  profileId: string,
  canManageAllTeams: boolean,
  entries: Array<{ playerId: string; status: AttendanceStatus }>
): Promise<SessionAttendance[] | null> {
  const session = await getSessionIfManaged(sessionId, profileId, canManageAllTeams);

  if (!session) {
    return null;
  }

  // Garde-fou serveur : on ne pointe que des joueurs reellement dans l'effectif de l'equipe.
  const rosterIds = await getTeamPlayerIds(session.team_id);
  const valid = entries.filter((e) => rosterIds.has(e.playerId));

  if (valid.length > 0) {
    const rows = valid.map((e) => ({ session_id: sessionId, player_id: e.playerId, status: e.status }));
    const { error } = await getSupabaseAdminClient().from("session_attendance").upsert(rows, { onConflict: "session_id,player_id" });

    if (error) {
      throw new Error(`Unable to save session attendance: ${error.message}`);
    }
  }

  return getSessionAttendanceForEducator(sessionId, profileId, canManageAllTeams);
}

// ----------------- CONVOCATIONS -----------------

async function getMatchTeamIfManaged(matchId: string, profileId: string, canManageAllTeams: boolean): Promise<{ matchId: string; teamId: string | null } | null> {
  const { data, error } = await getSupabaseAdminClient().from("matches").select("id, team_id").eq("id", matchId).maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch match: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const teamId = (data as { team_id: string | null }).team_id;
  return (await canManageTeam(teamId, profileId, canManageAllTeams)) ? { matchId, teamId } : null;
}

export async function getMatchCallupsForEducator(matchId: string, profileId: string, canManageAllTeams: boolean): Promise<MatchCallup[] | null> {
  const managed = await getMatchTeamIfManaged(matchId, profileId, canManageAllTeams);

  if (!managed) {
    return null;
  }

  const { data, error } = await getSupabaseAdminClient().from("match_callups").select("*").eq("match_id", matchId);

  if (error) {
    throw new Error(`Unable to fetch match callups: ${error.message}`);
  }

  return (data ?? []) as MatchCallup[];
}

/** Enregistre (upsert) les convocations d'un match SI l'educateur gere l'equipe du match. */
export async function setMatchCallupsForEducator(
  matchId: string,
  profileId: string,
  canManageAllTeams: boolean,
  entries: Array<{ playerId: string; status: CallupStatus }>
): Promise<MatchCallup[] | null> {
  const managed = await getMatchTeamIfManaged(matchId, profileId, canManageAllTeams);

  if (!managed) {
    return null;
  }

  // Garde-fou serveur : on ne convoque que des joueurs de l'effectif de l'equipe du match.
  const rosterIds = managed.teamId ? await getTeamPlayerIds(managed.teamId) : null;
  const valid = rosterIds ? entries.filter((e) => rosterIds.has(e.playerId)) : entries;

  if (valid.length > 0) {
    // État précédent, pour ne notifier QUE les nouvelles convocations (anti-spam à chaque enregistrement).
    const { data: existingRows } = await getSupabaseAdminClient().from("match_callups").select("player_id, status").eq("match_id", matchId);
    const previousStatus = new Map((existingRows ?? []).map((r) => [(r as { player_id: string }).player_id, (r as { status: CallupStatus }).status]));

    const rows = valid.map((e) => ({ match_id: matchId, player_id: e.playerId, status: e.status }));
    const { error } = await getSupabaseAdminClient().from("match_callups").upsert(rows, { onConflict: "match_id,player_id" });

    if (error) {
      throw new Error(`Unable to save match callups: ${error.message}`);
    }

    // Prévient les tuteurs des joueurs qui PASSENT à convoqué (titulaire/remplaçant), pas ceux déjà convoqués.
    const wasConvoked = (status?: CallupStatus) => status === "CONVOQUE" || status === "REMPLACANT";
    const newlyConvoked = valid
      .filter((e) => wasConvoked(e.status) && !wasConvoked(previousStatus.get(e.playerId)))
      .map((e) => e.playerId);
    await notifyMatchCallups(matchId, newlyConvoked);
  }

  return getMatchCallupsForEducator(matchId, profileId, canManageAllTeams);
}
