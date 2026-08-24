import type { AppRole } from "@/lib/auth/roles";

export type Permission =
  | "admin:access"
  | "admin:manage_users"
  | "admin:view_logs"
  | "automations:manage"
  | "communication:manage"
  | "content:manage"
  | "content:publish"
  | "teams:manage"
  | "players:manage"
  | "matches:manage"
  | "registrations:manage"
  | "documents:review"
  | "payments:manage"
  | "shop:manage"
  | "partners:manage"
  | "family:manage_own"
  | "player:view_own"
  | "educator:manage_own_teams"
  | "partner:view_own"
  | "public:read";

export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  SUPER_ADMIN: [
    "admin:access",
    "admin:manage_users",
    "admin:view_logs",
    "automations:manage",
    "communication:manage",
    "content:manage",
    "content:publish",
    "teams:manage",
    "players:manage",
    "matches:manage",
    "registrations:manage",
    "documents:review",
    "payments:manage",
    "shop:manage",
    "partners:manage",
    "family:manage_own",
    "player:view_own",
    "educator:manage_own_teams",
    "partner:view_own",
    "public:read"
  ],
  ADMIN_CLUB: [
    "admin:access",
    "admin:manage_users",
    "admin:view_logs",
    "automations:manage",
    "communication:manage",
    "content:manage",
    "content:publish",
    "teams:manage",
    "players:manage",
    "matches:manage",
    "registrations:manage",
    "documents:review",
    "payments:manage",
    "shop:manage",
    "partners:manage",
    "public:read"
  ],
  DIRIGEANT: [
    "admin:access",
    "admin:view_logs",
    "automations:manage",
    "communication:manage",
    "content:manage",
    "content:publish",
    "teams:manage",
    "players:manage",
    "matches:manage",
    "registrations:manage",
    "documents:review",
    "partners:manage",
    "public:read"
  ],
  // Éditeur : gère ET publie les contenus éditoriaux (actualités, médias, pages).
  EDITEUR: ["admin:access", "content:manage", "content:publish", "public:read"],
  // Responsable sportif : équipes, joueurs, matchs (pas de contenu ni boutique).
  RESP_SPORTIF: ["admin:access", "teams:manage", "players:manage", "matches:manage", "public:read"],
  // Responsable boutique : produits, commandes, paiements.
  RESP_BOUTIQUE: ["admin:access", "shop:manage", "payments:manage", "public:read"],
  // Contributeur : crée/modifie des contenus mais NE PEUT PAS publier (pas de content:publish).
  CONTRIBUTEUR: ["admin:access", "content:manage", "public:read"],
  // Pas de "matches:manage" : sinon l'EDUCATEUR pourrait appeler /api/admin/matches*
  // (non scopees par equipe) et contourner l'isolation. Il gere ses matchs via
  // /api/educator/* (permission educator:manage_own_teams + controle canManageTeam).
  EDUCATEUR: ["educator:manage_own_teams", "player:view_own", "public:read"],
  FAMILLE: ["family:manage_own", "player:view_own", "public:read"],
  JOUEUR: ["player:view_own", "public:read"],
  MEMBRE: ["public:read"],
  PARTENAIRE: ["partner:view_own", "public:read"],
  VISITEUR: ["public:read"]
};

// Libellés lisibles des permissions (écran d'administration des rôles).
export const PERMISSION_LABELS: Record<Permission, string> = {
  "admin:access": "Accès au CRM",
  "admin:manage_users": "Gérer les utilisateurs",
  "admin:view_logs": "Voir le journal d'audit",
  "automations:manage": "Automatisations & configuration",
  "communication:manage": "Communication (messages, campagnes)",
  "content:manage": "Gérer les contenus",
  "content:publish": "Publier les contenus",
  "teams:manage": "Gérer les équipes",
  "players:manage": "Gérer les joueurs",
  "matches:manage": "Gérer les matchs",
  "registrations:manage": "Gérer les inscriptions",
  "documents:review": "Valider les documents",
  "payments:manage": "Gérer les paiements",
  "shop:manage": "Gérer la boutique",
  "partners:manage": "Gérer les partenaires",
  "family:manage_own": "Gérer sa famille",
  "player:view_own": "Voir ses infos joueur",
  "educator:manage_own_teams": "Gérer ses équipes (éducateur)",
  "partner:view_own": "Espace partenaire",
  "public:read": "Lecture publique"
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];

/** Rôle jamais modifiable : garde-fou anti-verrouillage (garde toutes ses permissions). */
export const LOCKED_ROLES: readonly AppRole[] = ["SUPER_ADMIN"];

// --- Surcouche de permissions effectives (Phase K) ---------------------------
// Le code (ROLE_PERMISSIONS) reste la source de vérité par défaut. Une surcharge
// optionnelle (chargée depuis la base côté serveur) peut la remplacer par rôle.
// `hasPermission` lit cette map, qui vaut les défauts au démarrage (donc comportement
// identique à l'existant tant qu'aucune surcharge n'est appliquée / si la base est vide).
const effectivePermissions: Record<AppRole, Set<Permission>> = Object.fromEntries(
  (Object.keys(ROLE_PERMISSIONS) as AppRole[]).map((role) => [role, new Set(ROLE_PERMISSIONS[role])])
) as Record<AppRole, Set<Permission>>;

/**
 * Applique un jeu de surcharges (role -> permissions). Rôles absents = défauts du code.
 * SUPER_ADMIN est toujours forcé à ses permissions par défaut (verrouillé).
 */
export function applyPermissionOverrides(overrides: Partial<Record<AppRole, readonly Permission[]>>): void {
  for (const role of Object.keys(ROLE_PERMISSIONS) as AppRole[]) {
    const override = LOCKED_ROLES.includes(role) ? undefined : overrides[role];
    effectivePermissions[role] = new Set(override ?? ROLE_PERMISSIONS[role]);
  }
}

/** Réinitialise toutes les permissions effectives aux valeurs par défaut du code. */
export function resetPermissionOverrides(): void {
  applyPermissionOverrides({});
}

/** Permissions effectives d'un rôle, dans l'ordre du catalogue. */
export function getEffectivePermissions(role: AppRole): Permission[] {
  return ALL_PERMISSIONS.filter((permission) => effectivePermissions[role]?.has(permission));
}

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return effectivePermissions[role]?.has(permission) ?? false;
}

const EDUCATOR_CRM_PATHS = ["/admin/convocations"] as const;

export function isEducatorCrmPath(pathname: string): boolean {
  return EDUCATOR_CRM_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function canAccessCrmPath(role: AppRole, pathname: string): boolean {
  if (hasPermission(role, "admin:access")) {
    return true;
  }

  if (!isEducatorCrmPath(pathname)) {
    return false;
  }

  return hasPermission(role, "educator:manage_own_teams") || hasPermission(role, "teams:manage");
}

export function hasAnyPermission(role: AppRole, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function assertPermission(role: AppRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}

export function hasAnyRole(role: AppRole, allowedRoles: readonly AppRole[]): boolean {
  return allowedRoles.includes(role);
}

export function assertRole(role: AppRole, allowedRoles: readonly AppRole[]): void {
  if (!hasAnyRole(role, allowedRoles)) {
    throw new Error(`Forbidden: role ${role} is not allowed`);
  }
}
