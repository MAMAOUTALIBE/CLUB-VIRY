-- Fiche éducateur enrichie : ancienneté au club, diplômes multiples,
-- spécialités (tags) et citation. Affichés sur la page Encadrement et la fiche.

alter table public.profiles add column if not exists public_joined_year integer;
alter table public.profiles add column if not exists public_diplomas jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists public_specialties jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists public_quote text;

-- La signature change (nouvelles colonnes) : DROP avant CREATE.
drop function if exists public.public_educators();

create or replace function public.public_educators()
returns table (
  id uuid,
  name text,
  avatar_url text,
  title text,
  diploma text,
  joined_year integer,
  diplomas jsonb,
  specialties jsonb,
  quote text,
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
      p.public_diploma,
      p.public_joined_year,
      p.public_diplomas,
      p.public_specialties,
      p.public_quote,
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
    e.public_diploma as diploma,
    e.public_joined_year as joined_year,
    coalesce(e.public_diplomas, '[]'::jsonb) as diplomas,
    coalesce(e.public_specialties, '[]'::jsonb) as specialties,
    e.public_quote as quote,
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
