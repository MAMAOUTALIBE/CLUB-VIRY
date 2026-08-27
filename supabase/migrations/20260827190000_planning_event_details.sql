-- One planning record, two presentations: complete CRM data and compact public data.
alter table public.club_events
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists group_label text,
  add column if not exists pitch_code text,
  add column if not exists opponent_name text,
  add column if not exists educator_id uuid references public.profiles(id) on delete set null;

alter table public.matches
  add column if not exists title text,
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists group_label text,
  add column if not exists pitch_code text,
  add column if not exists educator_id uuid references public.profiles(id) on delete set null,
  add column if not exists visibility public.club_event_visibility not null default 'PUBLIC';

alter table public.club_events
  drop constraint if exists club_events_group_label_length,
  add constraint club_events_group_label_length check (group_label is null or char_length(group_label) <= 120),
  drop constraint if exists club_events_pitch_code_check,
  add constraint club_events_pitch_code_check check (pitch_code is null or pitch_code in ('T1', 'T2', 'T3', 'T4')),
  drop constraint if exists club_events_opponent_name_length,
  add constraint club_events_opponent_name_length check (opponent_name is null or char_length(opponent_name) between 2 and 160);

alter table public.matches
  drop constraint if exists matches_title_length,
  add constraint matches_title_length check (title is null or char_length(title) between 2 and 180),
  drop constraint if exists matches_group_label_length,
  add constraint matches_group_label_length check (group_label is null or char_length(group_label) <= 120),
  drop constraint if exists matches_pitch_code_check,
  add constraint matches_pitch_code_check check (pitch_code is null or pitch_code in ('T1', 'T2', 'T3', 'T4'));

create index if not exists club_events_category_starts_idx on public.club_events (category_id, starts_at) where deleted_at is null;
create index if not exists club_events_pitch_starts_idx on public.club_events (pitch_code, starts_at) where deleted_at is null;
create index if not exists matches_category_starts_idx on public.matches (category_id, starts_at) where deleted_at is null;
create index if not exists matches_pitch_starts_idx on public.matches (pitch_code, starts_at) where deleted_at is null;
