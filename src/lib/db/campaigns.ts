import "server-only";

import type { AdminCampaignPayload } from "@/lib/api/validation";
import { fanOut, type Recipient } from "@/lib/db/family-notifications";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { CampaignAudienceType, CommunicationCampaign } from "@/lib/db/types";
import type { AppRole } from "@/lib/auth/roles";

export type CampaignAudience = { type: CampaignAudienceType; id?: string | null };

export type AudiencePreview = {
  /** Personnes atteintes, tous canaux confondus (le fil in-app est toujours servi). */
  recipients: number;
  /** Parmi elles, celles joignables par email (adresse connue ET opt-in « vie du club »). */
  emails: number;
};

const CAMPAIGN_CATEGORY = "club" as const;
const CAMPAIGN_TEMPLATE = "club_campaign";

async function listProfilesByIds(profileIds: string[]): Promise<Recipient[]> {
  if (profileIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("profiles")
    .select("id,email")
    .in("id", profileIds)
    .eq("status", "ACTIVE");

  if (error) {
    throw new Error(`Unable to fetch campaign profiles: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const record = row as { id: string; email: string | null };
    return { profileId: record.id, email: record.email };
  });
}

/** Tuteurs des joueurs actifs d'une liste, sans doublon de profil. */
async function guardiansOfPlayers(playerIds: string[]): Promise<string[]> {
  if (playerIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("player_guardians")
    .select("profile_id")
    .in("player_id", playerIds);

  if (error) {
    throw new Error(`Unable to fetch campaign guardians: ${error.message}`);
  }

  return [...new Set((data ?? []).map((row) => (row as { profile_id: string }).profile_id))];
}

/**
 * Résout le public d'une campagne en profils destinataires.
 *
 * Seuls les comptes ACTIFS sont retenus : un compte suspendu ne peut ni lire son fil
 * ni recevoir de mail du club. Les joueurs archivés sont écartés de la même façon —
 * cibler une équipe ne doit pas réveiller les familles parties en cours de saison.
 */
export async function resolveCampaignAudience(audience: CampaignAudience): Promise<Recipient[]> {
  const supabase = getSupabaseAdminClient();

  if (audience.type === "ALL_MEMBERS") {
    const { data, error } = await supabase.from("profiles").select("id,email").eq("status", "ACTIVE");

    if (error) {
      throw new Error(`Unable to fetch campaign audience: ${error.message}`);
    }

    return (data ?? []).map((row) => {
      const record = row as { id: string; email: string | null };
      return { profileId: record.id, email: record.email };
    });
  }

  if (audience.type === "ROLE") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email")
      .eq("status", "ACTIVE")
      .eq("role", audience.id as AppRole);

    if (error) {
      throw new Error(`Unable to fetch campaign audience: ${error.message}`);
    }

    return (data ?? []).map((row) => {
      const record = row as { id: string; email: string | null };
      return { profileId: record.id, email: record.email };
    });
  }

  if (audience.type === "TEAM") {
    const [{ data: roster, error: rosterError }, { data: staff, error: staffError }] = await Promise.all([
      supabase.from("team_players").select("player_id").eq("team_id", audience.id ?? ""),
      supabase.from("team_staff").select("profile_id").eq("team_id", audience.id ?? "")
    ]);

    if (rosterError) {
      throw new Error(`Unable to fetch campaign roster: ${rosterError.message}`);
    }

    if (staffError) {
      throw new Error(`Unable to fetch campaign staff: ${staffError.message}`);
    }

    const playerIds = (roster ?? []).map((row) => (row as { player_id: string }).player_id);
    const activePlayerIds = await filterActivePlayers(playerIds);
    const guardianIds = await guardiansOfPlayers(activePlayerIds);
    // Le staff de l'équipe reçoit aussi : un message à une équipe qui n'atteindrait
    // pas ses éducateurs manquerait justement ceux qui doivent s'organiser.
    const staffIds = (staff ?? []).map((row) => (row as { profile_id: string }).profile_id);

    return listProfilesByIds([...new Set([...guardianIds, ...staffIds])]);
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id")
    .eq("category_id", audience.id ?? "")
    .is("deleted_at", null);

  if (playersError) {
    throw new Error(`Unable to fetch campaign category players: ${playersError.message}`);
  }

  const guardianIds = await guardiansOfPlayers((players ?? []).map((row) => (row as { id: string }).id));

  return listProfilesByIds(guardianIds);
}

/** Écarte les joueurs archivés d'une liste d'identifiants. */
async function filterActivePlayers(playerIds: string[]): Promise<string[]> {
  if (playerIds.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("players")
    .select("id")
    .in("id", playerIds)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to filter campaign players: ${error.message}`);
  }

  return (data ?? []).map((row) => (row as { id: string }).id);
}

/** Compte, sans rien envoyer, qui recevrait la campagne et par quel canal. */
export async function previewCampaignAudience(audience: CampaignAudience): Promise<AudiencePreview> {
  const recipients = await resolveCampaignAudience(audience);
  const withEmail = recipients.filter((recipient) => Boolean(recipient.email));

  if (withEmail.length === 0) {
    return { recipients: recipients.length, emails: 0 };
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("notification_preferences")
    .select("profile_id,email")
    .eq("category", CAMPAIGN_CATEGORY)
    .in(
      "profile_id",
      withEmail.map((recipient) => recipient.profileId)
    );

  if (error) {
    throw new Error(`Unable to read campaign preferences: ${error.message}`);
  }

  // Pas de ligne de préférence = opt-in par défaut, comme partout ailleurs.
  const optedOut = new Set(
    (data ?? [])
      .filter((row) => (row as { email: boolean }).email === false)
      .map((row) => (row as { profile_id: string }).profile_id)
  );

  return {
    recipients: recipients.length,
    emails: withEmail.filter((recipient) => !optedOut.has(recipient.profileId)).length
  };
}

export async function listCampaigns(limit = 50): Promise<CommunicationCampaign[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("communication_campaigns")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch campaigns: ${error.message}`);
  }

  return (data ?? []) as CommunicationCampaign[];
}

export async function createCampaign(input: AdminCampaignPayload, createdBy: string): Promise<CommunicationCampaign> {
  const { data, error } = await getSupabaseAdminClient()
    .from("communication_campaigns")
    .insert({
      subject: input.subject,
      body: input.body,
      audience_type: input.audienceType,
      audience_id: input.audienceId ?? null,
      link: input.link ?? null,
      status: "DRAFT",
      created_by: createdBy
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create campaign: ${error.message}`);
  }

  return data as CommunicationCampaign;
}

export type CampaignSendResult =
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_SENT" | "NO_RECIPIENT" }
  | { ok: true; campaign: CommunicationCampaign };

/**
 * Envoie une campagne : résout le public, met en file une notification par
 * destinataire puis fige les compteurs.
 *
 * Le passage DRAFT -> SENT est fait en premier et de façon conditionnelle : c'est lui
 * qui interdit le double envoi si deux administrateurs cliquent en même temps. Mieux
 * vaut une campagne marquée envoyée mais vide qu'un message reçu deux fois par
 * toutes les familles du club.
 */
export async function sendCampaign(id: string, sentBy: string): Promise<CampaignSendResult> {
  const supabase = getSupabaseAdminClient();

  const { data: campaign, error: readError } = await supabase
    .from("communication_campaigns")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError) {
    throw new Error(`Unable to read campaign: ${readError.message}`);
  }

  if (!campaign) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const audience: CampaignAudience = {
    type: (campaign as CommunicationCampaign).audience_type,
    id: (campaign as CommunicationCampaign).audience_id
  };
  const recipients = await resolveCampaignAudience(audience);

  if (recipients.length === 0) {
    return { ok: false, reason: "NO_RECIPIENT" };
  }

  const { data: claimed, error: claimError } = await supabase
    .from("communication_campaigns")
    .update({ status: "SENT", sent_at: new Date().toISOString(), recipient_count: recipients.length })
    .eq("id", id)
    .eq("status", "DRAFT")
    .select("*")
    .maybeSingle();

  if (claimError) {
    throw new Error(`Unable to claim campaign: ${claimError.message}`);
  }

  if (!claimed) {
    return { ok: false, reason: "ALREADY_SENT" };
  }

  const row = claimed as CommunicationCampaign;
  const counts = await fanOut(recipients, {
    category: CAMPAIGN_CATEGORY,
    template: CAMPAIGN_TEMPLATE,
    subject: row.subject,
    link: row.link ?? "/espace-membre",
    payload: { body: row.body, campaignId: row.id, sentBy }
  });

  const { data: updated, error: updateError } = await supabase
    .from("communication_campaigns")
    .update({ email_count: counts.emails })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(`Unable to finalise campaign: ${updateError.message}`);
  }

  return { ok: true, campaign: updated as CommunicationCampaign };
}
