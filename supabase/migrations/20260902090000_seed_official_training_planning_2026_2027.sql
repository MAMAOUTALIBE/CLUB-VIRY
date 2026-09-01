-- Planning officiel des entraînements 2026 / 2027, d'après l'affiche du club.
-- Chaque ligne représente une carte hebdomadaire visible dans le CRM et sur le site public.

insert into public.categories (name, age_range, gender, order_index, is_active)
values
  ('U6 – U7', 'École primaire', 'MIXTE', 100, true),
  ('U8 – U9', 'École primaire', 'MIXTE', 110, true),
  ('U10 (CM2)', 'École primaire', 'MIXTE', 120, true),
  ('U11 (6e)', 'Collège', 'MIXTE', 130, true),
  ('U12 – U13', 'Collège', 'MIXTE', 140, true),
  ('U14', 'Collège', 'MIXTE', 150, true),
  ('U16', 'Lycée', 'MIXTE', 160, true),
  ('U18', 'Lycée', 'MIXTE', 170, true),
  ('Féminines', 'Féminines', 'FEMININ', 180, true),
  ('Seniors', 'Football adulte', 'MASCULIN', 190, true),
  ('Vétérans', 'Football adulte', 'MASCULIN', 200, true)
on conflict (name) do update set
  age_range = excluded.age_range,
  gender = excluded.gender,
  order_index = excluded.order_index,
  is_active = true,
  deleted_at = null,
  deleted_by = null,
  updated_at = now();

create temporary table official_training_slots_2026_2027 (
  category_name text not null,
  iso_weekday smallint not null,
  starts_on time not null,
  ends_on time not null,
  pitch_code text,
  venue text not null,
  group_label text,
  alternate_group_label text
);

insert into official_training_slots_2026_2027
  (category_name, iso_weekday, starts_on, ends_on, pitch_code, venue, group_label, alternate_group_label)
values
  -- École primaire
  ('U6 – U7', 3, '10:00', '11:30', 'T2', 'Terrain synthétique', null, null),
  ('U6 – U7', 5, '17:30', '19:00', 'T4', 'Stade Raoul Perrin', null, null),

  ('U8 – U9', 1, '17:30', '19:00', 'T4', 'Stade Raoul Perrin', 'A – B', null),
  ('U8 – U9', 3, '10:00', '11:30', 'T2', 'Terrain synthétique', 'U8/U9 B', null),
  ('U8 – U9', 3, '11:30', '13:00', 'T2', 'Terrain synthétique', 'U8/U9 A', null),
  ('U8 – U9', 5, '17:30', '19:00', 'T4', 'Stade Raoul Perrin', 'A · une semaine sur deux', 'B · une semaine sur deux'),

  ('U10 (CM2)', 2, '17:30', '19:00', null, 'Terrains T2 et T4', 'T2 · B, C / T4 · A', null),
  ('U10 (CM2)', 3, '11:30', '13:00', null, 'Terrains T2 et T4', 'T2 · A / T4 · B, C', null),
  ('U10 (CM2)', 4, '17:30', '19:00', 'T2', 'Terrain synthétique', 'A – B', null),

  -- Collège
  ('U11 (6e)', 2, '17:30', '19:00', null, 'Terrains T2 et T4', 'T2 · B, C / T4 · A', null),
  ('U11 (6e)', 3, '14:00', '15:30', 'T2', 'Terrain synthétique', 'A – B – C', null),
  ('U11 (6e)', 4, '17:30', '19:00', null, 'Terrains T2 et T4', 'T2 · A, B / T4 · C', null),

  ('U12 – U13', 1, '17:30', '19:00', null, 'Terrains T2 et T4', 'T2 · B, C / T4 · A', null),
  ('U12 – U13', 3, '15:30', '17:00', null, 'Terrains T2 et T4', 'T2 · A, C / T4 · B', null),
  ('U12 – U13', 5, '17:30', '19:00', null, 'Terrains T2 et T4', 'T2 · A, B / T4 · C', null),

  ('U14', 1, '19:00', '20:30', 'T2', 'Terrain synthétique', 'A – B', null),
  ('U14', 3, '17:00', '18:30', 'T2', 'Terrain synthétique', 'A – B', null),
  ('U14', 5, '19:00', '20:30', null, 'Terrains T2 et T4', 'T2 · A / T4 · B', null),

  -- Lycée
  ('U16', 2, '19:00', '20:30', null, 'Terrains T2 et T4', 'T2 · A / T4 · B', null),
  ('U16', 4, '19:00', '20:30', 'T2', 'Terrain synthétique', 'A – B', null),
  ('U16', 5, '19:00', '20:30', null, 'Terrains T2 et T4', 'T2 · A / T4 · B', null),

  ('U18', 2, '19:00', '20:30', 'T2', 'Terrain synthétique', 'U18', null),
  ('U18', 3, '19:00', '20:30', 'T2', 'Terrain synthétique', 'U18', null),
  ('U18', 5, '20:30', '22:00', 'T2', 'Terrain synthétique', 'U18', null),

  -- Féminines
  ('Féminines', 1, '19:00', '20:30', 'T4', 'Stade Raoul Perrin', null, null),
  ('Féminines', 3, '19:00', '20:30', 'T2', 'Terrain synthétique', null, null),
  ('Féminines', 4, '19:00', '20:30', 'T4', 'Stade Raoul Perrin', null, null),

  -- Football adulte
  ('Seniors', 1, '20:00', '22:00', 'T2', 'Terrain synthétique', 'B', null),
  ('Seniors', 2, '20:00', '22:00', 'T1', 'Terrain honneur', 'A', null),
  ('Seniors', 3, '20:30', '22:00', null, 'Terrains T2 et T4', 'T4 · A / T2 (½ terrain) · B', null),
  ('Seniors', 4, '20:00', '22:00', 'T1', 'Terrain honneur', 'A – B', null),
  ('Seniors', 5, '20:00', '22:00', 'T1', 'Terrain honneur', 'A', null),

  ('Vétérans', 3, '20:30', '22:00', 'T2', 'Terrain synthétique', 'A · ½ terrain', null);

with training_dates as (
  select day::date as session_date
  from generate_series('2026-08-31'::date, '2027-06-30'::date, interval '1 day') as day
),
official_events as (
  select
    (md5(concat_ws('|', 'planning-officiel-2026-2027', slot.category_name, date.session_date, slot.starts_on))::uuid) as id,
    category.id as category_id,
    concat('Entraînement ', slot.category_name) as title,
    ((date.session_date + slot.starts_on) at time zone 'Europe/Paris') as starts_at,
    ((date.session_date + slot.ends_on) at time zone 'Europe/Paris') as ends_at,
    slot.pitch_code,
    slot.venue,
    case
      when slot.alternate_group_label is not null
        and mod((date.session_date - '2026-08-31'::date) / 7, 2) = 1
        then slot.alternate_group_label
      else slot.group_label
    end as group_label
  from training_dates date
  join official_training_slots_2026_2027 slot
    on extract(isodow from date.session_date) = slot.iso_weekday
  join public.categories category
    on category.name = slot.category_name
)
insert into public.club_events (
  id,
  category_id,
  title,
  type,
  starts_at,
  ends_at,
  venue,
  description,
  visibility,
  status,
  is_featured,
  group_label,
  pitch_code
)
select
  id,
  category_id,
  title,
  'TRAINING',
  starts_at,
  ends_at,
  venue,
  'Planning officiel 2026 / 2027 · import de l’affiche du club',
  'PUBLIC',
  'SCHEDULED',
  false,
  group_label,
  pitch_code
from official_events
on conflict (id) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  type = excluded.type,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  venue = excluded.venue,
  description = excluded.description,
  visibility = excluded.visibility,
  status = excluded.status,
  is_featured = excluded.is_featured,
  group_label = excluded.group_label,
  pitch_code = excluded.pitch_code,
  deleted_at = null,
  deleted_by = null;
