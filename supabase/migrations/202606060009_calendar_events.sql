-- Club calendar events.

do $$
begin
  create type public.club_event_type as enum ('TRAINING', 'MEETING', 'TOURNAMENT', 'CLUB_EVENT', 'DEADLINE', 'OTHER');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.club_event_visibility as enum ('PUBLIC', 'MEMBERS', 'STAFF');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.club_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  type public.club_event_type not null default 'CLUB_EVENT',
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  description text,
  visibility public.club_event_visibility not null default 'PUBLIC',
  is_featured boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_events_title_length check (char_length(title) between 2 and 180),
  constraint club_events_dates_order check (ends_at is null or ends_at >= starts_at)
);

create index if not exists club_events_starts_idx
  on public.club_events (starts_at);

create index if not exists club_events_visibility_starts_idx
  on public.club_events (visibility, starts_at);

create index if not exists club_events_team_starts_idx
  on public.club_events (team_id, starts_at);

drop trigger if exists club_events_set_updated_at on public.club_events;
create trigger club_events_set_updated_at
before update on public.club_events
for each row execute function public.set_updated_at();

alter table public.club_events enable row level security;

drop policy if exists "club_events_public_read" on public.club_events;
create policy "club_events_public_read"
on public.club_events
for select
to anon, authenticated
using (
  visibility = 'PUBLIC'
  or (auth.uid() is not null and visibility in ('MEMBERS', 'STAFF'))
  or public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT', 'EDUCATEUR']::public.app_role[])
);

drop policy if exists "club_events_admin_write" on public.club_events;
create policy "club_events_admin_write"
on public.club_events
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

grant select on public.club_events to anon, authenticated;
grant select, insert, update, delete on public.club_events to authenticated;
