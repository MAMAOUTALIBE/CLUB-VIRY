-- Minute réellement saisie par le CRM pour un match en direct.
-- Nullable : aucune minute n'est déduite de l'heure de début.
alter table public.matches
  add column if not exists live_minute smallint;

alter table public.matches
  drop constraint if exists matches_live_minute_check;

alter table public.matches
  add constraint matches_live_minute_check
  check (live_minute is null or live_minute between 0 and 130);
