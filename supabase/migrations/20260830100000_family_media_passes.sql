-- Pass Famille Media saisonnier. Ce registre est volontairement distinct de
-- `subscriptions`, qui decrit les abonnements generiques attaches aux profils.

do $$
begin
  create type public.family_media_pass_status as enum (
    'PENDING_REVIEW',
    'ACTIVE',
    'SUSPENDED',
    'REJECTED',
    'CANCELLED',
    'EXPIRED'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.family_media_passes (
  id                       uuid primary key default gen_random_uuid(),
  family_id                uuid not null references public.families(id) on delete cascade,
  season_id                uuid not null references public.seasons(id) on delete restrict,
  status                   public.family_media_pass_status not null default 'PENDING_REVIEW',
  starts_on                date not null,
  ends_on                  date not null,
  allow_photos             boolean not null default false,
  allow_training_videos    boolean not null default false,
  allow_live_matches       boolean not null default false,
  review_note              text,
  reviewed_by              uuid references public.profiles(id) on delete set null,
  reviewed_at              timestamptz,
  created_by               uuid references public.profiles(id) on delete set null,
  updated_by               uuid references public.profiles(id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint family_media_passes_family_season_unique unique (family_id, season_id),
  constraint family_media_passes_date_order check (ends_on >= starts_on),
  constraint family_media_passes_rights_check check (
    allow_photos or allow_training_videos or allow_live_matches
  ),
  constraint family_media_passes_review_check check (
    status not in ('ACTIVE', 'REJECTED')
    or (reviewed_by is not null and reviewed_at is not null)
  ),
  constraint family_media_passes_review_note_length check (
    review_note is null or char_length(review_note) <= 1000
  )
);

create table if not exists public.family_media_pass_teams (
  pass_id     uuid not null references public.family_media_passes(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete restrict,
  created_at  timestamptz not null default now(),
  primary key (pass_id, team_id)
);

create index if not exists family_media_passes_family_idx
  on public.family_media_passes (family_id, status);

create index if not exists family_media_passes_season_idx
  on public.family_media_passes (season_id, status);

create index if not exists family_media_pass_teams_team_idx
  on public.family_media_pass_teams (team_id, pass_id);

drop trigger if exists family_media_passes_set_updated_at on public.family_media_passes;
create trigger family_media_passes_set_updated_at
before update on public.family_media_passes
for each row execute function public.set_updated_at();

-- La contrainte est differee pour autoriser le remplacement atomique de toute
-- la portee d'equipes, mais elle est toujours verifiee avant le commit.
create or replace function public.validate_family_media_pass_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pass_id uuid;
  v_pass public.family_media_passes%rowtype;
  v_season public.seasons%rowtype;
begin
  if tg_table_name = 'family_media_passes' then
    v_pass_id := new.id;
  else
    v_pass_id := coalesce(new.pass_id, old.pass_id);
  end if;

  select * into v_pass from public.family_media_passes where id = v_pass_id;
  if not found then
    return null;
  end if;

  select * into v_season from public.seasons where id = v_pass.season_id and deleted_at is null;
  if not found or v_pass.starts_on < v_season.starts_on or v_pass.ends_on > v_season.ends_on then
    raise exception 'Pass dates must be inside the selected season';
  end if;

  if not exists (select 1 from public.family_media_pass_teams where pass_id = v_pass_id) then
    raise exception 'At least one team is required';
  end if;

  if exists (
    select 1
    from public.family_media_pass_teams scopes
    left join public.teams teams on teams.id = scopes.team_id
    where scopes.pass_id = v_pass_id
      and (teams.id is null or teams.deleted_at is not null or teams.season_id is distinct from v_pass.season_id)
  ) then
    raise exception 'Every team must belong to the selected season';
  end if;

  return null;
end;
$$;

drop trigger if exists family_media_passes_integrity_check on public.family_media_passes;
create constraint trigger family_media_passes_integrity_check
after insert or update on public.family_media_passes
deferrable initially deferred
for each row execute function public.validate_family_media_pass_integrity();

drop trigger if exists family_media_pass_teams_integrity_check on public.family_media_pass_teams;
create constraint trigger family_media_pass_teams_integrity_check
after insert or update or delete on public.family_media_pass_teams
deferrable initially deferred
for each row execute function public.validate_family_media_pass_integrity();

alter table public.family_media_passes enable row level security;
alter table public.family_media_pass_teams enable row level security;

-- Le registre contient des notes et identifiants de validation internes : les
-- familles passeront par une projection serveur dediee, ajoutee avec l'espace media.
drop policy if exists "family_media_passes_admin_read" on public.family_media_passes;
create policy "family_media_passes_admin_read"
on public.family_media_passes
for select
to authenticated
using (public.is_admin_role());

drop policy if exists "family_media_passes_admin_write" on public.family_media_passes;
create policy "family_media_passes_admin_write"
on public.family_media_passes
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "family_media_pass_teams_admin_read" on public.family_media_pass_teams;
create policy "family_media_pass_teams_admin_read"
on public.family_media_pass_teams
for select
to authenticated
using (public.is_admin_role());

drop policy if exists "family_media_pass_teams_admin_write" on public.family_media_pass_teams;
create policy "family_media_pass_teams_admin_write"
on public.family_media_pass_teams
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

grant select, insert, update, delete on public.family_media_passes to authenticated;
grant select, insert, update, delete on public.family_media_pass_teams to authenticated;

-- Enregistre le pass et remplace sa portee d'equipes dans une seule transaction.
-- La fonction n'est executable que via le client service_role des routes serveur.
create or replace function public.save_family_media_pass(
  p_id uuid,
  p_family_id uuid,
  p_season_id uuid,
  p_status public.family_media_pass_status,
  p_starts_on date,
  p_ends_on date,
  p_allow_photos boolean,
  p_allow_training_videos boolean,
  p_allow_live_matches boolean,
  p_team_ids uuid[],
  p_review_note text,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_season_starts_on date;
  v_season_ends_on date;
  v_reviewed_by uuid;
  v_reviewed_at timestamptz;
  v_team_count integer;
begin
  if p_actor_id is null or not exists (select 1 from public.profiles where id = p_actor_id) then
    raise exception 'A valid CRM actor is required';
  end if;

  if not exists (select 1 from public.families where id = p_family_id and deleted_at is null) then
    raise exception 'Family not found';
  end if;

  select starts_on, ends_on
    into v_season_starts_on, v_season_ends_on
  from public.seasons
  where id = p_season_id and deleted_at is null;

  if not found then
    raise exception 'Season not found';
  end if;

  if p_starts_on < v_season_starts_on or p_ends_on > v_season_ends_on or p_ends_on < p_starts_on then
    raise exception 'Pass dates must be inside the selected season';
  end if;

  if not (p_allow_photos or p_allow_training_videos or p_allow_live_matches) then
    raise exception 'At least one media right is required';
  end if;

  if p_team_ids is null or cardinality(p_team_ids) = 0 then
    raise exception 'At least one team is required';
  end if;

  select count(*)
    into v_team_count
  from public.teams
  where id = any(p_team_ids)
    and season_id = p_season_id
    and deleted_at is null;

  if v_team_count <> cardinality(p_team_ids) then
    raise exception 'Every team must exist once and belong to the selected season';
  end if;

  if p_id is not null then
    select reviewed_by, reviewed_at
      into v_reviewed_by, v_reviewed_at
    from public.family_media_passes
    where id = p_id
    for update;

    if not found then
      raise exception 'Family media pass not found';
    end if;
  end if;

  if p_status = 'PENDING_REVIEW' then
    v_reviewed_by := null;
    v_reviewed_at := null;
  elsif p_status in ('ACTIVE', 'REJECTED') then
    v_reviewed_by := p_actor_id;
    v_reviewed_at := now();
  end if;

  if p_id is null then
    insert into public.family_media_passes (
      family_id,
      season_id,
      status,
      starts_on,
      ends_on,
      allow_photos,
      allow_training_videos,
      allow_live_matches,
      review_note,
      reviewed_by,
      reviewed_at,
      created_by,
      updated_by
    ) values (
      p_family_id,
      p_season_id,
      p_status,
      p_starts_on,
      p_ends_on,
      p_allow_photos,
      p_allow_training_videos,
      p_allow_live_matches,
      p_review_note,
      v_reviewed_by,
      v_reviewed_at,
      p_actor_id,
      p_actor_id
    ) returning id into v_id;
  else
    update public.family_media_passes
    set family_id = p_family_id,
        season_id = p_season_id,
        status = p_status,
        starts_on = p_starts_on,
        ends_on = p_ends_on,
        allow_photos = p_allow_photos,
        allow_training_videos = p_allow_training_videos,
        allow_live_matches = p_allow_live_matches,
        review_note = p_review_note,
        reviewed_by = v_reviewed_by,
        reviewed_at = v_reviewed_at,
        updated_by = p_actor_id
    where id = p_id
    returning id into v_id;
  end if;

  delete from public.family_media_pass_teams where pass_id = v_id;
  insert into public.family_media_pass_teams (pass_id, team_id)
  select v_id, team_id from unnest(p_team_ids) as team_id;

  return v_id;
end;
$$;

revoke all on function public.save_family_media_pass(
  uuid, uuid, uuid, public.family_media_pass_status, date, date,
  boolean, boolean, boolean, uuid[], text, uuid
) from public, anon, authenticated;

grant execute on function public.save_family_media_pass(
  uuid, uuid, uuid, public.family_media_pass_status, date, date,
  boolean, boolean, boolean, uuid[], text, uuid
) to service_role;
