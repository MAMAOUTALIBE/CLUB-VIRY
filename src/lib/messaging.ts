/**
 * Catalogue partagé de la messagerie (Phase I) : canaux, statuts de rappel,
 * variables disponibles dans les modèles. Pur (client + serveur).
 */
export const MESSAGE_CHANNELS = [
  { value: "EMAIL", label: "E-mail" },
  { value: "SMS", label: "SMS" },
  { value: "IN_APP", label: "Notification interne" }
] as const;

export type MessageChannel = (typeof MESSAGE_CHANNELS)[number]["value"];
export const MESSAGE_CHANNEL_VALUES = MESSAGE_CHANNELS.map((c) => c.value) as readonly MessageChannel[];
export function messageChannelLabel(value: string): string {
  return MESSAGE_CHANNELS.find((c) => c.value === value)?.label ?? value;
}

export const REMINDER_STATUSES = [
  { value: "PENDING", label: "Planifié" },
  { value: "SENT", label: "Envoyé" },
  { value: "CANCELLED", label: "Annulé" }
] as const;

export type ReminderStatus = (typeof REMINDER_STATUSES)[number]["value"];
export const REMINDER_STATUS_VALUES = REMINDER_STATUSES.map((s) => s.value) as readonly ReminderStatus[];
export function reminderStatusLabel(value: string): string {
  return REMINDER_STATUSES.find((s) => s.value === value)?.label ?? value;
}

/** Variables reconnues dans le corps/objet d'un modèle (documentaire). */
export const MESSAGE_PLACEHOLDERS = ["{prenom}", "{nom}", "{saison}", "{equipe}", "{club}", "{date}"] as const;

/** Remplace les {variables} d'un texte par les valeurs fournies (variables inconnues laissées telles quelles). */
export function renderMessage(text: string, vars: Record<string, string>): string {
  return text.replace(/\{([a-z_]+)\}/gi, (match, key: string) => (key in vars ? vars[key] : match));
}
