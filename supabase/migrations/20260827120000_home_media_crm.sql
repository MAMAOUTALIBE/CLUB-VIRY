-- Homepage media card: publication lifecycle, content context and live scheduling.
alter table public.media_assets
  add column if not exists content_kind text,
  add column if not exists playback_kind text not null default 'VIDEO',
  add column if not exists status public.publication_status not null default 'DRAFT',
  add column if not exists is_live boolean not null default false,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;

update public.media_assets
set status = 'PUBLISHED'
where published_at is not null
  and status = 'DRAFT';

alter table public.media_assets
  drop constraint if exists media_assets_content_kind_check,
  add constraint media_assets_content_kind_check
    check (content_kind is null or content_kind in ('MATCH', 'TRAINING')),
  drop constraint if exists media_assets_playback_kind_check,
  add constraint media_assets_playback_kind_check
    check (playback_kind in ('VIDEO', 'BROADCAST_LINK')),
  drop constraint if exists media_assets_schedule_check,
  add constraint media_assets_schedule_check
    check (starts_at is null or ends_at is null or ends_at > starts_at);

create index if not exists media_assets_homepage_idx
  on public.media_assets (content_kind, status, is_live, published_at desc)
  where type = 'VIDEO';

-- Optional CRM-configured destination for the live match CTA.
alter table public.matches
  add column if not exists follow_url text;
