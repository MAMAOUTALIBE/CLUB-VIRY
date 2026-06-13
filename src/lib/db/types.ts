import type { AppRole } from "@/lib/auth/roles";

export type ProfileStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "ARCHIVED";
export type CategoryGender = "MIXTE" | "MASCULIN" | "FEMININ";
export type FamilyRelationship = "PARENT" | "LEGAL_GUARDIAN" | "PLAYER" | "OTHER";
export type PersonGender = "MASCULIN" | "FEMININ" | "NON_RENSEIGNE";
export type RegistrationStatus = "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "MISSING_DOCUMENTS" | "VALIDATED" | "REJECTED" | "CANCELLED";
export type DocumentStatus = "REQUESTED" | "UPLOADED" | "VALIDATED" | "REJECTED";
export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
export type MatchLocation = "HOME" | "AWAY" | "NEUTRAL";
export type ClubEventType = "TRAINING" | "MEETING" | "TOURNAMENT" | "CLUB_EVENT" | "DEADLINE" | "OTHER";
export type ClubEventVisibility = "PUBLIC" | "MEMBERS" | "STAFF";
export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type MediaType = "PHOTO" | "VIDEO";
export type RequestStatus = "PENDING" | "CONTACTED" | "ACCEPTED" | "REJECTED" | "ARCHIVED";
export type ApplicationStatus = "PENDING" | "CONTACTED" | "TRIAL_SCHEDULED" | "ACCEPTED" | "REJECTED" | "ARCHIVED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type OrderStatus = "PENDING" | "PAID" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";
export type NotificationStatus = "QUEUED" | "SENDING" | "SENT" | "FAILED" | "CANCELLED";

export type Profile = {
  id: string;
  role: AppRole;
  status: ProfileStatus;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  public_profile: boolean;
  public_title: string | null;
  public_bio: string | null;
  created_at: string;
  updated_at: string;
};

export type OfficialCategory = "BUREAU" | "DIRIGEANT";

export type ClubOfficial = {
  id: string;
  category: OfficialCategory;
  full_name: string;
  position: string;
  photo_url: string | null;
  profile_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Season = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  age_range: string;
  gender: CategoryGender;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type Family = {
  id: string;
  name: string;
  primary_contact_id: string | null;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  family_id: string;
  profile_id: string;
  relationship: FamilyRelationship;
  is_primary_contact: boolean;
  created_at: string;
};

export type Player = {
  id: string;
  family_id: string | null;
  profile_id: string | null;
  category_id: string | null;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: PersonGender;
  license_number: string | null;
  medical_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerGuardian = {
  id: string;
  player_id: string;
  profile_id: string;
  relationship: FamilyRelationship;
  is_primary: boolean;
  can_pick_up: boolean;
  created_at: string;
};

export type Registration = {
  id: string;
  season_id: string;
  family_id: string;
  player_id: string;
  category_id: string | null;
  submitted_by: string | null;
  status: RegistrationStatus;
  notes: string | null;
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RegistrationDocument = {
  id: string;
  registration_id: string;
  document_type: string;
  label: string;
  status: DocumentStatus;
  file_path: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  season_id: string | null;
  category_id: string | null;
  name: string;
  slug: string;
  level: string | null;
  age_range: string | null;
  gender: CategoryGender;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamStaff = {
  id: string;
  team_id: string;
  profile_id: string | null;
  display_name: string;
  role_title: string;
  is_head_coach: boolean;
  created_at: string;
};

export type TeamPlayer = {
  team_id: string;
  player_id: string;
  position: string | null;
  shirt_number: number | null;
  created_at: string;
};

export type Match = {
  id: string;
  team_id: string | null;
  season_id: string | null;
  opponent_name: string;
  opponent_logo_url: string | null;
  location: MatchLocation;
  starts_at: string;
  venue: string | null;
  competition: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ClubEvent = {
  id: string;
  team_id: string | null;
  title: string;
  type: ClubEventType;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  description: string | null;
  visibility: ClubEventVisibility;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: PublicationStatus;
  published_at: string | null;
  author_id: string | null;
  team_id: string | null;
  notified_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaAlbum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  status: PublicationStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  album_id: string | null;
  team_id: string | null;
  type: MediaType;
  title: string;
  url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
};

export type Partner = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnershipRequest = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export type RecruitmentApplication = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  email: string;
  phone: string | null;
  current_club: string | null;
  position: string | null;
  category_id: string | null;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: ProductStatus;
  price_cents: number;
  currency: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  stock_quantity: number;
  price_delta_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  profile_id: string | null;
  email: string;
  customer_name: string;
  phone: string | null;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  label: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  created_at: string;
};

export type Payment = {
  id: string;
  order_id: string | null;
  registration_id: string | null;
  provider: string;
  provider_reference: string | null;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: RequestStatus;
  source: string;
  metadata: Record<string, unknown>;
  assigned_to: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationCategory = "convocation" | "session" | "media" | "news" | "event";

export type NotificationLog = {
  id: string;
  recipient_profile_id: string | null;
  recipient_email: string | null;
  channel: string;
  template: string;
  subject: string | null;
  status: NotificationStatus;
  payload: Record<string, unknown>;
  provider_reference: string | null;
  error_message: string | null;
  sent_at: string | null;
  category: NotificationCategory | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateActivityLogInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};
