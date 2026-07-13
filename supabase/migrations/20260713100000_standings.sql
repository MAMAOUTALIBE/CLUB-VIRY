-- Classements (tableaux de classement des équipes), saisis manuellement depuis le CRM.
-- Une ligne = une équipe dans un classement donné (regroupées par `competition`).

create table if not exists public.standings (
  id uuid primary key default gen_random_uuid(),
  competition text not null,
  team_name text not null,
  rank integer,
  played integer not null default 0,
  won integer not null default 0,
  drawn integer not null default 0,
  lost integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  points integer not null default 0,
  is_own_club boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists standings_competition_rank_idx
  on public.standings (competition, rank);

drop trigger if exists standings_set_updated_at on public.standings;
create trigger standings_set_updated_at
before update on public.standings
for each row execute function public.set_updated_at();

alter table public.standings enable row level security;

drop policy if exists "standings_public_read" on public.standings;
create policy "standings_public_read"
on public.standings
for select
to anon, authenticated
using (is_active = true or public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "standings_admin_write" on public.standings;
create policy "standings_admin_write"
on public.standings
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
