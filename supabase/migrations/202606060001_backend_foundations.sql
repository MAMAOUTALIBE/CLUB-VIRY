-- Backend foundations for ES Viry-Chatillon Football.
-- Apply from Supabase SQL editor or Supabase CLI after configuring the project.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum (
    'SUPER_ADMIN',
    'ADMIN_CLUB',
    'DIRIGEANT',
    'EDUCATEUR',
    'FAMILLE',
    'JOUEUR',
    'MEMBRE',
    'PARTENAIRE',
    'VISITEUR'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.profile_status as enum ('ACTIVE', 'PENDING', 'SUSPENDED', 'ARCHIVED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.category_gender as enum ('MIXTE', 'MASCULIN', 'FEMININ');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'MEMBRE',
  status public.profile_status not null default 'PENDING',
  first_name text,
  last_name text,
  display_name text,
  phone text,
  email text,
  avatar_url text,
  birth_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_length check (phone is null or char_length(phone) between 6 and 32)
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_date_order check (ends_on > starts_on)
);

create unique index if not exists seasons_single_active_idx
  on public.seasons (is_active)
  where is_active = true;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  age_range text not null,
  gender public.category_gender not null default 'MIXTE',
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_order_idx
  on public.categories (is_active, order_index);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_actor_created_idx
  on public.activity_logs (actor_id, created_at desc);

create index if not exists activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists seasons_set_updated_at on public.seasons;
create trigger seasons_set_updated_at
before update on public.seasons
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.has_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = any(required_roles), false);
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB']::public.app_role[]);
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, first_name, last_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'MEMBRE'::public.app_role),
    'ACTIVE'::public.profile_status
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
exception
  when invalid_text_representation then
    insert into public.profiles (id, email, display_name, role, status)
    values (new.id, new.email, coalesce(new.email, 'Membre'), 'MEMBRE', 'ACTIVE')
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.categories enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own_basic" on public.profiles;
create policy "profiles_update_own_basic"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = public.current_profile_role());

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read"
on public.profiles
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write"
on public.profiles
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "seasons_public_read" on public.seasons;
create policy "seasons_public_read"
on public.seasons
for select
to anon, authenticated
using (true);

drop policy if exists "seasons_admin_write" on public.seasons;
create policy "seasons_admin_write"
on public.seasons
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (is_active = true or public.is_admin_role());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
on public.categories
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "activity_logs_admin_read" on public.activity_logs;
create policy "activity_logs_admin_read"
on public.activity_logs
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "activity_logs_authenticated_insert_own" on public.activity_logs;
create policy "activity_logs_authenticated_insert_own"
on public.activity_logs
for insert
to authenticated
with check (actor_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.seasons to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select, insert, update, delete on public.seasons to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant execute on function public.current_profile_role() to anon, authenticated;
grant execute on function public.has_role(public.app_role[]) to anon, authenticated;
grant execute on function public.is_admin_role() to anon, authenticated;
