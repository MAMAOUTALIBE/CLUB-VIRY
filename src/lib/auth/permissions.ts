import type { AppRole } from "@/lib/auth/roles";

export type Permission =
  | "admin:access"
  | "admin:manage_users"
  | "admin:view_logs"
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

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
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
