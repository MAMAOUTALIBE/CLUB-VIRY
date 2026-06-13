-- Gouvernance : annuaire des personnes (bureau exécutif + dirigeants).
-- Table curée, INDÉPENDANTE des comptes : un membre du bureau n'a pas besoin de compte CRM.
-- Donnée non sensible et publique par nature (nom + fonction + photo).

do $$
begin
  create type public.official_category as enum ('BUREAU', 'DIRIGEANT');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.club_officials (
  id uuid primary key default gen_random_uuid(),
  category public.official_category not null default 'DIRIGEANT',
  full_name text not null,
  position text not null,
  photo_url text,
  profile_id uuid references public.profiles(id) on delete set null,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_officials_full_name_len check (char_length(full_name) between 2 and 120),
  constraint club_officials_position_len check (char_length(position) between 2 and 120)
);

create index if not exists club_officials_category_order_idx
  on public.club_officials (category, order_index);

drop trigger if exists club_officials_set_updated_at on public.club_officials;
create trigger club_officials_set_updated_at
before update on public.club_officials
for each row execute function public.set_updated_at();

-- Lecture publique des membres actifs uniquement (les écritures passent par le service role admin).
alter table public.club_officials enable row level security;

drop policy if exists club_officials_public_read on public.club_officials;
create policy club_officials_public_read
  on public.club_officials for select
  using (is_active = true);
