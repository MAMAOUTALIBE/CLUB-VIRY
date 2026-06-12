import type { ValidationIssue } from "@/lib/api/http";

export const PUBLIC_REGISTRATION_ROLES = ["FAMILLE", "JOUEUR", "MEMBRE"] as const;

export type PublicRegistrationRole = (typeof PUBLIC_REGISTRATION_ROLES)[number];

export type RegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: PublicRegistrationRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type PasswordResetPayload = {
  email: string;
};

export type RefreshSessionPayload = {
  refreshToken: string;
};

export type ChildPayload = {
  familyId?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "MASCULIN" | "FEMININ" | "NON_RENSEIGNE";
  categoryId?: string;
};

export type RegistrationPayload = {
  playerId: string;
  seasonId?: string;
  categoryId?: string;
  notes?: string;
};

export type DocumentUploadPayload = {
  registrationId: string;
  documentType: string;
};

export type PartnershipRequestPayload = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  message?: string;
};

export type RecruitmentApplicationPayload = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone?: string;
  currentClub?: string;
  position?: string;
  categoryId?: string;
  message?: string;
};

export type ContactMessagePayload = {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type RegistrationLeadPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  category: string;
  message?: string;
};

export type OrderItemPayload = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type OrderPayload = {
  email: string;
  customerName: string;
  phone?: string;
  notes?: string;
  items: OrderItemPayload[];
};

export type CheckoutPayload = {
  orderId?: string;
  registrationId?: string;
  amountCents?: number;
  provider?: "manual" | "stripe";
};

export type AdminProductCategoryPayload = {
  name?: string;
  slug?: string;
  orderIndex?: number;
  isActive?: boolean;
};

export type AdminProductPayload = {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  priceCents?: number;
  currency?: string;
  orderIndex?: number;
};

export type AdminProductVariantPayload = {
  label?: string;
  sku?: string;
  stockQuantity?: number;
  priceDeltaCents?: number;
  isActive?: boolean;
};

export type AdminOrderStatusPayload = {
  status?: "PENDING" | "PAID" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" | "REFUNDED";
};

export type AdminPaymentUpdatePayload = {
  status?: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";
  providerReference?: string;
  metadata?: Record<string, unknown>;
};

export type AdminNotificationUpdatePayload = {
  status?: "QUEUED" | "SENT" | "FAILED" | "CANCELLED";
  providerReference?: string;
  errorMessage?: string;
  sentAt?: string;
};

export type AdminNewsPayload = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type AdminMatchPayload = {
  teamId?: string;
  seasonId?: string;
  opponentName?: string;
  opponentLogoUrl?: string;
  location?: "HOME" | "AWAY" | "NEUTRAL";
  startsAt?: string;
  venue?: string;
  competition?: string;
  status?: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
  homeScore?: number;
  awayScore?: number;
  notes?: string;
};

export type AdminEventPayload = {
  teamId?: string;
  title?: string;
  type?: "TRAINING" | "MEETING" | "TOURNAMENT" | "CLUB_EVENT" | "DEADLINE" | "OTHER";
  startsAt?: string;
  endsAt?: string;
  venue?: string;
  description?: string;
  visibility?: "PUBLIC" | "MEMBERS" | "STAFF";
  isFeatured?: boolean;
};

export type AdminTeamPayload = {
  seasonId?: string;
  categoryId?: string;
  name?: string;
  slug?: string;
  level?: string;
  ageRange?: string;
  gender?: "MIXTE" | "MASCULIN" | "FEMININ";
  description?: string;
  coverImageUrl?: string;
  orderIndex?: number;
  isActive?: boolean;
};

export type AdminTeamStaffPayload = {
  profileId?: string | null;
  displayName: string;
  roleTitle: string;
  isHeadCoach?: boolean;
};

export type AdminTeamPlayerPayload = {
  playerId: string;
  position?: string;
  shirtNumber?: number;
};

export type AdminRegistrationReviewPayload = {
  status?: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "MISSING_DOCUMENTS" | "VALIDATED" | "REJECTED" | "CANCELLED";
  adminNotes?: string;
  categoryId?: string;
};

export type AdminDocumentReviewPayload = {
  status?: "REQUESTED" | "UPLOADED" | "VALIDATED" | "REJECTED";
  rejectionReason?: string;
};

export type AdminMediaAlbumPayload = {
  title?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
};

export type AdminMediaAssetPayload = {
  albumId?: string;
  type?: "PHOTO" | "VIDEO";
  title?: string;
  url?: string;
  thumbnailUrl?: string;
  altText?: string;
  isFeatured?: boolean;
  publishedAt?: string;
};

export type AdminPartnerPayload = {
  name?: string;
  slug?: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier?: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
};

export type AdminPartnershipRequestReviewPayload = {
  status?: "PENDING" | "CONTACTED" | "ACCEPTED" | "REJECTED" | "ARCHIVED";
};

export type AdminRecruitmentReviewPayload = {
  status?: "PENDING" | "CONTACTED" | "TRIAL_SCHEDULED" | "ACCEPTED" | "REJECTED" | "ARCHIVED";
};

export type AdminContactMessageReviewPayload = {
  status?: "PENDING" | "CONTACTED" | "ACCEPTED" | "REJECTED" | "ARCHIVED";
  assignedTo?: string;
  respondedAt?: string;
};

export type ProfileUpdatePayload = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  birthDate?: string;
};

export type AdminUserUpdatePayload = ProfileUpdatePayload & {
  role?: "SUPER_ADMIN" | "ADMIN_CLUB" | "DIRIGEANT" | "EDUCATEUR" | "FAMILLE" | "JOUEUR" | "MEMBRE" | "PARTENAIRE" | "VISITEUR";
  status?: "ACTIVE" | "PENDING" | "SUSPENDED" | "ARCHIVED";
  email?: string;
};

type ValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      issues: ValidationIssue[];
    };

function asRecord(input: unknown): Record<string, unknown> | null {
  return input !== null && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEmail(value: unknown): string | undefined {
  return normalizeString(value)?.toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordIssues(password: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (password.length < 10) {
    issues.push({ field: "password", message: "Le mot de passe doit contenir au moins 10 caracteres." });
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    issues.push({ field: "password", message: "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre." });
  }

  return issues;
}

function isPublicRegistrationRole(value: unknown): value is PublicRegistrationRole {
  return typeof value === "string" && PUBLIC_REGISTRATION_ROLES.includes(value as PublicRegistrationRole);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidBirthDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const oldestAccepted = new Date("1900-01-01T00:00:00.000Z");

  return date <= now && date >= oldestAccepted && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPersonGender(value: unknown): value is ChildPayload["gender"] {
  return value === "MASCULIN" || value === "FEMININ" || value === "NON_RENSEIGNE";
}

function isPublicationStatus(value: unknown): value is NonNullable<AdminNewsPayload["status"]> {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

function isMatchLocation(value: unknown): value is NonNullable<AdminMatchPayload["location"]> {
  return value === "HOME" || value === "AWAY" || value === "NEUTRAL";
}

function isMatchStatus(value: unknown): value is NonNullable<AdminMatchPayload["status"]> {
  return value === "SCHEDULED" || value === "LIVE" || value === "FINISHED" || value === "POSTPONED" || value === "CANCELLED";
}

function isClubEventType(value: unknown): value is NonNullable<AdminEventPayload["type"]> {
  return value === "TRAINING" || value === "MEETING" || value === "TOURNAMENT" || value === "CLUB_EVENT" || value === "DEADLINE" || value === "OTHER";
}

function isClubEventVisibility(value: unknown): value is NonNullable<AdminEventPayload["visibility"]> {
  return value === "PUBLIC" || value === "MEMBERS" || value === "STAFF";
}

function isCategoryGender(value: unknown): value is NonNullable<AdminTeamPayload["gender"]> {
  return value === "MIXTE" || value === "MASCULIN" || value === "FEMININ";
}

function isRegistrationStatus(value: unknown): value is NonNullable<AdminRegistrationReviewPayload["status"]> {
  return (
    value === "DRAFT" ||
    value === "SUBMITTED" ||
    value === "IN_REVIEW" ||
    value === "MISSING_DOCUMENTS" ||
    value === "VALIDATED" ||
    value === "REJECTED" ||
    value === "CANCELLED"
  );
}

function isDocumentStatus(value: unknown): value is NonNullable<AdminDocumentReviewPayload["status"]> {
  return value === "REQUESTED" || value === "UPLOADED" || value === "VALIDATED" || value === "REJECTED";
}

function isMediaType(value: unknown): value is NonNullable<AdminMediaAssetPayload["type"]> {
  return value === "PHOTO" || value === "VIDEO";
}

function isRequestStatus(value: unknown): value is NonNullable<AdminPartnershipRequestReviewPayload["status"]> {
  return value === "PENDING" || value === "CONTACTED" || value === "ACCEPTED" || value === "REJECTED" || value === "ARCHIVED";
}

function isApplicationStatus(value: unknown): value is NonNullable<AdminRecruitmentReviewPayload["status"]> {
  return value === "PENDING" || value === "CONTACTED" || value === "TRIAL_SCHEDULED" || value === "ACCEPTED" || value === "REJECTED" || value === "ARCHIVED";
}

function isProductStatus(value: unknown): value is NonNullable<AdminProductPayload["status"]> {
  return value === "DRAFT" || value === "ACTIVE" || value === "ARCHIVED";
}

function isOrderStatus(value: unknown): value is NonNullable<AdminOrderStatusPayload["status"]> {
  return value === "PENDING" || value === "PAID" || value === "PREPARING" || value === "READY" || value === "DELIVERED" || value === "CANCELLED" || value === "REFUNDED";
}

function isPaymentStatus(value: unknown): value is NonNullable<AdminPaymentUpdatePayload["status"]> {
  return value === "PENDING" || value === "SUCCEEDED" || value === "FAILED" || value === "CANCELLED" || value === "REFUNDED";
}

function isNotificationStatus(value: unknown): value is NonNullable<AdminNotificationUpdatePayload["status"]> {
  return value === "QUEUED" || value === "SENT" || value === "FAILED" || value === "CANCELLED";
}

function isAppRoleValue(value: unknown): value is NonNullable<AdminUserUpdatePayload["role"]> {
  return (
    value === "SUPER_ADMIN" ||
    value === "ADMIN_CLUB" ||
    value === "DIRIGEANT" ||
    value === "EDUCATEUR" ||
    value === "FAMILLE" ||
    value === "JOUEUR" ||
    value === "MEMBRE" ||
    value === "PARTENAIRE" ||
    value === "VISITEUR"
  );
}

function isProfileStatusValue(value: unknown): value is NonNullable<AdminUserUpdatePayload["status"]> {
  return value === "ACTIVE" || value === "PENDING" || value === "SUSPENDED" || value === "ARCHIVED";
}

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function isSlug(value: string): boolean {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

export function validateRegisterPayload(input: unknown): ValidationResult<RegisterPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const email = normalizeEmail(body.email);
  const password = normalizeString(body.password);
  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const role = normalizeString(body.role) ?? "MEMBRE";

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (!password) {
    issues.push({ field: "password", message: "Mot de passe obligatoire." });
  } else {
    issues.push(...getPasswordIssues(password));
  }

  if (!isPublicRegistrationRole(role)) {
    issues.push({
      field: "role",
      message: "Role non autorise pour une inscription publique."
    });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      email: email as string,
      password: password as string,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      role: role as PublicRegistrationRole
    }
  };
}

export function validateLoginPayload(input: unknown): ValidationResult<LoginPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const email = normalizeEmail(body.email);
  const password = normalizeString(body.password);

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (!password) {
    issues.push({ field: "password", message: "Mot de passe obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, data: { email: email as string, password: password as string } };
}

export function validatePasswordResetPayload(input: unknown): ValidationResult<PasswordResetPayload> {
  const body = asRecord(input);
  const email = body ? normalizeEmail(body.email) : undefined;

  if (!email || !isValidEmail(email)) {
    return { ok: false, issues: [{ field: "email", message: "Adresse email invalide." }] };
  }

  return { ok: true, data: { email } };
}

export function validateRefreshSessionPayload(input: unknown): ValidationResult<RefreshSessionPayload> {
  const body = asRecord(input);
  const refreshToken = body ? normalizeString(body.refreshToken) : undefined;

  if (!refreshToken || refreshToken.length < 20) {
    return { ok: false, issues: [{ field: "refreshToken", message: "Refresh token invalide." }] };
  }

  return { ok: true, data: { refreshToken } };
}

export function validateChildPayload(input: unknown): ValidationResult<ChildPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const familyId = normalizeString(body.familyId);
  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const birthDate = normalizeString(body.birthDate);
  const gender = normalizeString(body.gender) ?? "NON_RENSEIGNE";
  const categoryId = normalizeString(body.categoryId);

  if (familyId && !isUuid(familyId)) {
    issues.push({ field: "familyId", message: "Identifiant famille invalide." });
  }

  if (!firstName || firstName.length < 2 || firstName.length > 80) {
    issues.push({ field: "firstName", message: "Prenom invalide." });
  }

  if (!lastName || lastName.length < 2 || lastName.length > 80) {
    issues.push({ field: "lastName", message: "Nom invalide." });
  }

  if (!birthDate || !isValidBirthDate(birthDate)) {
    issues.push({ field: "birthDate", message: "Date de naissance invalide." });
  }

  if (!isPersonGender(gender)) {
    issues.push({ field: "gender", message: "Genre invalide." });
  }

  if (categoryId && !isUuid(categoryId)) {
    issues.push({ field: "categoryId", message: "Identifiant categorie invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(familyId ? { familyId } : {}),
      firstName: firstName as string,
      lastName: lastName as string,
      birthDate: birthDate as string,
      gender: gender as ChildPayload["gender"],
      ...(categoryId ? { categoryId } : {})
    }
  };
}

export function validateRegistrationPayload(input: unknown): ValidationResult<RegistrationPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const playerId = normalizeString(body.playerId);
  const seasonId = normalizeString(body.seasonId);
  const categoryId = normalizeString(body.categoryId);
  const notes = normalizeString(body.notes);

  if (!playerId || !isUuid(playerId)) {
    issues.push({ field: "playerId", message: "Identifiant joueur invalide." });
  }

  if (seasonId && !isUuid(seasonId)) {
    issues.push({ field: "seasonId", message: "Identifiant saison invalide." });
  }

  if (categoryId && !isUuid(categoryId)) {
    issues.push({ field: "categoryId", message: "Identifiant categorie invalide." });
  }

  if (notes && notes.length > 1000) {
    issues.push({ field: "notes", message: "La note ne doit pas depasser 1000 caracteres." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      playerId: playerId as string,
      ...(seasonId ? { seasonId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(notes ? { notes } : {})
    }
  };
}

export function validateDocumentUploadPayload(input: unknown): ValidationResult<DocumentUploadPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const registrationId = normalizeString(body.registrationId);
  const documentType = normalizeString(body.documentType);

  if (!registrationId || !isUuid(registrationId)) {
    issues.push({ field: "registrationId", message: "Identifiant dossier invalide." });
  }

  if (!documentType || !/^[a-z0-9_-]{2,60}$/i.test(documentType)) {
    issues.push({ field: "documentType", message: "Type de document invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      registrationId: registrationId as string,
      documentType: documentType as string
    }
  };
}

export function validatePartnershipRequestPayload(input: unknown): ValidationResult<PartnershipRequestPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const companyName = normalizeString(body.companyName);
  const contactName = normalizeString(body.contactName);
  const email = normalizeEmail(body.email);
  const phone = normalizeString(body.phone);
  const message = normalizeString(body.message);

  if (!companyName || companyName.length < 2 || companyName.length > 120) {
    issues.push({ field: "companyName", message: "Nom de societe invalide." });
  }

  if (!contactName || contactName.length < 2 || contactName.length > 120) {
    issues.push({ field: "contactName", message: "Nom du contact invalide." });
  }

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (phone && (phone.length < 6 || phone.length > 32)) {
    issues.push({ field: "phone", message: "Telephone invalide." });
  }

  if (message && message.length > 1500) {
    issues.push({ field: "message", message: "Message trop long." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      companyName: companyName as string,
      contactName: contactName as string,
      email: email as string,
      ...(phone ? { phone } : {}),
      ...(message ? { message } : {})
    }
  };
}

export function validateRecruitmentApplicationPayload(input: unknown): ValidationResult<RecruitmentApplicationPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const birthDate = normalizeString(body.birthDate);
  const email = normalizeEmail(body.email);
  const phone = normalizeString(body.phone);
  const currentClub = normalizeString(body.currentClub);
  const position = normalizeString(body.position);
  const categoryId = normalizeString(body.categoryId);
  const message = normalizeString(body.message);

  if (!firstName || firstName.length < 2 || firstName.length > 80) {
    issues.push({ field: "firstName", message: "Prenom invalide." });
  }

  if (!lastName || lastName.length < 2 || lastName.length > 80) {
    issues.push({ field: "lastName", message: "Nom invalide." });
  }

  if (!birthDate || !isValidBirthDate(birthDate)) {
    issues.push({ field: "birthDate", message: "Date de naissance invalide." });
  }

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (phone && (phone.length < 6 || phone.length > 32)) {
    issues.push({ field: "phone", message: "Telephone invalide." });
  }

  if (categoryId && !isUuid(categoryId)) {
    issues.push({ field: "categoryId", message: "Identifiant categorie invalide." });
  }

  if (message && message.length > 1500) {
    issues.push({ field: "message", message: "Message trop long." });
  }

  if (!position || position.length < 2 || position.length > 80) {
    issues.push({ field: "position", message: "Poste invalide." });
  }

  if (!currentClub || currentClub.length < 2 || currentClub.length > 120) {
    issues.push({ field: "currentClub", message: "Club actuel invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      firstName: firstName as string,
      lastName: lastName as string,
      birthDate: birthDate as string,
      email: email as string,
      ...(phone ? { phone } : {}),
      ...(currentClub ? { currentClub } : {}),
      ...(position ? { position } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(message ? { message } : {})
    }
  };
}

export function validateContactMessagePayload(input: unknown): ValidationResult<ContactMessagePayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const fullName = normalizeString(body.fullName);
  const email = normalizeEmail(body.email);
  const phone = normalizeString(body.phone);
  const subject = normalizeString(body.subject);
  const message = normalizeString(body.message);

  if (!fullName || fullName.length < 2 || fullName.length > 160) {
    issues.push({ field: "fullName", message: "Nom complet invalide." });
  }

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (phone && (phone.length < 6 || phone.length > 32)) {
    issues.push({ field: "phone", message: "Telephone invalide." });
  }

  if (!subject || subject.length < 2 || subject.length > 180) {
    issues.push({ field: "subject", message: "Sujet invalide." });
  }

  if (!message || message.length < 10 || message.length > 3000) {
    issues.push({ field: "message", message: "Message invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      fullName: fullName as string,
      email: email as string,
      ...(phone ? { phone } : {}),
      subject: subject as string,
      message: message as string
    }
  };
}

export function validateRegistrationLeadPayload(input: unknown): ValidationResult<RegistrationLeadPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const email = normalizeEmail(body.email);
  const phone = normalizeString(body.phone);
  const birthDate = normalizeString(body.birthDate);
  const category = normalizeString(body.category);
  const message = normalizeString(body.message);

  if (!firstName || firstName.length < 2 || firstName.length > 80) {
    issues.push({ field: "firstName", message: "Prenom invalide." });
  }

  if (!lastName || lastName.length < 2 || lastName.length > 80) {
    issues.push({ field: "lastName", message: "Nom invalide." });
  }

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (!phone || phone.length < 6 || phone.length > 32) {
    issues.push({ field: "phone", message: "Telephone invalide." });
  }

  if (!birthDate || !isValidBirthDate(birthDate)) {
    issues.push({ field: "birthDate", message: "Date de naissance invalide." });
  }

  if (!category || category.length < 2 || category.length > 120) {
    issues.push({ field: "category", message: "Categorie souhaitee invalide." });
  }

  if (message && message.length > 1500) {
    issues.push({ field: "message", message: "Message trop long." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      firstName: firstName as string,
      lastName: lastName as string,
      email: email as string,
      phone: phone as string,
      birthDate: birthDate as string,
      category: category as string,
      ...(message ? { message } : {})
    }
  };
}

export function validateOrderPayload(input: unknown): ValidationResult<OrderPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const email = normalizeEmail(body.email);
  const customerName = normalizeString(body.customerName);
  const phone = normalizeString(body.phone);
  const notes = normalizeString(body.notes);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!email || !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (!customerName || customerName.length < 2 || customerName.length > 160) {
    issues.push({ field: "customerName", message: "Nom client invalide." });
  }

  if (phone && (phone.length < 6 || phone.length > 32)) {
    issues.push({ field: "phone", message: "Telephone invalide." });
  }

  if (notes && notes.length > 1000) {
    issues.push({ field: "notes", message: "Note trop longue." });
  }

  if (items.length === 0 || items.length > 30) {
    issues.push({ field: "items", message: "La commande doit contenir entre 1 et 30 lignes." });
  }

  const normalizedItems: OrderItemPayload[] = [];

  items.forEach((item, index) => {
    const record = asRecord(item);
    const productId = record ? normalizeString(record.productId) : undefined;
    const variantId = record ? normalizeString(record.variantId) : undefined;
    const quantity = record && typeof record.quantity === "number" ? record.quantity : Number.NaN;

    if (!productId || !isUuid(productId)) {
      issues.push({ field: `items.${index}.productId`, message: "Identifiant produit invalide." });
    }

    if (variantId && !isUuid(variantId)) {
      issues.push({ field: `items.${index}.variantId`, message: "Identifiant variante invalide." });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      issues.push({ field: `items.${index}.quantity`, message: "Quantite invalide." });
    }

    if (productId && isUuid(productId) && Number.isInteger(quantity) && quantity >= 1 && quantity <= 20) {
      normalizedItems.push({
        productId,
        ...(variantId && isUuid(variantId) ? { variantId } : {}),
        quantity
      });
    }
  });

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      email: email as string,
      customerName: customerName as string,
      ...(phone ? { phone } : {}),
      ...(notes ? { notes } : {}),
      items: normalizedItems
    }
  };
}

export function validateCheckoutPayload(input: unknown): ValidationResult<CheckoutPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const orderId = normalizeString(body.orderId);
  const registrationId = normalizeString(body.registrationId);
  const amountCents = typeof body.amountCents === "number" ? body.amountCents : undefined;
  const provider = normalizeString(body.provider) ?? "manual";

  if (!orderId && !registrationId) {
    issues.push({ field: "target", message: "Une commande ou une inscription est obligatoire." });
  }

  if (orderId && !isUuid(orderId)) {
    issues.push({ field: "orderId", message: "Identifiant commande invalide." });
  }

  if (registrationId && !isUuid(registrationId)) {
    issues.push({ field: "registrationId", message: "Identifiant inscription invalide." });
  }

  if (amountCents !== undefined && (!Number.isInteger(amountCents) || amountCents < 0)) {
    issues.push({ field: "amountCents", message: "Montant invalide." });
  }

  if (provider !== "manual" && provider !== "stripe") {
    issues.push({ field: "provider", message: "Prestataire de paiement invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(orderId ? { orderId } : {}),
      ...(registrationId ? { registrationId } : {}),
      ...(amountCents !== undefined ? { amountCents } : {}),
      provider: provider as CheckoutPayload["provider"]
    }
  };
}

export function validateAdminProductCategoryPayload(
  input: unknown,
  options: { partial?: boolean } = {}
): ValidationResult<AdminProductCategoryPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const name = normalizeString(body.name);
  const slug = normalizeString(body.slug);
  const orderIndex = typeof body.orderIndex === "number" ? body.orderIndex : undefined;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

  if (!options.partial && (!name || name.length < 2 || name.length > 120)) {
    issues.push({ field: "name", message: "Nom categorie produit invalide." });
  }

  if (name && (name.length < 2 || name.length > 120)) {
    issues.push({ field: "name", message: "Nom categorie produit invalide." });
  }

  if (slug && !isSlug(slug)) {
    issues.push({ field: "slug", message: "Slug categorie produit invalide." });
  }

  if (orderIndex !== undefined && (!Number.isInteger(orderIndex) || orderIndex < -1000 || orderIndex > 1000)) {
    issues.push({ field: "orderIndex", message: "Ordre categorie produit invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...(orderIndex !== undefined ? { orderIndex } : {}),
      ...(isActive !== undefined ? { isActive } : {})
    }
  };
}

export function validateAdminProductPayload(input: unknown, options: { partial?: boolean } = {}): ValidationResult<AdminProductPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const categoryId = normalizeString(body.categoryId);
  const name = normalizeString(body.name);
  const slug = normalizeString(body.slug);
  const description = normalizeString(body.description);
  const imageUrl = normalizeString(body.imageUrl);
  const status = normalizeString(body.status);
  const priceCents = typeof body.priceCents === "number" ? body.priceCents : undefined;
  const currency = normalizeString(body.currency) ?? "EUR";
  const orderIndex = typeof body.orderIndex === "number" ? body.orderIndex : undefined;

  if (categoryId && !isUuid(categoryId)) {
    issues.push({ field: "categoryId", message: "Identifiant categorie produit invalide." });
  }

  if (!options.partial && (!name || name.length < 2 || name.length > 180)) {
    issues.push({ field: "name", message: "Nom produit invalide." });
  }

  if (name && (name.length < 2 || name.length > 180)) {
    issues.push({ field: "name", message: "Nom produit invalide." });
  }

  if (slug && !isSlug(slug)) {
    issues.push({ field: "slug", message: "Slug produit invalide." });
  }

  if (description && description.length > 2000) {
    issues.push({ field: "description", message: "Description produit trop longue." });
  }

  if (status && !isProductStatus(status)) {
    issues.push({ field: "status", message: "Statut produit invalide." });
  }

  if (!options.partial && (priceCents === undefined || !Number.isInteger(priceCents) || priceCents < 0)) {
    issues.push({ field: "priceCents", message: "Prix produit invalide." });
  }

  if (priceCents !== undefined && (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > 1000000)) {
    issues.push({ field: "priceCents", message: "Prix produit invalide." });
  }

  if (currency !== "EUR") {
    issues.push({ field: "currency", message: "Devise produit invalide." });
  }

  if (orderIndex !== undefined && (!Number.isInteger(orderIndex) || orderIndex < -1000 || orderIndex > 1000)) {
    issues.push({ field: "orderIndex", message: "Ordre produit invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(categoryId ? { categoryId } : {}),
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...(description ? { description } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(status ? { status: status as AdminProductPayload["status"] } : {}),
      ...(priceCents !== undefined ? { priceCents } : {}),
      currency,
      ...(orderIndex !== undefined ? { orderIndex } : {})
    }
  };
}

export function validateAdminProductVariantPayload(
  input: unknown,
  options: { partial?: boolean } = {}
): ValidationResult<AdminProductVariantPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const label = normalizeString(body.label);
  const sku = normalizeString(body.sku);
  const stockQuantity = typeof body.stockQuantity === "number" ? body.stockQuantity : undefined;
  const priceDeltaCents = typeof body.priceDeltaCents === "number" ? body.priceDeltaCents : undefined;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

  if (!options.partial && (!label || label.length < 1 || label.length > 120)) {
    issues.push({ field: "label", message: "Libelle variante invalide." });
  }

  if (label && label.length > 120) {
    issues.push({ field: "label", message: "Libelle variante invalide." });
  }

  if (sku && sku.length > 80) {
    issues.push({ field: "sku", message: "SKU trop long." });
  }

  if (stockQuantity !== undefined && (!Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 100000)) {
    issues.push({ field: "stockQuantity", message: "Stock variante invalide." });
  }

  if (priceDeltaCents !== undefined && (!Number.isInteger(priceDeltaCents) || priceDeltaCents < -100000 || priceDeltaCents > 100000)) {
    issues.push({ field: "priceDeltaCents", message: "Difference prix variante invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(label ? { label } : {}),
      ...(sku ? { sku } : {}),
      ...(stockQuantity !== undefined ? { stockQuantity } : {}),
      ...(priceDeltaCents !== undefined ? { priceDeltaCents } : {}),
      ...(isActive !== undefined ? { isActive } : {})
    }
  };
}

export function validateAdminOrderStatusPayload(input: unknown): ValidationResult<AdminOrderStatusPayload> {
  const body = asRecord(input);
  const status = body ? normalizeString(body.status) : undefined;

  if (!status || !isOrderStatus(status)) {
    return { ok: false, issues: [{ field: "status", message: "Statut commande invalide." }] };
  }

  return { ok: true, data: { status: status as AdminOrderStatusPayload["status"] } };
}

export function validateAdminPaymentUpdatePayload(input: unknown): ValidationResult<AdminPaymentUpdatePayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const status = normalizeString(body.status);
  const providerReference = normalizeString(body.providerReference);
  const metadata = asRecord(body.metadata);

  if (!status && !providerReference && body.metadata === undefined) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (status && !isPaymentStatus(status)) {
    issues.push({ field: "status", message: "Statut paiement invalide." });
  }

  if (providerReference && providerReference.length > 180) {
    issues.push({ field: "providerReference", message: "Reference prestataire trop longue." });
  }

  if (body.metadata !== undefined && !metadata) {
    issues.push({ field: "metadata", message: "Metadata paiement invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(status ? { status: status as AdminPaymentUpdatePayload["status"] } : {}),
      ...(providerReference ? { providerReference } : {}),
      ...(metadata ? { metadata } : {})
    }
  };
}

export function validateAdminNotificationUpdatePayload(input: unknown): ValidationResult<AdminNotificationUpdatePayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const status = normalizeString(body.status);
  const providerReference = normalizeString(body.providerReference);
  const errorMessage = normalizeString(body.errorMessage);
  const sentAt = normalizeString(body.sentAt);

  if (!status && !providerReference && !errorMessage && !sentAt) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (status && !isNotificationStatus(status)) {
    issues.push({ field: "status", message: "Statut notification invalide." });
  }

  if (providerReference && providerReference.length > 180) {
    issues.push({ field: "providerReference", message: "Reference prestataire trop longue." });
  }

  if (errorMessage && errorMessage.length > 1000) {
    issues.push({ field: "errorMessage", message: "Erreur notification trop longue." });
  }

  if (sentAt && !isIsoDateTime(sentAt)) {
    issues.push({ field: "sentAt", message: "Date envoi notification invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(status ? { status: status as AdminNotificationUpdatePayload["status"] } : {}),
      ...(providerReference ? { providerReference } : {}),
      ...(errorMessage ? { errorMessage } : {}),
      ...(sentAt ? { sentAt } : {})
    }
  };
}

export function validateAdminNewsPayload(input: unknown, options: { partial?: boolean } = {}): ValidationResult<AdminNewsPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const title = normalizeString(body.title);
  const slug = normalizeString(body.slug);
  const excerpt = normalizeString(body.excerpt);
  const content = normalizeString(body.content);
  const coverImageUrl = normalizeString(body.coverImageUrl);
  const status = normalizeString(body.status);
  const publishedAt = normalizeString(body.publishedAt);
  const seoTitle = normalizeString(body.seoTitle);
  const seoDescription = normalizeString(body.seoDescription);

  if (!options.partial && (!title || title.length < 3 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre invalide." });
  }

  if (title && (title.length < 3 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre invalide." });
  }

  if (slug && !isSlug(slug)) {
    issues.push({ field: "slug", message: "Slug invalide." });
  }

  if (!options.partial && (!content || content.length < 20)) {
    issues.push({ field: "content", message: "Contenu invalide." });
  }

  if (content && content.length < 20) {
    issues.push({ field: "content", message: "Contenu invalide." });
  }

  if (excerpt && excerpt.length > 300) {
    issues.push({ field: "excerpt", message: "Extrait trop long." });
  }

  if (status && !isPublicationStatus(status)) {
    issues.push({ field: "status", message: "Statut de publication invalide." });
  }

  if (publishedAt && !isIsoDateTime(publishedAt)) {
    issues.push({ field: "publishedAt", message: "Date de publication invalide." });
  }

  if (seoTitle && seoTitle.length > 180) {
    issues.push({ field: "seoTitle", message: "Titre SEO trop long." });
  }

  if (seoDescription && seoDescription.length > 300) {
    issues.push({ field: "seoDescription", message: "Description SEO trop longue." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(title ? { title } : {}),
      ...(slug ? { slug } : {}),
      ...(excerpt ? { excerpt } : {}),
      ...(content ? { content } : {}),
      ...(coverImageUrl ? { coverImageUrl } : {}),
      ...(status ? { status: status as AdminNewsPayload["status"] } : {}),
      ...(publishedAt ? { publishedAt } : {}),
      ...(seoTitle ? { seoTitle } : {}),
      ...(seoDescription ? { seoDescription } : {})
    }
  };
}

export function validateAdminMatchPayload(input: unknown, options: { partial?: boolean } = {}): ValidationResult<AdminMatchPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const teamId = normalizeString(body.teamId);
  const seasonId = normalizeString(body.seasonId);
  const opponentName = normalizeString(body.opponentName);
  const opponentLogoUrl = normalizeString(body.opponentLogoUrl);
  const location = normalizeString(body.location);
  const startsAt = normalizeString(body.startsAt);
  const venue = normalizeString(body.venue);
  const competition = normalizeString(body.competition);
  const status = normalizeString(body.status);
  const homeScore = typeof body.homeScore === "number" ? body.homeScore : undefined;
  const awayScore = typeof body.awayScore === "number" ? body.awayScore : undefined;
  const notes = normalizeString(body.notes);

  if (teamId && !isUuid(teamId)) {
    issues.push({ field: "teamId", message: "Identifiant equipe invalide." });
  }

  if (seasonId && !isUuid(seasonId)) {
    issues.push({ field: "seasonId", message: "Identifiant saison invalide." });
  }

  if (!options.partial && (!opponentName || opponentName.length < 2 || opponentName.length > 160)) {
    issues.push({ field: "opponentName", message: "Adversaire invalide." });
  }

  if (opponentName && (opponentName.length < 2 || opponentName.length > 160)) {
    issues.push({ field: "opponentName", message: "Adversaire invalide." });
  }

  if (location && !isMatchLocation(location)) {
    issues.push({ field: "location", message: "Lieu du match invalide." });
  }

  if (!options.partial && (!startsAt || !isIsoDateTime(startsAt))) {
    issues.push({ field: "startsAt", message: "Date du match invalide." });
  }

  if (startsAt && !isIsoDateTime(startsAt)) {
    issues.push({ field: "startsAt", message: "Date du match invalide." });
  }

  if (status && !isMatchStatus(status)) {
    issues.push({ field: "status", message: "Statut du match invalide." });
  }

  if (homeScore !== undefined && (!Number.isInteger(homeScore) || homeScore < 0 || homeScore > 99)) {
    issues.push({ field: "homeScore", message: "Score domicile invalide." });
  }

  if (awayScore !== undefined && (!Number.isInteger(awayScore) || awayScore < 0 || awayScore > 99)) {
    issues.push({ field: "awayScore", message: "Score exterieur invalide." });
  }

  if (notes && notes.length > 1000) {
    issues.push({ field: "notes", message: "Notes trop longues." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(teamId ? { teamId } : {}),
      ...(seasonId ? { seasonId } : {}),
      ...(opponentName ? { opponentName } : {}),
      ...(opponentLogoUrl ? { opponentLogoUrl } : {}),
      ...(location ? { location: location as AdminMatchPayload["location"] } : {}),
      ...(startsAt ? { startsAt } : {}),
      ...(venue ? { venue } : {}),
      ...(competition ? { competition } : {}),
      ...(status ? { status: status as AdminMatchPayload["status"] } : {}),
      ...(homeScore !== undefined ? { homeScore } : {}),
      ...(awayScore !== undefined ? { awayScore } : {}),
      ...(notes ? { notes } : {})
    }
  };
}

export function validateAdminEventPayload(input: unknown, options: { partial?: boolean } = {}): ValidationResult<AdminEventPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const teamId = normalizeString(body.teamId);
  const title = normalizeString(body.title);
  const type = normalizeString(body.type);
  const startsAt = normalizeString(body.startsAt);
  const endsAt = normalizeString(body.endsAt);
  const venue = normalizeString(body.venue);
  const description = normalizeString(body.description);
  const visibility = normalizeString(body.visibility);
  const isFeatured = typeof body.isFeatured === "boolean" ? body.isFeatured : undefined;

  if (teamId && !isUuid(teamId)) {
    issues.push({ field: "teamId", message: "Identifiant equipe invalide." });
  }

  if (!options.partial && (!title || title.length < 2 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre evenement invalide." });
  }

  if (title && (title.length < 2 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre evenement invalide." });
  }

  if (type && !isClubEventType(type)) {
    issues.push({ field: "type", message: "Type evenement invalide." });
  }

  if (!options.partial && (!startsAt || !isIsoDateTime(startsAt))) {
    issues.push({ field: "startsAt", message: "Date de debut evenement invalide." });
  }

  if (startsAt && !isIsoDateTime(startsAt)) {
    issues.push({ field: "startsAt", message: "Date de debut evenement invalide." });
  }

  if (endsAt && !isIsoDateTime(endsAt)) {
    issues.push({ field: "endsAt", message: "Date de fin evenement invalide." });
  }

  if (startsAt && endsAt && isIsoDateTime(startsAt) && isIsoDateTime(endsAt) && new Date(endsAt) < new Date(startsAt)) {
    issues.push({ field: "endsAt", message: "La fin doit etre apres le debut." });
  }

  if (venue && venue.length > 180) {
    issues.push({ field: "venue", message: "Lieu evenement trop long." });
  }

  if (description && description.length > 2000) {
    issues.push({ field: "description", message: "Description evenement trop longue." });
  }

  if (visibility && !isClubEventVisibility(visibility)) {
    issues.push({ field: "visibility", message: "Visibilite evenement invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(teamId ? { teamId } : {}),
      ...(title ? { title } : {}),
      ...(type ? { type: type as AdminEventPayload["type"] } : {}),
      ...(startsAt ? { startsAt } : {}),
      ...(endsAt ? { endsAt } : {}),
      ...(venue ? { venue } : {}),
      ...(description ? { description } : {}),
      ...(visibility ? { visibility: visibility as AdminEventPayload["visibility"] } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {})
    }
  };
}

export function validateAdminTeamPayload(input: unknown, options: { partial?: boolean } = {}): ValidationResult<AdminTeamPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const seasonId = normalizeString(body.seasonId);
  const categoryId = normalizeString(body.categoryId);
  const name = normalizeString(body.name);
  const slug = normalizeString(body.slug);
  const level = normalizeString(body.level);
  const ageRange = normalizeString(body.ageRange);
  const gender = normalizeString(body.gender);
  const description = normalizeString(body.description);
  const coverImageUrl = normalizeString(body.coverImageUrl);
  const orderIndex = typeof body.orderIndex === "number" ? body.orderIndex : undefined;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

  if (seasonId && !isUuid(seasonId)) {
    issues.push({ field: "seasonId", message: "Identifiant saison invalide." });
  }

  if (categoryId && !isUuid(categoryId)) {
    issues.push({ field: "categoryId", message: "Identifiant categorie invalide." });
  }

  if (!options.partial && (!name || name.length < 2 || name.length > 120)) {
    issues.push({ field: "name", message: "Nom equipe invalide." });
  }

  if (name && (name.length < 2 || name.length > 120)) {
    issues.push({ field: "name", message: "Nom equipe invalide." });
  }

  if (slug && !isSlug(slug)) {
    issues.push({ field: "slug", message: "Slug equipe invalide." });
  }

  if (level && level.length > 80) {
    issues.push({ field: "level", message: "Niveau trop long." });
  }

  if (ageRange && ageRange.length > 80) {
    issues.push({ field: "ageRange", message: "Age trop long." });
  }

  if (gender && !isCategoryGender(gender)) {
    issues.push({ field: "gender", message: "Genre equipe invalide." });
  }

  if (description && description.length > 2000) {
    issues.push({ field: "description", message: "Description trop longue." });
  }

  if (orderIndex !== undefined && (!Number.isInteger(orderIndex) || orderIndex < -1000 || orderIndex > 1000)) {
    issues.push({ field: "orderIndex", message: "Ordre d'affichage invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(seasonId ? { seasonId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...(level ? { level } : {}),
      ...(ageRange ? { ageRange } : {}),
      ...(gender ? { gender: gender as AdminTeamPayload["gender"] } : {}),
      ...(description ? { description } : {}),
      ...(coverImageUrl ? { coverImageUrl } : {}),
      ...(orderIndex !== undefined ? { orderIndex } : {}),
      ...(isActive !== undefined ? { isActive } : {})
    }
  };
}

export function validateAdminTeamStaffPayload(input: unknown): ValidationResult<AdminTeamStaffPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const normalizedProfileId = normalizeString(body.profileId);
  // Distingue 3 cas : cle absente (= ne pas toucher), null/"" (= delier), uuid (= lier).
  let profileId: string | null | undefined;
  if (body.profileId === null || (body.profileId !== undefined && !normalizedProfileId)) {
    profileId = null;
  } else {
    profileId = normalizedProfileId;
  }
  const displayName = normalizeString(body.displayName);
  const roleTitle = normalizeString(body.roleTitle);
  const isHeadCoach = typeof body.isHeadCoach === "boolean" ? body.isHeadCoach : undefined;

  if (profileId && !isUuid(profileId)) {
    issues.push({ field: "profileId", message: "Identifiant profil invalide." });
  }

  if (!displayName || displayName.length < 2 || displayName.length > 160) {
    issues.push({ field: "displayName", message: "Nom staff invalide." });
  }

  if (!roleTitle || roleTitle.length < 2 || roleTitle.length > 120) {
    issues.push({ field: "roleTitle", message: "Role staff invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(profileId !== undefined ? { profileId } : {}),
      displayName: displayName as string,
      roleTitle: roleTitle as string,
      ...(isHeadCoach !== undefined ? { isHeadCoach } : {})
    }
  };
}

export function validateAdminTeamPlayerPayload(input: unknown): ValidationResult<AdminTeamPlayerPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const playerId = normalizeString(body.playerId);
  const position = normalizeString(body.position);
  const shirtNumber = typeof body.shirtNumber === "number" ? body.shirtNumber : undefined;

  if (!playerId || !isUuid(playerId)) {
    issues.push({ field: "playerId", message: "Identifiant joueur invalide." });
  }

  if (position && position.length > 80) {
    issues.push({ field: "position", message: "Poste trop long." });
  }

  if (shirtNumber !== undefined && (!Number.isInteger(shirtNumber) || shirtNumber < 1 || shirtNumber > 99)) {
    issues.push({ field: "shirtNumber", message: "Numero de maillot invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      playerId: playerId as string,
      ...(position ? { position } : {}),
      ...(shirtNumber !== undefined ? { shirtNumber } : {})
    }
  };
}

export function validateAdminRegistrationReviewPayload(input: unknown): ValidationResult<AdminRegistrationReviewPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const status = normalizeString(body.status);
  const adminNotes = normalizeString(body.adminNotes);
  const categoryId = normalizeString(body.categoryId);

  if (!status && !adminNotes && !categoryId) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (status && !isRegistrationStatus(status)) {
    issues.push({ field: "status", message: "Statut de dossier invalide." });
  }

  if (adminNotes && adminNotes.length > 2000) {
    issues.push({ field: "adminNotes", message: "Note admin trop longue." });
  }

  if (categoryId && !isUuid(categoryId)) {
    issues.push({ field: "categoryId", message: "Identifiant categorie invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(status ? { status: status as AdminRegistrationReviewPayload["status"] } : {}),
      ...(adminNotes ? { adminNotes } : {}),
      ...(categoryId ? { categoryId } : {})
    }
  };
}

export function validateAdminDocumentReviewPayload(input: unknown): ValidationResult<AdminDocumentReviewPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const status = normalizeString(body.status);
  const rejectionReason = normalizeString(body.rejectionReason);

  if (!status && !rejectionReason) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (status && !isDocumentStatus(status)) {
    issues.push({ field: "status", message: "Statut de document invalide." });
  }

  if (status === "REJECTED" && !rejectionReason) {
    issues.push({ field: "rejectionReason", message: "Motif obligatoire quand un document est refuse." });
  }

  if (rejectionReason && rejectionReason.length > 1000) {
    issues.push({ field: "rejectionReason", message: "Motif trop long." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(status ? { status: status as AdminDocumentReviewPayload["status"] } : {}),
      ...(rejectionReason ? { rejectionReason } : {})
    }
  };
}

export function validateAdminMediaAlbumPayload(
  input: unknown,
  options: { partial?: boolean } = {}
): ValidationResult<AdminMediaAlbumPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const title = normalizeString(body.title);
  const slug = normalizeString(body.slug);
  const description = normalizeString(body.description);
  const coverImageUrl = normalizeString(body.coverImageUrl);
  const status = normalizeString(body.status);
  const publishedAt = normalizeString(body.publishedAt);

  if (!options.partial && (!title || title.length < 2 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre album invalide." });
  }

  if (title && (title.length < 2 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre album invalide." });
  }

  if (slug && !isSlug(slug)) {
    issues.push({ field: "slug", message: "Slug album invalide." });
  }

  if (description && description.length > 1000) {
    issues.push({ field: "description", message: "Description album trop longue." });
  }

  if (status && !isPublicationStatus(status)) {
    issues.push({ field: "status", message: "Statut album invalide." });
  }

  if (publishedAt && !isIsoDateTime(publishedAt)) {
    issues.push({ field: "publishedAt", message: "Date publication album invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(title ? { title } : {}),
      ...(slug ? { slug } : {}),
      ...(description ? { description } : {}),
      ...(coverImageUrl ? { coverImageUrl } : {}),
      ...(status ? { status: status as AdminMediaAlbumPayload["status"] } : {}),
      ...(publishedAt ? { publishedAt } : {})
    }
  };
}

export function validateAdminMediaAssetPayload(
  input: unknown,
  options: { partial?: boolean } = {}
): ValidationResult<AdminMediaAssetPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const albumId = normalizeString(body.albumId);
  const type = normalizeString(body.type) ?? "PHOTO";
  const title = normalizeString(body.title);
  const url = normalizeString(body.url);
  const thumbnailUrl = normalizeString(body.thumbnailUrl);
  const altText = normalizeString(body.altText);
  const isFeatured = typeof body.isFeatured === "boolean" ? body.isFeatured : undefined;
  const publishedAt = normalizeString(body.publishedAt);

  if (albumId && !isUuid(albumId)) {
    issues.push({ field: "albumId", message: "Identifiant album invalide." });
  }

  if (type && !isMediaType(type)) {
    issues.push({ field: "type", message: "Type media invalide." });
  }

  if (!options.partial && (!title || title.length < 2 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre media invalide." });
  }

  if (title && (title.length < 2 || title.length > 180)) {
    issues.push({ field: "title", message: "Titre media invalide." });
  }

  if (!options.partial && (!url || url.length > 1000)) {
    issues.push({ field: "url", message: "URL media invalide." });
  }

  if (url && url.length > 1000) {
    issues.push({ field: "url", message: "URL media invalide." });
  }

  if (altText && altText.length > 220) {
    issues.push({ field: "altText", message: "Texte alternatif trop long." });
  }

  if (publishedAt && !isIsoDateTime(publishedAt)) {
    issues.push({ field: "publishedAt", message: "Date publication media invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(albumId ? { albumId } : {}),
      ...(type ? { type: type as AdminMediaAssetPayload["type"] } : {}),
      ...(title ? { title } : {}),
      ...(url ? { url } : {}),
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
      ...(altText ? { altText } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(publishedAt ? { publishedAt } : {})
    }
  };
}

export function validateAdminPartnerPayload(input: unknown, options: { partial?: boolean } = {}): ValidationResult<AdminPartnerPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const name = normalizeString(body.name);
  const slug = normalizeString(body.slug);
  const logoUrl = normalizeString(body.logoUrl);
  const websiteUrl = normalizeString(body.websiteUrl);
  const tier = normalizeString(body.tier);
  const description = normalizeString(body.description);
  const orderIndex = typeof body.orderIndex === "number" ? body.orderIndex : undefined;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

  if (!options.partial && (!name || name.length < 2 || name.length > 180)) {
    issues.push({ field: "name", message: "Nom partenaire invalide." });
  }

  if (name && (name.length < 2 || name.length > 180)) {
    issues.push({ field: "name", message: "Nom partenaire invalide." });
  }

  if (slug && !isSlug(slug)) {
    issues.push({ field: "slug", message: "Slug partenaire invalide." });
  }

  if (tier && tier.length > 80) {
    issues.push({ field: "tier", message: "Pack partenaire trop long." });
  }

  if (description && description.length > 1500) {
    issues.push({ field: "description", message: "Description partenaire trop longue." });
  }

  if (orderIndex !== undefined && (!Number.isInteger(orderIndex) || orderIndex < -1000 || orderIndex > 1000)) {
    issues.push({ field: "orderIndex", message: "Ordre partenaire invalide." });
  }

  if (options.partial && Object.keys(body).length === 0) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      ...(websiteUrl ? { websiteUrl } : {}),
      ...(tier ? { tier } : {}),
      ...(description ? { description } : {}),
      ...(orderIndex !== undefined ? { orderIndex } : {}),
      ...(isActive !== undefined ? { isActive } : {})
    }
  };
}

export function validateAdminPartnershipRequestReviewPayload(
  input: unknown
): ValidationResult<AdminPartnershipRequestReviewPayload> {
  const body = asRecord(input);
  const status = body ? normalizeString(body.status) : undefined;

  if (!status || !isRequestStatus(status)) {
    return { ok: false, issues: [{ field: "status", message: "Statut demande partenaire invalide." }] };
  }

  return { ok: true, data: { status: status as AdminPartnershipRequestReviewPayload["status"] } };
}

export function validateAdminRecruitmentReviewPayload(input: unknown): ValidationResult<AdminRecruitmentReviewPayload> {
  const body = asRecord(input);
  const status = body ? normalizeString(body.status) : undefined;

  if (!status || !isApplicationStatus(status)) {
    return { ok: false, issues: [{ field: "status", message: "Statut candidature detection invalide." }] };
  }

  return { ok: true, data: { status: status as AdminRecruitmentReviewPayload["status"] } };
}

export function validateAdminContactMessageReviewPayload(input: unknown): ValidationResult<AdminContactMessageReviewPayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const status = normalizeString(body.status);
  const assignedTo = normalizeString(body.assignedTo);
  const respondedAt = normalizeString(body.respondedAt);

  if (!status && !assignedTo && !respondedAt) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (status && !isRequestStatus(status)) {
    issues.push({ field: "status", message: "Statut message contact invalide." });
  }

  if (assignedTo && !isUuid(assignedTo)) {
    issues.push({ field: "assignedTo", message: "Identifiant responsable invalide." });
  }

  if (respondedAt && !isIsoDateTime(respondedAt)) {
    issues.push({ field: "respondedAt", message: "Date reponse invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(status ? { status: status as AdminContactMessageReviewPayload["status"] } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      ...(respondedAt ? { respondedAt } : {})
    }
  };
}

export function validateProfileUpdatePayload(input: unknown): ValidationResult<ProfileUpdatePayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const displayName = normalizeString(body.displayName);
  const phone = normalizeString(body.phone);
  const avatarUrl = normalizeString(body.avatarUrl);
  const birthDate = normalizeString(body.birthDate);

  if (!firstName && !lastName && !displayName && !phone && !avatarUrl && !birthDate) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (firstName && (firstName.length < 2 || firstName.length > 80)) {
    issues.push({ field: "firstName", message: "Prenom invalide." });
  }

  if (lastName && (lastName.length < 2 || lastName.length > 80)) {
    issues.push({ field: "lastName", message: "Nom invalide." });
  }

  if (displayName && (displayName.length < 2 || displayName.length > 160)) {
    issues.push({ field: "displayName", message: "Nom affiche invalide." });
  }

  if (phone && (phone.length < 6 || phone.length > 32)) {
    issues.push({ field: "phone", message: "Telephone invalide." });
  }

  if (birthDate && !isValidBirthDate(birthDate)) {
    issues.push({ field: "birthDate", message: "Date de naissance invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(displayName ? { displayName } : {}),
      ...(phone ? { phone } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(birthDate ? { birthDate } : {})
    }
  };
}

export function validateAdminUserUpdatePayload(input: unknown): ValidationResult<AdminUserUpdatePayload> {
  const body = asRecord(input);
  const issues: ValidationIssue[] = [];

  if (!body) {
    return { ok: false, issues: [{ field: "body", message: "Le corps de la requete doit etre un objet JSON." }] };
  }

  const role = normalizeString(body.role);
  const status = normalizeString(body.status);
  const email = normalizeEmail(body.email);
  const hasProfileFields =
    body.firstName !== undefined ||
    body.lastName !== undefined ||
    body.displayName !== undefined ||
    body.phone !== undefined ||
    body.avatarUrl !== undefined ||
    body.birthDate !== undefined;
  const base = hasProfileFields ? validateProfileUpdatePayload(body) : ({ ok: true, data: {} } as const);

  if (!role && !status && !email && !hasProfileFields) {
    issues.push({ field: "body", message: "Au moins un champ est obligatoire." });
  }

  if (!base.ok) {
    issues.push(...base.issues);
  }

  if (role && !isAppRoleValue(role)) {
    issues.push({ field: "role", message: "Role invalide." });
  }

  if (status && !isProfileStatusValue(status)) {
    issues.push({ field: "status", message: "Statut profil invalide." });
  }

  if (email && !isValidEmail(email)) {
    issues.push({ field: "email", message: "Adresse email invalide." });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      ...(base.ok ? base.data : {}),
      ...(role ? { role: role as AdminUserUpdatePayload["role"] } : {}),
      ...(status ? { status: status as AdminUserUpdatePayload["status"] } : {}),
      ...(email ? { email } : {})
    }
  };
}
