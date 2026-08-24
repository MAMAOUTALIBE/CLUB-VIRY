-- Phase H — Référentiels dynamiques (listes configurables : statuts, tags, étapes…).
-- 100 % additif : aucun ENUM ni table existante modifié. Les administrateurs créent et
-- gèrent des listes de valeurs (libellé + couleur + ordre + actif) depuis le CRM, et peuvent
-- taguer les fiches métier avec ces valeurs. Aucune migration destructive des statuts en dur :
-- ces listes viennent EN COMPLÉMENT (tags libres, étapes, référentiels maison).

do $$
begin
  create type public.reference_list_kind as enum ('STATUS', 'TAG', 'STAGE', 'CATEGORY', 'LABEL');
exception
  when duplicate_object then null;
end $$;

-- Une liste de référence (ex : « Niveaux de partenariat », « Étapes de recrutement »).
create table if not exists public.reference_lists (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  description text,
  kind public.reference_list_kind not null default 'LABEL',
  -- Types de fiches auxquels une liste TAG peut s'appliquer (vide = aucune restriction d'usage direct).
  applies_to text[] not null default '{}',
  is_system boolean not null default false,
  order_index integer not null default 0,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reference_lists_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

create unique index if not exists reference_lists_key_uidx
  on public.reference_lists (key)
  where deleted_at is null;

-- Une valeur d'une liste (ex : « Or », « Contacté »).
create table if not exists public.reference_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.reference_lists(id) on delete cascade,
  value text not null,
  label text not null,
  color text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  is_default boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reference_items_value_format check (value ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint reference_items_color_format check (color is null or color ~ '^#[0-9a-fA-F]{6}$')
);

create unique index if not exists reference_items_list_value_uidx
  on public.reference_items (list_id, value)
  where deleted_at is null;

create index if not exists reference_items_list_active_order_idx
  on public.reference_items (list_id, is_active, order_index)
  where deleted_at is null;

-- Application d'une valeur (tag) à une fiche métier.
create table if not exists public.entity_tags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  item_id uuid not null references public.reference_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint entity_tags_entity_type_check
    check (entity_type in ('player', 'family', 'partner', 'recruitment_application', 'team', 'news')),
  constraint entity_tags_unique unique (entity_type, entity_id, item_id)
);

create index if not exists entity_tags_entity_idx
  on public.entity_tags (entity_type, entity_id);

drop trigger if exists reference_lists_set_updated_at on public.reference_lists;
create trigger reference_lists_set_updated_at
before update on public.reference_lists
for each row execute function public.set_updated_at();

drop trigger if exists reference_items_set_updated_at on public.reference_items;
create trigger reference_items_set_updated_at
before update on public.reference_items
for each row execute function public.set_updated_at();

alter table public.reference_lists enable row level security;
alter table public.reference_items enable row level security;
alter table public.entity_tags enable row level security;

drop policy if exists "reference_lists_admin" on public.reference_lists;
create policy "reference_lists_admin" on public.reference_lists for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "reference_items_admin" on public.reference_items;
create policy "reference_items_admin" on public.reference_items for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "entity_tags_admin" on public.entity_tags;
create policy "entity_tags_admin" on public.entity_tags for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

-- Amorce : une liste de tags « Niveaux de partenariat » (applicable aux partenaires), pour
-- que la fonctionnalité soit utilisable immédiatement. Idempotent.
insert into public.reference_lists (key, name, description, kind, applies_to, is_system, order_index)
values ('niveaux_partenariat', 'Niveaux de partenariat', 'Niveau de sponsoring pour classer les partenaires.', 'TAG', array['partner'], true, 10)
on conflict do nothing;

insert into public.reference_items (list_id, value, label, color, order_index)
select l.id, v.value, v.label, v.color, v.ord
from public.reference_lists l
join (values
  ('or', 'Or', '#f7c600', 10),
  ('argent', 'Argent', '#9ca3af', 20),
  ('bronze', 'Bronze', '#b45309', 30),
  ('institutionnel', 'Institutionnel', '#07542f', 40)
) as v(value, label, color, ord) on l.key = 'niveaux_partenariat'
where not exists (select 1 from public.reference_items ri where ri.list_id = l.id and ri.value = v.value);
