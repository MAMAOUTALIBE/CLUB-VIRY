-- Seed du contenu vitrine (équipes, staff d'équipe, actualités) DANS la base, afin qu'il
-- devienne éditable / supprimable depuis le CRM au lieu de rester figé dans le code.
--
-- Idempotent : réexécutable sans créer de doublon (on conflict do nothing + gardes not exists).
--
-- Hors périmètre volontairement :
--  * PARTENAIRES : déjà présents en base (migrations 20260709*). Rien à faire ici.
--  * Annuaire ÉDUCATEURS (/le-club/encadrement) : il est généré à partir de VRAIS comptes
--    (public.profiles avec public_profile = true), pas d'une table de contenu. Les éducateurs
--    fictifs du code (noms de démo) ne sont donc pas insérés. Les entraîneurs RÉELS sont, eux,
--    rattachés à leur équipe via team_staff ci-dessous (profile_id NULL, aucun compte créé).

-- 1) Poule du championnat : colonne dédiée. Tant qu'elle est NULL, le site affiche
--    « Poule à confirmer » côté U18 A / U16 B / U14 B.
alter table public.teams add column if not exists pool text;

-- 2) Équipes (saison 2025 / 2026).
insert into public.teams (name, slug, level, age_range, gender, description, cover_image_url, pool, order_index, is_active)
values
  ('Seniors A',     'seniors-a',     'D2', 'Seniors',   'MIXTE',   'L''équipe fanion du club, engagée en Départemental 2.',                                                                     'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80', null,               10,  true),
  ('Seniors B',     'seniors-b',     'D3', 'Seniors',   'MIXTE',   'L''équipe réserve, engagée en Départemental 3 : la passerelle entre la formation et le groupe fanion.',                     'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80', null,               20,  true),
  ('U18 A',         'u18-a',         'D3', 'Formation', 'MIXTE',   'Le groupe de fin de formation, engagé en Départemental 3, dernière marche avant les seniors.',                              'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80', 'Poule à confirmer', 30,  true),
  ('U16 A',         'u16-a',         'D2', 'Jeunes',    'MIXTE',   'Le groupe compétition de la catégorie U16, engagé en Départemental 2.',                                                     'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', null,               40,  true),
  ('U16 B',         'u16-b',         'D4', 'Jeunes',    'MIXTE',   'Le second groupe U16, engagé en Départemental 4, pour continuer à jouer et à progresser.',                                  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', 'Poule à confirmer', 50,  true),
  ('U14 A',         'u14-a',         'D2', 'Jeunes',    'MIXTE',   'L''entrée dans le football à 11, en Départemental 2, entre apprentissage technique et exigences de la compétition.',        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', null,               60,  true),
  ('U14 B',         'u14-b',         'D4', 'Jeunes',    'MIXTE',   'Le second groupe U14, engagé en Départemental 4, pour offrir du temps de jeu à tous les joueurs de la catégorie.',          'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', 'Poule à confirmer', 70,  true),
  ('U13',           'u13',           null, 'Jeunes',    'MIXTE',   'La dernière année de football à 8, tournée vers le passage au football à 11.',                                              'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', null,               80,  true),
  ('Féminines',     'feminines',     null, 'Féminines', 'FEMININ', 'Le développement du football féminin avec ambition et accompagnement.',                                                     'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80', null,               90,  true),
  ('École de foot', 'ecole-de-foot', null, 'U6 à U11',  'MIXTE',   'L''apprentissage des fondamentaux dans un cadre familial et structurant.',                                                  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', null,               100, true)
on conflict (slug) do nothing;

-- 3) Encadrement RÉEL rattaché aux équipes (aucun compte créé : profile_id NULL).
--    Équipes sans entraîneur nommé connu (U16 B, U14 B, École de foot, Féminines) : rien ici.
insert into public.team_staff (team_id, display_name, role_title, is_head_coach)
select t.id, v.display_name, v.role_title, v.is_head_coach
from public.teams t
join (values
  ('seniors-a', 'ABDEDDAIM Khaled',   'Entraîneur',         true),
  ('seniors-a', 'FRIHI Fouad',        'Entraîneur adjoint', false),
  ('seniors-b', 'OUARAS Chérif',      'Entraîneur',         true),
  ('seniors-b', 'TRAORÉ Djibril',     'Entraîneur adjoint', false),
  ('u18-a',     'JEAN ETIENNE Yoann', 'Entraîneur',         true),
  ('u16-a',     'BURNER Axel',        'Entraîneur',         true),
  ('u14-a',     'ANAS ABID',          'Éducateur',          true),
  ('u13',       'ROBERTO Kévin',      'Éducateur',          true)
) as v(team_slug, display_name, role_title, is_head_coach) on v.team_slug = t.slug
where not exists (
  select 1 from public.team_staff ts
  where ts.team_id = t.id and ts.display_name = v.display_name
);

-- 4) Actualités (publiées).
insert into public.news (title, slug, excerpt, content, cover_image_url, status, published_at)
values
  ('Victoire des Seniors A !',            'victoire-des-seniors-a',            'Un match maîtrisé de bout en bout et une belle dynamique collective.', 'Un match maîtrisé de bout en bout et une belle dynamique collective.', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-05-24T00:00:00+02:00'),
  ('Stage de perfectionnement',           'stage-de-perfectionnement',         'Vacances d''avril : une semaine de travail, de plaisir et de progression.', 'Vacances d''avril : une semaine de travail, de plaisir et de progression.', 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-04-29T00:00:00+02:00'),
  ('Détection U13 : les dates à retenir', 'detection-u13-les-dates-a-retenir', 'Le club accueille les jeunes talents du territoire pour préparer demain.', 'Le club accueille les jeunes talents du territoire pour préparer demain.', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-04-05T00:00:00+02:00'),
  ('Tournoi U11 : un beau week-end',      'tournoi-u11-un-beau-week-end',      'Bénévoles, éducateurs et familles réunis autour du football.', 'Bénévoles, éducateurs et familles réunis autour du football.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-04-12T00:00:00+02:00'),
  ('École de foot : un bel élan',         'ecole-de-foot-un-bel-elan',         'Retour sur un mois de mars riche en émotions et en progrès.', 'Retour sur un mois de mars riche en émotions et en progrès.', 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-03-31T00:00:00+02:00')
on conflict (slug) do nothing;
