-- Persist the lifecycle of public calendar events, including training sessions.
alter table public.club_events
  add column if not exists status text not null default 'SCHEDULED';

alter table public.club_events drop constraint if exists club_events_status_check;
alter table public.club_events add constraint club_events_status_check
  check (status in ('SCHEDULED', 'CANCELLED'));
