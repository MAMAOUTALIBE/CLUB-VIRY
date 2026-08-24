-- Phase K — Permissions des rôles éditables depuis le CRM. 100 % additif et FAIL-SAFE :
-- le code (ROLE_PERMISSIONS) reste la valeur par défaut ; cette table ne fait que SURCHARGER.
-- Table vide = comportement identique à l'existant. SUPER_ADMIN n'est jamais surchargé (verrouillé).

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission text not null,
  created_at timestamptz not null default now(),
  primary key (role, permission)
);

create index if not exists role_permissions_role_idx on public.role_permissions (role);

alter table public.role_permissions enable row level security;

-- Réservé aux administrateurs (le service-role de l'app bypass la RLS ; l'API restreint
-- l'écriture au SUPER_ADMIN). Garde-fou contre tout accès anon/public direct.
drop policy if exists "role_permissions_admin" on public.role_permissions;
create policy "role_permissions_admin" on public.role_permissions for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB']::public.app_role[]));
