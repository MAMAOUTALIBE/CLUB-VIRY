-- Teams, staff, squads and match calendar.

do $$
begin
  create type public.match_status as enum ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.match_location as enum ('HOME', 'AWAY', 'NEUTRAL');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  level text,
  age_range text,
  gender public.category_gender not null default 'MIXTE',
  description text,
  cover_image_url text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.team_staff (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  role_title text not null,
  is_head_coach boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.team_players (
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  position text,
  shirt_number integer,
  created_at timestamptz not null default now(),
  primary key (team_id, player_id),
  constraint team_players_shirt_number check (shirt_number is null or shirt_number between 1 and 99)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  opponent_name text not null,
  opponent_logo_url text,
  location public.match_location not null default 'HOME',
  starts_at timestamptz not null,
  venue text,
  competition text,
  status public.match_status not null default 'SCHEDULED',
  home_score integer,
  away_score integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_scores_positive check (
    (home_score is null or home_score >= 0)
    and (away_score is null or away_score >= 0)
  )
);

create index if not exists teams_active_order_idx
  on public.teams (is_active, order_index);

create index if not exists teams_slug_idx
  on public.teams (slug);

create index if not exists team_staff_team_idx
  on public.team_staff (team_id);

create index if not exists team_players_player_idx
  on public.team_players (player_id);

create index if not exists matches_team_starts_idx
  on public.matches (team_id, starts_at);

create index if not exists matches_status_starts_idx
  on public.matches (status, starts_at);

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

alter table public.teams enable row level security;
alter table public.team_staff enable row level security;
alter table public.team_players enable row level security;
alter table public.matches enable row level security;

drop policy if exists "teams_public_read" on public.teams;
create policy "teams_public_read"
on public.teams
for select
to anon, authenticated
using (is_active = true or public.is_admin_role());

drop policy if exists "teams_admin_write" on public.teams;
create policy "teams_admin_write"
on public.teams
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "team_staff_public_read" on public.team_staff;
create policy "team_staff_public_read"
on public.team_staff
for select
to anon, authenticated
using (true);

drop policy if exists "team_staff_admin_write" on public.team_staff;
create policy "team_staff_admin_write"
on public.team_staff
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "team_players_authenticated_read" on public.team_players;
create policy "team_players_authenticated_read"
on public.team_players
for select
to authenticated
using (
  public.is_admin_role()
  or exists (
    select 1
    from public.players
    where players.id = team_players.player_id
      and public.is_family_member(players.family_id)
  )
);

drop policy if exists "team_players_staff_write" on public.team_players;
create policy "team_players_staff_write"
on public.team_players
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT', 'EDUCATEUR']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT', 'EDUCATEUR']::public.app_role[]));

drop policy if exists "matches_public_read" on public.matches;
create policy "matches_public_read"
on public.matches
for select
to anon, authenticated
using (true);

drop policy if exists "matches_staff_write" on public.matches;
create policy "matches_staff_write"
on public.matches
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT', 'EDUCATEUR']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT', 'EDUCATEUR']::public.app_role[]));

grant select on public.teams to anon, authenticated;
grant select on public.team_staff to anon, authenticated;
grant select on public.matches to anon, authenticated;
grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_staff to authenticated;
grant select, insert, update, delete on public.team_players to authenticated;
grant select, insert, update, delete on public.matches to authenticated;
