insert into public.seasons (name, starts_on, ends_on, is_active)
values ('2025 / 2026', '2025-07-01', '2026-06-30', true)
on conflict (name) do update set
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.categories (name, age_range, gender, order_index, is_active)
values
  ('Ecole de foot', 'U6 a U11', 'MIXTE', 10, true),
  ('Preformation', 'U12 a U13', 'MIXTE', 20, true),
  ('Formation', 'U14 a U18', 'MIXTE', 30, true),
  ('Seniors', 'R1 / R3 / D1', 'MASCULIN', 40, true),
  ('Feminines', 'U11F a Seniors F', 'FEMININ', 50, true),
  ('Futsal', 'Competition', 'MIXTE', 60, true)
on conflict (name) do update set
  age_range = excluded.age_range,
  gender = excluded.gender,
  order_index = excluded.order_index,
  is_active = excluded.is_active,
  updated_at = now();
