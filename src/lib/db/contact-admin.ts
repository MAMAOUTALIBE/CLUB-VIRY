import "server-only";

import type { AdminContactMessageReviewPayload, AdminNotificationUpdatePayload } from "@/lib/api/validation";
import { recordActivity } from "@/lib/db/foundations";
import { queueAdminNotification } from "@/lib/db/notifications";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import type { ActivityLog, ContactMessage, NotificationLog, Registration } from "@/lib/db/types";

export type CreateContactMessageInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type DashboardMetricKey =
  | "profiles"
  | "families"
  | "players"
  | "registrations"
  | "pendingRegistrations"
  | "teams"
  | "matches"
  | "orders"
  | "payments"
  | "contactMessages"
  | "recruitmentApplications";

export type DashboardMetric = {
  key: DashboardMetricKey;
  label: string;
  count: number;
};

export type StatusCount = {
  status: string;
  label: string;
  count: number;
};

export type MonthlyPoint = {
  label: string;
  count: number;
};

export type DashboardBreakdowns = {
  registrations: StatusCount[];
  orders: StatusCount[];
  payments: StatusCount[];
  recruitment: StatusCount[];
  monthlyRegistrations: MonthlyPoint[];
};

export type AdminDashboard = {
  metrics: DashboardMetric[];
  breakdowns: DashboardBreakdowns;
  latestLogs: ActivityLog[];
  queuedNotifications: number;
};

export async function createContactMessage(input: CreateContactMessageInput): Promise<ContactMessage> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.subject,
      message: input.message,
      source: input.source ?? "contact_page",
      metadata: input.metadata ?? {},
      status: "PENDING"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create contact message: ${error.message}`);
  }

  await queueAdminNotification(
    {
      template: "contact_message_received",
      subject: `Nouveau message contact : ${input.subject}`,
      payload: {
        contactMessageId: data.id,
        fullName: input.fullName,
        email: input.email,
        subject: input.subject
      }
    },
    supabase
  );

  await recordActivity({
    action: "contact.message_created",
    entityType: "contact_message",
    entityId: data.id,
    metadata: {
      fullName: input.fullName,
      email: input.email,
      subject: input.subject,
      source: input.source ?? "contact_page"
    }
  });

  return data as ContactMessage;
}

export async function listContactMessagesForAdmin(limit = 100): Promise<ContactMessage[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch contact messages: ${error.message}`);
  }

  return (data ?? []) as ContactMessage[];
}

export async function reviewContactMessage(id: string, input: AdminContactMessageReviewPayload): Promise<ContactMessage> {
  const { data, error } = await getSupabaseAdminClient()
    .from("contact_messages")
    .update({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.assignedTo !== undefined ? { assigned_to: input.assignedTo } : {}),
      ...(input.respondedAt !== undefined ? { responded_at: input.respondedAt } : {})
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to review contact message: ${error.message}`);
  }

  return data as ContactMessage;
}

async function countRows(table: string): Promise<number> {
  const { count, error } = await getSupabaseAdminClient().from(table).select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Unable to count ${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function countRowsByEq(table: string, column: string, value: string): Promise<number> {
  const { count, error } = await getSupabaseAdminClient()
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, value);

  if (error) {
    throw new Error(`Unable to count ${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function countRowsByIn(table: string, column: string, values: readonly string[]): Promise<number> {
  const { count, error } = await getSupabaseAdminClient()
    .from(table)
    .select("*", { count: "exact", head: true })
    .in(column, values);

  if (error) {
    throw new Error(`Unable to count ${table}: ${error.message}`);
  }

  return count ?? 0;
}

type StatusEntry = { status: string; label: string };

const REGISTRATION_STATUSES: readonly StatusEntry[] = [
  { status: "DRAFT", label: "Brouillon" },
  { status: "SUBMITTED", label: "Soumis" },
  { status: "IN_REVIEW", label: "En revue" },
  { status: "MISSING_DOCUMENTS", label: "Documents manquants" },
  { status: "VALIDATED", label: "Validé" },
  { status: "REJECTED", label: "Rejeté" },
  { status: "CANCELLED", label: "Annulé" }
];

const ORDER_STATUSES: readonly StatusEntry[] = [
  { status: "PENDING", label: "En attente" },
  { status: "PAID", label: "Payée" },
  { status: "PREPARING", label: "En préparation" },
  { status: "READY", label: "Prête" },
  { status: "DELIVERED", label: "Livrée" },
  { status: "CANCELLED", label: "Annulée" },
  { status: "REFUNDED", label: "Remboursée" }
];

const PAYMENT_STATUSES: readonly StatusEntry[] = [
  { status: "PENDING", label: "En attente" },
  { status: "SUCCEEDED", label: "Encaissé" },
  { status: "FAILED", label: "Échoué" },
  { status: "CANCELLED", label: "Annulé" },
  { status: "REFUNDED", label: "Remboursé" }
];

const RECRUITMENT_STATUSES: readonly StatusEntry[] = [
  { status: "PENDING", label: "En attente" },
  { status: "CONTACTED", label: "Contacté" },
  { status: "TRIAL_SCHEDULED", label: "Essai planifié" },
  { status: "ACCEPTED", label: "Accepté" },
  { status: "REJECTED", label: "Refusé" },
  { status: "ARCHIVED", label: "Archivé" }
];

async function countByStatus(table: string, column: string, entries: readonly StatusEntry[]): Promise<StatusCount[]> {
  const counts = await Promise.all(entries.map((entry) => countRowsByEq(table, column, entry.status)));
  return entries.map((entry, index) => ({ status: entry.status, label: entry.label, count: counts[index] }));
}

async function monthlyCounts(table: string, dateColumn: string, months: number): Promise<MonthlyPoint[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const { data, error } = await getSupabaseAdminClient()
    .from(table)
    .select(dateColumn)
    .gte(dateColumn, start.toISOString());

  if (error) {
    throw new Error(`Unable to bucket ${table}: ${error.message}`);
  }

  const buckets = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1) + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("fr-FR", { month: "short" }),
      count: 0
    };
  });

  for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
    const raw = row[dateColumn];
    if (typeof raw !== "string") {
      continue;
    }
    const date = new Date(raw);
    const bucket = buckets.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (bucket) {
      bucket.count += 1;
    }
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const [
    profiles,
    families,
    players,
    registrations,
    pendingRegistrations,
    teams,
    matches,
    orders,
    payments,
    contactMessages,
    recruitmentApplications,
    queuedNotifications,
    latestLogs
  ] = await Promise.all([
    countRows("profiles"),
    countRows("families"),
    countRows("players"),
    countRows("registrations"),
    countRowsByIn("registrations", "status", ["SUBMITTED", "IN_REVIEW", "MISSING_DOCUMENTS"]),
    countRows("teams"),
    countRows("matches"),
    countRows("orders"),
    countRows("payments"),
    countRowsByEq("contact_messages", "status", "PENDING"),
    countRowsByEq("recruitment_applications", "status", "PENDING"),
    countRowsByEq("notification_logs", "status", "QUEUED"),
    listActivityLogs(8)
  ]);

  const [
    registrationsByStatus,
    ordersByStatus,
    paymentsByStatus,
    recruitmentByStatus,
    monthlyRegistrations
  ] = await Promise.all([
    countByStatus("registrations", "status", REGISTRATION_STATUSES),
    countByStatus("orders", "status", ORDER_STATUSES),
    countByStatus("payments", "status", PAYMENT_STATUSES),
    countByStatus("recruitment_applications", "status", RECRUITMENT_STATUSES),
    monthlyCounts("registrations", "created_at", 6)
  ]);

  return {
    metrics: [
      { key: "profiles", label: "Profils", count: profiles },
      { key: "families", label: "Familles", count: families },
      { key: "players", label: "Joueurs", count: players },
      { key: "registrations", label: "Inscriptions", count: registrations },
      { key: "pendingRegistrations", label: "Dossiers a traiter", count: pendingRegistrations },
      { key: "teams", label: "Equipes", count: teams },
      { key: "matches", label: "Matchs", count: matches },
      { key: "orders", label: "Commandes", count: orders },
      { key: "payments", label: "Paiements", count: payments },
      { key: "contactMessages", label: "Messages contact", count: contactMessages },
      { key: "recruitmentApplications", label: "Candidatures detection", count: recruitmentApplications }
    ],
    breakdowns: {
      registrations: registrationsByStatus,
      orders: ordersByStatus,
      payments: paymentsByStatus,
      recruitment: recruitmentByStatus,
      monthlyRegistrations
    },
    latestLogs,
    queuedNotifications
  };
}

export async function listActivityLogs(limit = 30): Promise<ActivityLog[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch activity logs: ${error.message}`);
  }

  return (data ?? []) as ActivityLog[];
}

export async function listNotificationLogs(limit = 30): Promise<NotificationLog[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("notification_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to fetch notification logs: ${error.message}`);
  }

  return (data ?? []) as NotificationLog[];
}

export async function updateNotificationLog(id: string, input: AdminNotificationUpdatePayload): Promise<NotificationLog> {
  const { data, error } = await getSupabaseAdminClient()
    .from("notification_logs")
    .update({
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.providerReference !== undefined ? { provider_reference: input.providerReference } : {}),
      ...(input.errorMessage !== undefined ? { error_message: input.errorMessage } : {}),
      ...(input.sentAt !== undefined ? { sent_at: input.sentAt } : {})
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update notification log: ${error.message}`);
  }

  return data as NotificationLog;
}

export async function listRegistrationsForExport(limit = 1000): Promise<Registration[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to export registrations: ${error.message}`);
  }

  return (data ?? []) as Registration[];
}
