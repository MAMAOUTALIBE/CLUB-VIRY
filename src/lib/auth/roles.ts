export const APP_ROLES = [
  "SUPER_ADMIN",
  "ADMIN_CLUB",
  "DIRIGEANT",
  "EDUCATEUR",
  "FAMILLE",
  "JOUEUR",
  "MEMBRE",
  "PARTENAIRE",
  "VISITEUR"
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const AUTHENTICATED_ROLES = APP_ROLES.filter((role) => role !== "VISITEUR");

export type AuthenticatedRole = Exclude<AppRole, "VISITEUR">;

export const ROLE_LABELS: Record<AppRole, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN_CLUB: "Administrateur club",
  DIRIGEANT: "Dirigeant",
  EDUCATEUR: "Educateur",
  FAMILLE: "Famille",
  JOUEUR: "Joueur",
  MEMBRE: "Membre",
  PARTENAIRE: "Partenaire",
  VISITEUR: "Visiteur"
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}
