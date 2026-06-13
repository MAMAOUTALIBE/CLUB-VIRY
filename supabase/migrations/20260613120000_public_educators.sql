-- Annuaire public des éducateurs : publication opt-in des encadrants sur le site vitrine.
-- Ajoute des champs de curation sur profiles + une fonction de lecture PII-safe pour le frontend.

alter table public.profiles
  add column if not exists public_profile boolean not null default false,
  add column if not exists public_title text,
  add column if not exists public_bio text;

create index if not exists profiles_public_profile_idx
  on public.profiles (public_profile)
  where public_profile = true;

-- Annuaire public PII-safe des éducateurs ayant donné leur accord (public_profile = true).
-- Ne renvoie QUE des champs publiables : jamais phone / email / birth_date.
-- "activité" = agrégats non nominatifs (équipes, séances, matchs) sur les équipes encadrées.
create or replace function public.public_educators()
returns table (
  id uuid,
  name text,
  avatar_url text,
  title text,
  bio text,
  teams jsonb,
  team_count integer,
  session_count integer,
  match_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  with edu as (
    select
      p.id,
      coalesce(
        nullif(case when p.display_name like '%@%' then null else trim(p.display_name) end, ''),
        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
        'Éducateur'
      ) as name,
      p.avatar_url,
      p.public_title,
      p.public_bio
    from public.profiles p
    where p.public_profile = true
      and p.status = 'ACTIVE'
      and p.role in ('SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT', 'EDUCATEUR')
  ),
  edu_teams as (
    select
      ts.profile_id,
      t.id as team_id,
      t.name,
      t.slug,
      coalesce(nullif(t.age_range, ''), nullif(t.level, ''), 'Équipe') as category,
      ts.role_title,
      ts.is_head_coach
    from public.team_staff ts
    join public.teams t on t.id = ts.team_id and t.is_active = true
    where ts.profile_id is not null
  )
  select
    e.id,
    e.name,
    e.avatar_url,
    e.public_title as title,
    e.public_bio as bio,
    coalesce(
      (select jsonb_agg(
                jsonb_build_object(
                  'name', et.name,
                  'slug', et.slug,
                  'category', et.category,
                  'roleTitle', et.role_title,
                  'isHeadCoach', et.is_head_coach
                )
                order by et.is_head_coach desc, et.name
              )
       from edu_teams et where et.profile_id = e.id),
      '[]'::jsonb
    ) as teams,
    (select count(distinct et.team_id) from edu_teams et where et.profile_id = e.id)::integer as team_count,
    (select count(*) from public.training_sessions s
       where s.team_id in (select et.team_id from edu_teams et where et.profile_id = e.id))::integer as session_count,
    (select count(*) from public.matches m
       where m.team_id in (select et.team_id from edu_teams et where et.profile_id = e.id))::integer as match_count
  from edu e
  order by e.name;
$$;

grant execute on function public.public_educators() to anon, authenticated, service_role;
