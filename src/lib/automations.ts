/**
 * Catalogue des automatisations du CRM.
 *
 * Chaque entrée décrit un comportement réellement câblé dans le code : la clé est
 * le contrat entre la table `automation_rules`, le point d'accroche serveur et
 * l'écran `/admin/automatisations`. Ajouter une règle ici sans la câbler afficherait
 * une automatisation qui ne se déclenche jamais — toujours faire les deux.
 *
 * Module partagé (pas de `server-only`) : l'écran d'administration s'en sert pour
 * les libellés, et le validateur d'API pour vérifier les clés reçues.
 */

export const AUTOMATION_KEYS = [
  "match_callups",
  "team_session_change",
  "team_media_added",
  "team_news_published",
  "registration_subscription",
  "notification_dispatch"
] as const;

export type AutomationKey = (typeof AUTOMATION_KEYS)[number];

export type AutomationRunStatus = "SUCCESS" | "SKIPPED" | "FAILED";

export type AutomationDefinition = {
  key: AutomationKey;
  /** Icône lucide, résolue côté écran d'administration. */
  iconName: "trophy" | "calendar" | "camera" | "megaphone" | "user-plus" | "bell";
  event: string;
  action: string;
  audience: string;
  /** Ce que le club perd concrètement si la règle est désactivée. */
  impact: string;
};

export const AUTOMATION_CATALOG: readonly AutomationDefinition[] = [
  {
    key: "match_callups",
    iconName: "trophy",
    event: "Convocation enregistrée",
    action: "Notification (in-app + email)",
    audience: "Tuteurs des joueurs convoqués",
    impact: "Les parents ne sont plus prévenus d'une convocation : l'éducateur doit les contacter lui-même."
  },
  {
    key: "team_session_change",
    iconName: "calendar",
    event: "Séance créée ou annulée",
    action: "Notification (in-app + email)",
    audience: "Familles de l'équipe",
    impact: "Une annulation de séance ne remonte plus aux familles."
  },
  {
    key: "team_media_added",
    iconName: "camera",
    event: "Média rattaché à une équipe",
    action: "Notification « nouvelle photo/vidéo »",
    audience: "Familles de l'équipe",
    impact: "Les photos publiées passent inaperçues dans l'espace famille."
  },
  {
    key: "team_news_published",
    iconName: "megaphone",
    event: "Actualité publiée et ciblée",
    action: "Notification « nouvelle actualité »",
    audience: "Familles de l'équipe ciblée",
    impact: "Les actualités d'équipe ne sont plus poussées, seulement consultables sur le site."
  },
  {
    key: "registration_subscription",
    iconName: "user-plus",
    event: "Inscription validée",
    action: "Création automatique d'un abonnement FAMILLE",
    audience: "Parent ayant soumis le dossier",
    impact: "L'accès à l'espace famille devra être ouvert à la main après chaque validation."
  },
  {
    key: "notification_dispatch",
    iconName: "bell",
    event: "Notification email en file",
    action: "Envoi via provider (Brevo) ou webhook",
    audience: "Destinataire opt-in",
    impact: "Les emails restent en file : rien ne part, y compris les notifications des autres règles."
  }
];

const CATALOG_BY_KEY = new Map(AUTOMATION_CATALOG.map((definition) => [definition.key, definition]));

export function isAutomationKey(value: unknown): value is AutomationKey {
  return typeof value === "string" && CATALOG_BY_KEY.has(value as AutomationKey);
}

export function getAutomationDefinition(key: AutomationKey): AutomationDefinition {
  const definition = CATALOG_BY_KEY.get(key);

  if (!definition) {
    throw new Error(`Unknown automation key: ${key}`);
  }

  return definition;
}
