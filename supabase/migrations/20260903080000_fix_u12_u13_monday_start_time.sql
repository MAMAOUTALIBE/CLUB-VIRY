-- Le créneau du lundi des U12 – U13 commence à 18 h, et non à 17 h 30.
-- Cette migration corrige les événements déjà créés par le planning officiel 2026 / 2027.

update public.club_events as event
set starts_at = (
  (
    (event.starts_at at time zone 'Europe/Paris')::date
    + time '18:00'
  ) at time zone 'Europe/Paris'
)
from public.categories as category
where event.category_id = category.id
  and category.name = 'U12 – U13'
  and event.type = 'TRAINING'
  and event.description = 'Planning officiel 2026 / 2027 · import de l’affiche du club'
  and (event.starts_at at time zone 'Europe/Paris')::date between '2026-08-31'::date and '2027-06-30'::date
  and extract(isodow from event.starts_at at time zone 'Europe/Paris') = 1
  and (event.starts_at at time zone 'Europe/Paris')::time = time '17:30';
