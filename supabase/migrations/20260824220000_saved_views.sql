-- Phase J — Vues enregistrées (recherche + colonnes visibles) par module du CRM.
-- 100 % additif. Préférences d'affichage par utilisateur (ou partagées), réutilisables
-- depuis la barre d'outils d'un tableau. `config` (jsonb) porte { search, hiddenColumns }.

create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade,
  is_shared boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_views_scope_format check (scope ~ '^[a-z0-9_-]+$')
);

create index if not exists saved_views_scope_idx on public.saved_views (scope, owner_id);

drop trigger if exists saved_views_set_updated_at on public.saved_views;
create trigger saved_views_set_updated_at
before update on public.saved_views
for each row execute function public.set_updated_at();

alter table public.saved_views enable row level security;

drop policy if exists "saved_views_admin" on public.saved_views;
create policy "saved_views_admin" on public.saved_views for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
