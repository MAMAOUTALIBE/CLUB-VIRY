-- Module convocations CRM : fiche complete + types d'evenements + suivi joueurs.

create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_default boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_types_name_not_empty check (char_length(trim(name)) >= 2)
);

insert into public.event_types (name, slug, is_default)
values
  ('Match championnat', 'match-championnat', true),
  ('Match coupe', 'match-coupe', true),
  ('Match amical', 'match-amical', true),
  ('Tournoi', 'tournoi', true),
  ('Plateau', 'plateau', true),
  ('Entrainement special', 'entrainement-special', true),
  ('Reunion', 'reunion', true),
  ('Stage', 'stage', true)
on conflict (slug) do nothing;

create table if not exists public.match_convocations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type_id uuid references public.event_types(id) on delete set null,
  event_type_name text not null default 'Match',
  meeting_at timestamptz,
  meeting_location text,
  event_location text,
  return_estimate_at timestamptz,
  instructions text,
  outfit text,
  transport text,
  coach_comment text,
  impediment_contact text,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SENT', 'CLOSED', 'CANCELLED')),
  created_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id),
  constraint match_convocations_event_type_name_not_empty check (char_length(trim(event_type_name)) >= 2)
);

create index if not exists match_convocations_match_idx on public.match_convocations (match_id);
create index if not exists match_convocations_status_idx on public.match_convocations (status, created_at desc);

alter table public.match_callups
  add column if not exists response_status text not null default 'EN_ATTENTE',
  add column if not exists response_comment text,
  add column if not exists response_at timestamptz,
  add column if not exists presence_status text not null default 'NON_SAISI',
  add column if not exists presence_comment text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.match_callups drop constraint if exists match_callups_status_check;
alter table public.match_callups drop constraint if exists match_callups_status_allowed;
alter table public.match_callups
  add constraint match_callups_status_allowed
  check (status in ('CONVOQUE', 'REMPLACANT', 'NON_CONVOQUE', 'ABSENT', 'BLESSE', 'SUSPENDU', 'A_CONFIRMER'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'match_callups_response_status_allowed'
      and conrelid = 'public.match_callups'::regclass
  ) then
    alter table public.match_callups
      add constraint match_callups_response_status_allowed
      check (response_status in ('EN_ATTENTE', 'PRESENT', 'ABSENT', 'RETARD'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'match_callups_presence_status_allowed'
      and conrelid = 'public.match_callups'::regclass
  ) then
    alter table public.match_callups
      add constraint match_callups_presence_status_allowed
      check (presence_status in ('NON_SAISI', 'PRESENT', 'ABSENT', 'RETARD', 'EXCUSE'));
  end if;
end $$;

drop trigger if exists event_types_set_updated_at on public.event_types;
create trigger event_types_set_updated_at
before update on public.event_types
for each row execute function public.set_updated_at();

drop trigger if exists match_convocations_set_updated_at on public.match_convocations;
create trigger match_convocations_set_updated_at
before update on public.match_convocations
for each row execute function public.set_updated_at();

drop trigger if exists match_callups_set_updated_at on public.match_callups;
create trigger match_callups_set_updated_at
before update on public.match_callups
for each row execute function public.set_updated_at();

alter table public.event_types enable row level security;
alter table public.match_convocations enable row level security;

drop policy if exists "event_types_read_all" on public.event_types;
create policy "event_types_read_all"
on public.event_types for select to authenticated
using (true);

drop policy if exists "event_types_admin_all" on public.event_types;
create policy "event_types_admin_all"
on public.event_types for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "match_convocations_admin_all" on public.match_convocations;
create policy "match_convocations_admin_all"
on public.match_convocations for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

grant select, insert, update, delete on public.event_types to authenticated;
grant select, insert, update, delete on public.match_convocations to authenticated;
