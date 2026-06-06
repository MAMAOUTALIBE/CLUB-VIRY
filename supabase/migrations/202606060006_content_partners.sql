-- Public content, media and partners.

do $$
begin
  create type public.publication_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.media_type as enum ('PHOTO', 'VIDEO');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.request_status as enum ('PENDING', 'CONTACTED', 'ACCEPTED', 'REJECTED', 'ARCHIVED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status public.publication_status not null default 'DRAFT',
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.media_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  status public.publication_status not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_albums_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.media_albums(id) on delete set null,
  type public.media_type not null default 'PHOTO',
  title text not null,
  url text not null,
  thumbnail_url text,
  alt_text text,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website_url text,
  tier text,
  description text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partners_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.partnership_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  message text,
  status public.request_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_public_idx
  on public.news (status, published_at desc);

create index if not exists media_albums_public_idx
  on public.media_albums (status, published_at desc);

create index if not exists media_assets_album_idx
  on public.media_assets (album_id, created_at desc);

create index if not exists partners_active_order_idx
  on public.partners (is_active, order_index);

create index if not exists partnership_requests_status_idx
  on public.partnership_requests (status, created_at desc);

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists media_albums_set_updated_at on public.media_albums;
create trigger media_albums_set_updated_at
before update on public.media_albums
for each row execute function public.set_updated_at();

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

drop trigger if exists partnership_requests_set_updated_at on public.partnership_requests;
create trigger partnership_requests_set_updated_at
before update on public.partnership_requests
for each row execute function public.set_updated_at();

alter table public.news enable row level security;
alter table public.media_albums enable row level security;
alter table public.media_assets enable row level security;
alter table public.partners enable row level security;
alter table public.partnership_requests enable row level security;

drop policy if exists "news_public_read" on public.news;
create policy "news_public_read"
on public.news
for select
to anon, authenticated
using (status = 'PUBLISHED' or public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "news_admin_write" on public.news;
create policy "news_admin_write"
on public.news
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "media_albums_public_read" on public.media_albums;
create policy "media_albums_public_read"
on public.media_albums
for select
to anon, authenticated
using (status = 'PUBLISHED' or public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "media_albums_admin_write" on public.media_albums;
create policy "media_albums_admin_write"
on public.media_albums
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
on public.media_assets
for select
to anon, authenticated
using (true);

drop policy if exists "media_assets_admin_write" on public.media_assets;
create policy "media_assets_admin_write"
on public.media_assets
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "partners_public_read" on public.partners;
create policy "partners_public_read"
on public.partners
for select
to anon, authenticated
using (is_active = true or public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "partners_admin_write" on public.partners;
create policy "partners_admin_write"
on public.partners
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "partnership_requests_public_insert" on public.partnership_requests;
create policy "partnership_requests_public_insert"
on public.partnership_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "partnership_requests_admin_read" on public.partnership_requests;
create policy "partnership_requests_admin_read"
on public.partnership_requests
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "partnership_requests_admin_update" on public.partnership_requests;
create policy "partnership_requests_admin_update"
on public.partnership_requests
for update
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

grant select on public.news to anon, authenticated;
grant select on public.media_albums to anon, authenticated;
grant select on public.media_assets to anon, authenticated;
grant select on public.partners to anon, authenticated;
grant insert on public.partnership_requests to anon, authenticated;
grant select, insert, update, delete on public.news to authenticated;
grant select, insert, update, delete on public.media_albums to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select, insert, update, delete on public.partners to authenticated;
grant select, insert, update on public.partnership_requests to authenticated;
