// L'ordre définit le rang hiérarchique (roleRank : index bas = plus privilégié).
// Les rôles de gestion ajoutés se placent sous DIRIGEANT et au-dessus d'EDUCATEUR ;
// l'ordre relatif des rôles existants est conservé.
export const APP_ROLES = [
  "SUPER_ADMIN",
  "ADMIN_CLUB",
  "DIRIGEANT",
  "EDITEUR",
  "RESP_SPORTIF",
  "RESP_BOUTIQUE",
  "CONTRIBUTEUR",
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
  EDITEUR: "Editeur",
  RESP_SPORTIF: "Responsable sportif",
  RESP_BOUTIQUE: "Responsable boutique",
  CONTRIBUTEUR: "Contributeur",
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

/**
 * Rang hiérarchique d'un rôle. Plus le rang est petit, plus le rôle est privilégié
 * (SUPER_ADMIN = 0). Sert à empêcher l'élévation de privilèges entre administrateurs.
 */
export function roleRank(role: AppRole): number {
  return APP_ROLES.indexOf(role);
}

export type ManageProfileGuard = { ok: true } | { ok: false; message: string };

/**
 * Garde-fou anti-élévation de privilèges pour la mise à jour d'un profil par un admin.
 *
 * Règles (un SUPER_ADMIN n'est soumis à aucune de ces restrictions) :
 *  1. Un acteur ne peut pas modifier son propre rôle ni son propre statut.
 *  2. Un acteur ne peut pas gérer un compte de niveau supérieur ou égal au sien.
 *  3. Un acteur ne peut pas attribuer un rôle de niveau supérieur ou égal au sien.
 */
export function canAdminUpdateProfile(input: {
  actorRole: AppRole;
  actorId: string;
  targetId: string;
  targetCurrentRole: AppRole;
  requestedRole?: AppRole;
  changesStatus?: boolean;
}): ManageProfileGuard {
  const isSuperAdmin = input.actorRole === "SUPER_ADMIN";
  const isSelf = input.actorId === input.targetId;
  const actorRank = roleRank(input.actorRole);

  if (isSelf && (input.requestedRole !== undefined || input.changesStatus)) {
    return { ok: false, message: "Vous ne pouvez pas modifier votre propre rôle ou statut." };
  }

  if (isSuperAdmin) {
    return { ok: true };
  }

  if (roleRank(input.targetCurrentRole) <= actorRank) {
    return { ok: false, message: "Vous ne pouvez pas modifier un compte de niveau supérieur ou égal au vôtre." };
  }

  if (input.requestedRole !== undefined && roleRank(input.requestedRole) <= actorRank) {
    return { ok: false, message: "Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre." };
  }

  return { ok: true };
}
