alter table public.seasons add column if not exists deleted_at timestamptz;
alter table public.seasons add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
alter table public.categories add column if not exists deleted_at timestamptz;
alter table public.categories add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
alter table public.teams add column if not exists deleted_at timestamptz;
alter table public.teams add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
create index if not exists seasons_not_deleted_idx on public.seasons (starts_on desc) where deleted_at is null;
create index if not exists categories_not_deleted_idx on public.categories (order_index) where deleted_at is null;
create index if not exists teams_not_deleted_idx on public.teams (order_index) where deleted_at is null;
