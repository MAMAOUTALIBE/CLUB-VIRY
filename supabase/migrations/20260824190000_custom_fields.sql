-- Phase G — Champs personnalisés (moteur EAV générique, 100 % additif).
-- Permet aux administrateurs de créer/modifier/supprimer des champs sur les fiches
-- métier (joueur, famille, partenaire, candidature, équipe, actualité) SANS toucher au code.
-- Aucune table existante n'est modifiée : deux nouvelles tables seulement.

do $$
begin
  create type public.custom_field_type as enum (
    'TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'MULTISELECT', 'EMAIL', 'PHONE', 'URL'
  );
exception
  when duplicate_object then null;
end $$;

-- Définition d'un champ personnalisé, rattaché à un type d'entité (table métier).
create table if not exists public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  key text not null,
  label text not null,
  type public.custom_field_type not null default 'TEXT',
  options jsonb not null default '[]'::jsonb,
  required boolean not null default false,
  help_text text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_field_entity_type_check
    check (entity_type in ('player', 'family', 'partner', 'recruitment_application', 'team', 'news')),
  constraint custom_field_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

-- Unicité de la clé par entité, en ignorant les fiches en corbeille (deleted_at non nul).
create unique index if not exists custom_field_defs_entity_key_uidx
  on public.custom_field_definitions (entity_type, key)
  where deleted_at is null;

create index if not exists custom_field_defs_entity_active_order_idx
  on public.custom_field_definitions (entity_type, is_active, order_index)
  where deleted_at is null;

-- Valeur d'un champ personnalisé pour une fiche donnée (entity_type + entity_id).
create table if not exists public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.custom_field_definitions(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_field_values_unique unique (field_id, entity_id)
);

create index if not exists custom_field_values_entity_idx
  on public.custom_field_values (entity_type, entity_id);

drop trigger if exists custom_field_definitions_set_updated_at on public.custom_field_definitions;
create trigger custom_field_definitions_set_updated_at
before update on public.custom_field_definitions
for each row execute function public.set_updated_at();

drop trigger if exists custom_field_values_set_updated_at on public.custom_field_values;
create trigger custom_field_values_set_updated_at
before update on public.custom_field_values
for each row execute function public.set_updated_at();

alter table public.custom_field_definitions enable row level security;
alter table public.custom_field_values enable row level security;

-- Config CRM interne : réservé aux rôles d'administration (le service-role de l'app bypass la RLS ;
-- ces politiques sont un garde-fou contre tout accès anon/public direct).
drop policy if exists "custom_field_defs_admin" on public.custom_field_definitions;
create policy "custom_field_defs_admin"
on public.custom_field_definitions
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "custom_field_values_admin" on public.custom_field_values;
create policy "custom_field_values_admin"
on public.custom_field_values
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
