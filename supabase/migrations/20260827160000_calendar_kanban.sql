-- CRM weekly planning: stage cards and real match end times.
alter type public.club_event_type add value if not exists 'STAGE';

alter table public.matches
  add column if not exists ends_at timestamptz;

alter table public.matches
  drop constraint if exists matches_dates_order,
  add constraint matches_dates_order
    check (ends_at is null or ends_at >= starts_at);

create index if not exists matches_starts_ends_idx
  on public.matches (starts_at, ends_at)
  where deleted_at is null;
