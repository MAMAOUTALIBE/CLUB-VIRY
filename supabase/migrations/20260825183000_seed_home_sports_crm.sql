-- Rend la section sportive de l'accueil réellement administrable dans le CRM.
-- Idempotent : les UUID et la clé de réglage sont stables ; une réexécution ne
-- remplace jamais les modifications réalisées ensuite par les administrateurs.

insert into public.matches (
  id, opponent_name, location, starts_at, venue, competition, status,
  home_score, away_score, notes
) values
  ('a1100000-0000-4000-8000-000000000001', 'COMPACT',       'HOME', '2026-09-05T18:00:00+02:00', 'Stade Henri Longuet', 'Séniors A', 'SCHEDULED', null, null, 'Import initial de la section sportive de l''accueil'),
  ('a1100000-0000-4000-8000-000000000002', 'Brétigny FC',  'HOME', '2026-09-06T15:00:00+02:00', 'Stade Henri Longuet', 'U18 A',     'SCHEDULED', null, null, 'Import initial de la section sportive de l''accueil'),
  ('a1100000-0000-4000-8000-000000000003', 'Evry FC',      'HOME', '2026-09-05T15:00:00+02:00', 'Stade Henri Longuet', 'U16 A',     'SCHEDULED', null, null, 'Import initial de la section sportive de l''accueil'),
  ('a1100000-0000-4000-8000-000000000004', 'Morsang FC',   'HOME', '2026-08-30T18:00:00+02:00', 'Stade Henri Longuet', 'Séniors A', 'FINISHED',  3,    1,    'Import initial de la section sportive de l''accueil'),
  ('a1100000-0000-4000-8000-000000000005', 'Brétigny FC',  'AWAY', '2026-08-30T15:00:00+02:00', 'Stade des Tilleuls',  'U18 A',     'FINISHED',  1,    2,    'Import initial de la section sportive de l''accueil'),
  ('a1100000-0000-4000-8000-000000000006', 'Ste Geneviève','HOME', '2026-08-29T15:00:00+02:00', 'Stade Henri Longuet', 'U16 A',     'FINISHED',  4,    0,    'Import initial de la section sportive de l''accueil')
on conflict (id) do nothing;

insert into public.site_settings (key, value)
values (
  'home_sports',
  $json$
  {
    "weekLabel": "Semaine du 2 au 6 septembre 2026",
    "trainingSchedule": [
      {
        "category": "U6 à U10", "subtitle": "École primaire", "accent": "#f7c600",
        "days": [
          [],
          [{"time":"17h30 – 19h00","pitch":"T4","group":"A – B"}],
          [{"time":"10h00 – 11h30","pitch":"T2"},{"time":"11h30 – 13h00","pitch":"T2","group":"U8/U9 A"}],
          [],
          [{"time":"17h30 – 19h00","pitch":"T4"}]
        ]
      },
      {
        "category": "U11 à U14", "subtitle": "Collège", "accent": "#ef5b8c",
        "days": [
          [{"time":"17h30 – 19h00","pitch":"T2","group":"C – B – A"}],
          [{"time":"17h30 – 19h00","pitch":"T2","group":"C – B – A"}],
          [{"time":"14h00 – 15h30","pitch":"T2","group":"A – B – C"},{"time":"15h30 – 17h00","pitch":"T2","group":"A – B – C"}],
          [{"time":"17h30 – 19h00","pitch":"T2","group":"A – B"}],
          [{"time":"17h30 – 19h00","pitch":"T2","group":"A – B – C"}]
        ]
      },
      {
        "category": "U16 à U18", "subtitle": "Lycée", "accent": "#f47b35",
        "days": [
          [],
          [{"time":"19h00 – 20h30","pitch":"T4","group":"Féminines"}],
          [{"time":"19h00 – 20h30","pitch":"T2","group":"U16"}],
          [{"time":"19h00 – 20h30","pitch":"T2","group":"Féminines"}],
          [{"time":"19h00 – 20h30","pitch":"T2","group":"U18"},{"time":"20h30 – 22h00","pitch":"T2","group":"U18"}]
        ]
      },
      {
        "category": "Féminines", "subtitle": "", "accent": "#f15b88",
        "days": [
          [{"time":"19h00 – 20h30","pitch":"T4"}],
          [],
          [{"time":"19h00 – 20h30","pitch":"T2"}],
          [{"time":"19h00 – 20h30","pitch":"T4"}],
          []
        ]
      },
      {
        "category": "Séniors", "subtitle": "Football adulte", "accent": "#b8d34a",
        "days": [
          [{"time":"20h00 – 22h00","pitch":"T2","group":"Séniors B"},{"time":"20h00 – 22h00","pitch":"T1","group":"Vétérans"}],
          [{"time":"20h00 – 22h00","pitch":"T1","group":"Séniors A"}],
          [{"time":"20h30 – 22h00","pitch":"T4","group":"Séniors A"}],
          [{"time":"20h00 – 22h00","pitch":"T1","group":"Séniors A – B"},{"time":"20h30 – 22h00","pitch":"T2","group":"Séniors A"}],
          [{"time":"20h00 – 22h00","pitch":"T1","group":"Séniors A"}]
        ]
      }
    ]
  }
  $json$::jsonb
)
on conflict (key) do nothing;
