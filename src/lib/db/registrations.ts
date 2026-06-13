import "server-only";

import type { AdminDocumentReviewPayload, AdminRegistrationReviewPayload } from "@/lib/api/validation";
import { getActiveSeason, recordActivity } from "@/lib/db/foundations";
import { getFamilyDashboard, isProfileFamilyMember } from "@/lib/db/family";
import { queueAdminNotification, queueNotification } from "@/lib/db/notifications";
import { ensureSubscription } from "@/lib/db/subscriptions";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { Family, Payment, Player, Registration, RegistrationDocument } from "@/lib/db/types";

export type RegistrationBundle = {
  registration: Registration;
  documents: RegistrationDocument[];
};

export type AdminRegistrationDetail = RegistrationBundle & {
  family: Family | null;
  player: Player | null;
  payments: Payment[];
};

export type RegistrationDocumentDownload = {
  document: RegistrationDocument;
  signedUrl: string;
  expiresIn: number;
};

export type CreateRegistrationInput = {
  profileId: string;
  playerId: string;
  seasonId?: string;
  categoryId?: string | null;
  notes?: string | null;
};

export type MarkRegistrationDocumentUploadedInput = {
  documentId: string;
  filePath: string;
  uploadedBy: string;
};

const DEFAULT_REQUIRED_DOCUMENTS = [
  { document_type: "identity", label: "Piece d'identite" },
  { document_type: "medical_certificate", label: "Certificat medical" },
  { document_type: "parental_authorization", label: "Autorisation parentale" },
  { document_type: "photo", label: "Photo d'identite" }
];

const DOCUMENTS_BUCKET = "club-documents";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 10;

async function getProfileEmail(profileId: string | null | undefined): Promise<string | null> {
  if (!profileId) {
    return null;
  }

  const { data, error } = await getSupabaseAdminClient().from("profiles").select("email").eq("id", profileId).maybeSingle();

  if (error) {
    throw new Error(`Unable to fetch profile email: ${error.message}`);
  }

  return typeof data?.email === "string" ? data.email : null;
}

export async function listRegistrationsForProfile(profileId: string): Promise<Registration[]> {
  const supabase = getSupabaseAdminClient();
  const dashboard = await getFamilyDashboard(profileId);
  const familyIds = dashboard.families.map((family) => family.id);

  if (familyIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .in("family_id", familyIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch registrations: ${error.message}`);
  }

  return (data ?? []) as Registration[];
}

export async function listRegistrationsForAdmin(limit = 100, status?: Registration["status"]): Promise<Registration[]> {
  let query = getSupabaseAdminClient()
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to fetch admin registrations: ${error.message}`);
  }

  return (data ?? []) as Registration[];
}

export async function getRegistrationForProfile(profileId: string, registrationId: string): Promise<RegistrationBundle | null> {
  const supabase = getSupabaseAdminClient();
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", registrationId)
    .maybeSingle();

  if (registrationError) {
    throw new Error(`Unable to fetch registration: ${registrationError.message}`);
  }

  if (!registration) {
    return null;
  }

  const hasAccess = await isProfileFamilyMember(profileId, registration.family_id as string);

  if (!hasAccess) {
    return null;
  }

  const { data: documents, error: documentsError } = await supabase
    .from("registration_documents")
    .select("*")
    .eq("registration_id", registrationId)
    .order("created_at", { ascending: true });

  if (documentsError) {
    throw new Error(`Unable to fetch registration documents: ${documentsError.message}`);
  }

  return {
    registration: registration as Registration,
    documents: (documents ?? []) as RegistrationDocument[]
  };
}

export async function getRegistrationBundleForAdmin(registrationId: string): Promise<RegistrationBundle | null> {
  const supabase = getSupabaseAdminClient();
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", registrationId)
    .maybeSingle();

  if (registrationError) {
    throw new Error(`Unable to fetch admin registration: ${registrationError.message}`);
  }

  if (!registration) {
    return null;
  }

  const { data: documents, error: documentsError } = await supabase
    .from("registration_documents")
    .select("*")
    .eq("registration_id", registrationId)
    .order("created_at", { ascending: true });

  if (documentsError) {
    throw new Error(`Unable to fetch admin registration documents: ${documentsError.message}`);
  }

  return {
    registration: registration as Registration,
    documents: (documents ?? []) as RegistrationDocument[]
  };
}

export async function getRegistrationDetailForAdmin(registrationId: string): Promise<AdminRegistrationDetail | null> {
  const supabase = getSupabaseAdminClient();
  const bundle = await getRegistrationBundleForAdmin(registrationId);

  if (!bundle) {
    return null;
  }

  const [
    { data: family, error: familyError },
    { data: player, error: playerError },
    { data: payments, error: paymentsError }
  ] = await Promise.all([
    supabase.from("families").select("*").eq("id", bundle.registration.family_id).maybeSingle(),
    supabase.from("players").select("*").eq("id", bundle.registration.player_id).maybeSingle(),
    supabase.from("payments").select("*").eq("registration_id", registrationId).order("created_at", { ascending: false })
  ]);

  if (familyError) {
    throw new Error(`Unable to fetch admin registration family: ${familyError.message}`);
  }

  if (playerError) {
    throw new Error(`Unable to fetch admin registration player: ${playerError.message}`);
  }

  if (paymentsError) {
    throw new Error(`Unable to fetch admin registration payments: ${paymentsError.message}`);
  }

  return {
    ...bundle,
    family: family as Family | null,
    player: player as Player | null,
    payments: (payments ?? []) as Payment[]
  };
}

export async function createRegistration(input: CreateRegistrationInput): Promise<RegistrationBundle> {
  const supabase = getSupabaseAdminClient();
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", input.playerId)
    .maybeSingle();

  if (playerError) {
    throw new Error(`Unable to fetch player: ${playerError.message}`);
  }

  if (!player?.family_id) {
    throw new Error("Player not found or not linked to a family.");
  }

  const hasAccess = await isProfileFamilyMember(input.profileId, player.family_id as string);

  if (!hasAccess) {
    throw new Error("Forbidden family access.");
  }

  const activeSeason = input.seasonId ? null : await getActiveSeason();
  const seasonId = input.seasonId ?? activeSeason?.id;

  if (!seasonId) {
    throw new Error("No active season configured.");
  }

  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .insert({
      season_id: seasonId,
      family_id: player.family_id,
      player_id: input.playerId,
      category_id: input.categoryId ?? player.category_id ?? null,
      submitted_by: input.profileId,
      status: "SUBMITTED",
      notes: input.notes ?? null,
      submitted_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (registrationError) {
    throw new Error(`Unable to create registration: ${registrationError.message}`);
  }

  const { data: documents, error: documentsError } = await supabase
    .from("registration_documents")
    .insert(
      DEFAULT_REQUIRED_DOCUMENTS.map((document) => ({
        registration_id: registration.id,
        document_type: document.document_type,
        label: document.label,
        status: "REQUESTED"
      }))
    )
    .select("*");

  if (documentsError) {
    // Compensation : pas de dossier d'inscription sans ses pièces justificatives.
    await supabase.from("registrations").delete().eq("id", registration.id);
    throw new Error(`Unable to create registration documents: ${documentsError.message}`);
  }

  const profileEmail = await getProfileEmail(input.profileId);

  await Promise.all([
    queueAdminNotification(
      {
        template: "registration_submitted",
        subject: "Nouveau dossier d'inscription",
        payload: {
          registrationId: registration.id,
          playerId: input.playerId,
          seasonId,
          categoryId: input.categoryId ?? player.category_id ?? null
        }
      },
      supabase
    ),
    queueNotification(
      {
        recipientProfileId: input.profileId,
        recipientEmail: profileEmail,
        template: "registration_received",
        subject: "Votre dossier d'inscription ES Viry-Châtillon",
        payload: {
          registrationId: registration.id,
          playerId: input.playerId,
          status: registration.status
        }
      },
      supabase
    ),
    recordActivity({
      actorId: input.profileId,
      action: "registration.created",
      entityType: "registrations",
      entityId: registration.id,
      metadata: {
        playerId: input.playerId,
        seasonId,
        categoryId: input.categoryId ?? player.category_id ?? null
      }
    })
  ]);

  return {
    registration: registration as Registration,
    documents: (documents ?? []) as RegistrationDocument[]
  };
}

export async function reviewRegistration(id: string, input: AdminRegistrationReviewPayload, reviewedBy: string): Promise<Registration> {
  const { data, error } = await getSupabaseAdminClient()
    .from("registrations")
    .update({
      ...(input.status ? { status: input.status, reviewed_at: new Date().toISOString(), reviewed_by: reviewedBy } : {}),
      ...(input.adminNotes !== undefined ? { admin_notes: input.adminNotes ?? null } : {}),
      ...(input.categoryId !== undefined ? { category_id: input.categoryId ?? null } : {})
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to review registration: ${error.message}`);
  }

  const profileEmail = await getProfileEmail(data.submitted_by as string | null);

  if (input.status && data.submitted_by) {
    await queueNotification({
      recipientProfileId: data.submitted_by as string,
      recipientEmail: profileEmail,
      template: "registration_status_updated",
      subject: "Mise à jour de votre dossier ES Viry-Châtillon",
      payload: {
        registrationId: data.id,
        status: data.status,
        adminNotes: data.admin_notes ?? null
      }
    });
  }

  // Phase 4 : à la validation, on provisionne automatiquement l'abonnement FAMILLE du parent.
  if (input.status === "VALIDATED" && data.submitted_by) {
    try {
      await ensureSubscription(data.submitted_by as string, "FAMILLE", `registration:${data.id}`);
    } catch {
      // l'abonnement ne doit pas bloquer la validation du dossier
    }
  }

  return data as Registration;
}

export async function markRegistrationDocumentUploaded(input: MarkRegistrationDocumentUploadedInput): Promise<RegistrationDocument> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registration_documents")
    .update({
      status: "UPLOADED",
      file_path: input.filePath,
      uploaded_by: input.uploadedBy,
      uploaded_at: new Date().toISOString(),
      rejection_reason: null
    })
    .eq("id", input.documentId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update registration document: ${error.message}`);
  }

  await Promise.all([
    queueAdminNotification({
      template: "registration_document_uploaded",
      subject: "Nouveau document d'inscription uploadé",
      payload: {
        registrationId: data.registration_id,
        documentId: data.id,
        documentType: data.document_type,
        uploadedBy: input.uploadedBy
      }
    }),
    recordActivity({
      actorId: input.uploadedBy,
      action: "registration_document.uploaded",
      entityType: "registration_documents",
      entityId: data.id,
      metadata: {
        registrationId: data.registration_id,
        documentType: data.document_type
      }
    })
  ]);

  return data as RegistrationDocument;
}

export async function reviewRegistrationDocument(id: string, input: AdminDocumentReviewPayload): Promise<RegistrationDocument> {
  const { data, error } = await getSupabaseAdminClient()
    .from("registration_documents")
    .update({
      ...(input.status ? { status: input.status } : {}),
      ...(input.rejectionReason !== undefined ? { rejection_reason: input.rejectionReason ?? null } : {})
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to review registration document: ${error.message}`);
  }

  const recipientProfileId = (data.uploaded_by ?? null) as string | null;
  const profileEmail = await getProfileEmail(recipientProfileId);

  if (input.status && recipientProfileId) {
    await queueNotification({
      recipientProfileId,
      recipientEmail: profileEmail,
      template: "registration_document_reviewed",
      subject: "Mise à jour d'un document d'inscription",
      payload: {
        registrationId: data.registration_id,
        documentId: data.id,
        documentType: data.document_type,
        status: data.status,
        rejectionReason: data.rejection_reason ?? null
      }
    });
  }

  return data as RegistrationDocument;
}

export async function createRegistrationDocumentSignedUrl(
  profileId: string,
  documentId: string,
  canReviewDocuments = false
): Promise<RegistrationDocumentDownload | null> {
  const supabase = getSupabaseAdminClient();
  const { data: document, error: documentError } = await supabase
    .from("registration_documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (documentError) {
    throw new Error(`Unable to fetch registration document: ${documentError.message}`);
  }

  if (!document) {
    return null;
  }

  if (!document.file_path) {
    throw new Error("Registration document has no uploaded file.");
  }

  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", document.registration_id)
    .maybeSingle();

  if (registrationError) {
    throw new Error(`Unable to fetch document registration: ${registrationError.message}`);
  }

  if (!registration) {
    return null;
  }

  if (!canReviewDocuments) {
    const hasAccess = await isProfileFamilyMember(profileId, registration.family_id as string);

    if (!hasAccess) {
      return null;
    }
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(document.file_path as string, SIGNED_URL_EXPIRES_IN_SECONDS);

  if (signedUrlError) {
    throw new Error(`Unable to create document signed URL: ${signedUrlError.message}`);
  }

  if (!signedUrlData?.signedUrl) {
    throw new Error("Signed URL generation failed.");
  }

  return {
    document: document as RegistrationDocument,
    signedUrl: signedUrlData.signedUrl,
    expiresIn: SIGNED_URL_EXPIRES_IN_SECONDS
  };
}
