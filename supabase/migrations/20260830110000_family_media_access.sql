-- Protection effective des contenus reserves au Pass Famille Media.
-- Toutes les lignes existantes restent PUBLIC par defaut.

do $$
begin
  create type public.content_access_level as enum ('PUBLIC', 'FAMILY_PASS');
exception
  when duplicate_object then null;
end $$;

alter table public.media_assets
  add column if not exists access_level public.content_access_level not null default 'PUBLIC',
  add column if not exists storage_path text;

alter table public.media_assets alter column url drop not null;

alter table public.media_assets
  drop constraint if exists media_assets_access_source_check,
  add constraint media_assets_access_source_check check (
    (
      access_level = 'PUBLIC'
      and url is not null
      and storage_path is null
    )
    or
    (
      access_level = 'FAMILY_PASS'
      and team_id is not null
      and (
        (
          playback_kind = 'BROADCAST_LINK'
          and type = 'VIDEO'
          and content_kind is not null
          and url is not null
          and storage_path is null
        )
        or
        (
          playback_kind = 'VIDEO'
          and (type = 'PHOTO' or content_kind is not null)
          and url is null
          and storage_path is not null
          and storage_path !~ '(^/|\.\.)'
        )
      )
    )
  );

create index if not exists media_assets_public_access_idx
  on public.media_assets (status, published_at desc)
  where access_level = 'PUBLIC';

create index if not exists media_assets_family_access_idx
  on public.media_assets (team_id, status, published_at desc)
  where access_level = 'FAMILY_PASS';

alter table public.matches
  add column if not exists access_level public.content_access_level not null default 'PUBLIC';

alter table public.matches
  drop constraint if exists matches_family_pass_team_check,
  add constraint matches_family_pass_team_check check (
    access_level = 'PUBLIC' or team_id is not null
  );

create index if not exists matches_family_access_idx
  on public.matches (team_id, status, starts_at desc)
  where access_level = 'FAMILY_PASS';

-- Les familles ne lisent jamais directement les lignes premium. Les routes
-- serveur utilisent service_role apres verification du pass.
drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
on public.media_assets
for select
to anon, authenticated
using (access_level = 'PUBLIC' or public.is_admin_role());

-- Les metadonnees sportives des matchs restent publiques. En revanche, la
-- colonne follow_url est retiree des privileges directs anon/authenticated :
-- seul le serveur peut la projeter, et uniquement pour un match PUBLIC.
revoke select on public.matches from anon, authenticated;
grant select (
  id,
  team_id,
  season_id,
  title,
  category_id,
  group_label,
  pitch_code,
  opponent_name,
  opponent_logo_url,
  location,
  starts_at,
  ends_at,
  venue,
  competition,
  status,
  home_score,
  away_score,
  live_minute,
  visibility,
  access_level,
  created_at,
  updated_at
) on public.matches to anon, authenticated;

-- Bucket prive : aucun acces famille direct. Les administrateurs peuvent le
-- gerer via Supabase, les lectures famille passent par le proxy applicatif.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'family-media',
  'family-media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "family_media_admin_manage" on storage.objects;
create policy "family_media_admin_manage"
on storage.objects
for all
to authenticated
using (bucket_id = 'family-media' and public.is_admin_role())
with check (bucket_id = 'family-media' and public.is_admin_role());
