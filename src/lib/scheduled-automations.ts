/**
 * Catalogue des conditions d'automatisation planifiée (relances). Pur (client + serveur).
 * Chaque condition est une requête en lecture seule connue et sûre, évaluée par le cron.
 */
export const SCHEDULED_CONDITIONS = [
  {
    value: "registrations_stale",
    label: "Inscriptions en attente",
    description: "Dossiers d'inscription soumis mais non finalisés depuis plus de N jours."
  },
  {
    value: "recruitment_stale",
    label: "Candidatures détection en attente",
    description: "Candidatures de détection au statut « en attente » depuis plus de N jours."
  }
] as const;

export type ScheduledConditionKey = (typeof SCHEDULED_CONDITIONS)[number]["value"];
export const SCHEDULED_CONDITION_VALUES = SCHEDULED_CONDITIONS.map((c) => c.value) as readonly ScheduledConditionKey[];
export function scheduledConditionLabel(value: string): string {
  return SCHEDULED_CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
