-- Family and player account foundations.

do $$
begin
  create type public.family_relationship as enum ('PARENT', 'LEGAL_GUARDIAN', 'PLAYER', 'OTHER');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.person_gender as enum ('MASCULIN', 'FEMININ', 'NON_RENSEIGNE');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_contact_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  relationship public.family_relationship not null default 'PARENT',
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (family_id, profile_id)
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  gender public.person_gender not null default 'NON_RENSEIGNE',
  license_number text unique,
  medical_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_name_length check (char_length(first_name) between 2 and 80 and char_length(last_name) between 2 and 80),
  constraint players_birth_date_valid check (birth_date <= current_date)
);

create table if not exists public.player_guardians (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  relationship public.family_relationship not null default 'PARENT',
  is_primary boolean not null default false,
  can_pick_up boolean not null default true,
  created_at timestamptz not null default now(),
  unique (player_id, profile_id)
);

create index if not exists families_primary_contact_idx
  on public.families (primary_contact_id);

create index if not exists family_members_profile_idx
  on public.family_members (profile_id);

create index if not exists players_family_idx
  on public.players (family_id);

create index if not exists players_category_idx
  on public.players (category_id);

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and profile_id = auth.uid()
  );
$$;

drop trigger if exists families_set_updated_at on public.families;
create trigger families_set_updated_at
before update on public.families
for each row execute function public.set_updated_at();

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.players enable row level security;
alter table public.player_guardians enable row level security;

drop policy if exists "families_member_read" on public.families;
create policy "families_member_read"
on public.families
for select
to authenticated
using (public.is_family_member(id) or public.is_admin_role());

drop policy if exists "families_admin_write" on public.families;
create policy "families_admin_write"
on public.families
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "family_members_member_read" on public.family_members;
create policy "family_members_member_read"
on public.family_members
for select
to authenticated
using (public.is_family_member(family_id) or public.is_admin_role());

drop policy if exists "family_members_admin_write" on public.family_members;
create policy "family_members_admin_write"
on public.family_members
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "players_member_read" on public.players;
create policy "players_member_read"
on public.players
for select
to authenticated
using (public.is_family_member(family_id) or public.is_admin_role());

drop policy if exists "players_member_write" on public.players;
create policy "players_member_write"
on public.players
for insert
to authenticated
with check (public.is_family_member(family_id) or public.is_admin_role());

drop policy if exists "players_member_update" on public.players;
create policy "players_member_update"
on public.players
for update
to authenticated
using (public.is_family_member(family_id) or public.is_admin_role())
with check (public.is_family_member(family_id) or public.is_admin_role());

drop policy if exists "players_admin_delete" on public.players;
create policy "players_admin_delete"
on public.players
for delete
to authenticated
using (public.is_admin_role());

drop policy if exists "player_guardians_member_read" on public.player_guardians;
create policy "player_guardians_member_read"
on public.player_guardians
for select
to authenticated
using (
  public.is_admin_role()
  or exists (
    select 1
    from public.players
    where players.id = player_guardians.player_id
      and public.is_family_member(players.family_id)
  )
);

drop policy if exists "player_guardians_admin_write" on public.player_guardians;
create policy "player_guardians_admin_write"
on public.player_guardians
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

grant select, insert, update, delete on public.families to authenticated;
grant select, insert, update, delete on public.family_members to authenticated;
grant select, insert, update, delete on public.players to authenticated;
grant select, insert, update, delete on public.player_guardians to authenticated;
grant execute on function public.is_family_member(uuid) to authenticated;
