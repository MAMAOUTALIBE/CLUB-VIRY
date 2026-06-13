import "server-only";

import { queueNotification } from "@/lib/db/notifications";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { NotificationCategory } from "@/lib/db/types";

/**
 * Fan-out des notifications familles : résout les tuteurs concernés (via player_guardians),
 * applique leurs préférences (opt-in email), et met en file une entrée in-app (toujours)
 * + une entrée email (si opt-in). Le push est ajouté au lot L3.
 *
 * Règle d'or : une notification ne doit JAMAIS faire échouer l'action métier (try/catch large).
 */

type Recipient = { profileId: string; email: string | null; childFirstName?: string };

function formatFrDateTime(iso: string | null | undefined): string {
  if (!iso) return "à venir";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "à venir";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(date);
}

/** Tuteurs (profils) des joueurs de l'effectif d'une équipe. */
async function getTeamGuardianRecipients(teamId: string): Promise<Recipient[]> {
  const supabase = getSupabaseAdminClient();

  const { data: roster } = await supabase.from("team_players").select("player_id").eq("team_id", teamId);
  const playerIds = (roster ?? []).map((r) => (r as { player_id: string }).player_id);
  if (playerIds.length === 0) return [];

  const { data: guardians } = await supabase.from("player_guardians").select("profile_id").in("player_id", playerIds);
  const profileIds = Array.from(new Set((guardians ?? []).map((g) => (g as { profile_id: string }).profile_id)));
  if (profileIds.length === 0) return [];

  const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", profileIds);
  return (profiles ?? []).map((p) => ({ profileId: (p as { id: string }).id, email: (p as { email: string | null }).email }));
}

/** Tuteurs des joueurs donnés, avec le prénom de l'enfant (une ligne par tuteur × enfant). */
async function getPlayersGuardianRecipients(playerIds: string[]): Promise<Recipient[]> {
  if (playerIds.length === 0) return [];
  const supabase = getSupabaseAdminClient();

  const { data: players } = await supabase.from("players").select("id, first_name").in("id", playerIds);
  const firstNameById = new Map((players ?? []).map((p) => [(p as { id: string }).id, (p as { first_name: string }).first_name]));

  const { data: guardians } = await supabase.from("player_guardians").select("player_id, profile_id").in("player_id", playerIds);
  const guardianRows = (guardians ?? []) as Array<{ player_id: string; profile_id: string }>;
  const profileIds = Array.from(new Set(guardianRows.map((g) => g.profile_id)));
  if (profileIds.length === 0) return [];

  const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", profileIds);
  const emailById = new Map((profiles ?? []).map((p) => [(p as { id: string }).id, (p as { email: string | null }).email]));

  return guardianRows.map((g) => ({
    profileId: g.profile_id,
    email: emailById.get(g.profile_id) ?? null,
    childFirstName: firstNameById.get(g.player_id)
  }));
}

/** Préférences (email/push) par profil pour une catégorie ; défaut = activé si pas de ligne. */
async function getPreferenceMap(profileIds: string[], category: NotificationCategory): Promise<Map<string, { email: boolean; push: boolean }>> {
  const map = new Map<string, { email: boolean; push: boolean }>();
  if (profileIds.length === 0) return map;

  const { data } = await getSupabaseAdminClient()
    .from("notification_preferences")
    .select("profile_id, email, push")
    .eq("category", category)
    .in("profile_id", profileIds);

  for (const row of (data ?? []) as Array<{ profile_id: string; email: boolean; push: boolean }>) {
    map.set(row.profile_id, { email: row.email, push: row.push });
  }
  return map;
}

type NotifyInput = {
  category: NotificationCategory;
  template: string;
  subject: string;
  link?: string | null;
  payload?: Record<string, unknown>;
};

/** Met en file in-app (toujours) + email (si opt-in & email connu) pour chaque destinataire. */
async function fanOut(recipients: Recipient[], input: NotifyInput): Promise<void> {
  if (recipients.length === 0) return;
  const profileIds = Array.from(new Set(recipients.map((r) => r.profileId)));
  const prefs = await getPreferenceMap(profileIds, input.category);

  for (const recipient of recipients) {
    const pref = prefs.get(recipient.profileId) ?? { email: true, push: true };
    const payload = { ...(input.payload ?? {}), ...(recipient.childFirstName ? { childFirstName: recipient.childFirstName } : {}) };

    await queueNotification({
      recipientProfileId: recipient.profileId,
      channel: "in_app",
      template: input.template,
      subject: input.subject,
      category: input.category,
      link: input.link ?? null,
      payload
    });

    if (pref.email && recipient.email) {
      await queueNotification({
        recipientProfileId: recipient.profileId,
        recipientEmail: recipient.email,
        channel: "email",
        template: input.template,
        subject: input.subject,
        category: input.category,
        link: input.link ?? null,
        payload
      });
    }
    // Push (L3) : l'enqueue push sera ajouté ici quand le dispatcher push sera livré.
  }
}

/** Séance d'entraînement créée ou annulée → prévient les tuteurs de l'équipe. */
export async function notifyTeamSessionChange(
  teamId: string,
  kind: "created" | "cancelled",
  session: { startsAt: string; location?: string | null; theme?: string | null }
): Promise<void> {
  try {
    const recipients = await getTeamGuardianRecipients(teamId);
    const dateLabel = formatFrDateTime(session.startsAt);
    const subject = kind === "cancelled" ? `Séance annulée — ${dateLabel}` : `Nouvelle séance d'entraînement — ${dateLabel}`;
    await fanOut(recipients, {
      category: "session",
      template: kind === "cancelled" ? "session_cancelled" : "session_created",
      subject,
      link: "/espace-membre",
      payload: { kind, startsAt: session.startsAt, location: session.location ?? null, theme: session.theme ?? null, dateLabel }
    });
  } catch {
    // Une notif ne doit jamais casser l'action métier.
  }
}

/** Convocations enregistrées → prévient les tuteurs des joueurs convoqués (un message par enfant). */
export async function notifyMatchCallups(matchId: string, convokedPlayerIds: string[]): Promise<void> {
  try {
    if (convokedPlayerIds.length === 0) return;
    const { data: match } = await getSupabaseAdminClient().from("matches").select("starts_at, opponent_name").eq("id", matchId).maybeSingle();
    const startsAt = (match as { starts_at: string | null } | null)?.starts_at ?? null;
    const opponentName = (match as { opponent_name: string | null } | null)?.opponent_name ?? null;

    const recipients = await getPlayersGuardianRecipients(convokedPlayerIds);
    const dateLabel = formatFrDateTime(startsAt);
    await fanOut(recipients, {
      category: "convocation",
      template: "match_callup",
      subject: `Convocation — match ${dateLabel}`,
      link: "/espace-membre",
      payload: { startsAt, opponentName, dateLabel }
    });
  } catch {
    // silencieux
  }
}

/** Nouveau média rattaché à une équipe → prévient les tuteurs des joueurs de l'équipe (CRM intelligent). */
export async function notifyTeamMediaAdded(teamId: string, media: { type: string; title: string }): Promise<void> {
  try {
    const recipients = await getTeamGuardianRecipients(teamId);
    const label = media.type === "VIDEO" ? "Nouvelle vidéo" : "Nouvelle photo";
    await fanOut(recipients, {
      category: "media",
      template: "media_added",
      subject: `${label} de l'équipe`,
      link: "/espace-membre",
      payload: { type: media.type, title: media.title }
    });
  } catch {
    // silencieux
  }
}
