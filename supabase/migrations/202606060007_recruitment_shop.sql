-- Recruitment applications and shop foundations.

do $$
begin
  create type public.application_status as enum ('PENDING', 'CONTACTED', 'TRIAL_SCHEDULED', 'ACCEPTED', 'REJECTED', 'ARCHIVED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_status as enum ('DRAFT', 'ACTIVE', 'ARCHIVED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum ('PENDING', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'REFUNDED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.recruitment_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  email text not null,
  phone text,
  current_club text,
  position text,
  category_id uuid references public.categories(id) on delete set null,
  message text,
  status public.application_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruitment_birth_date_valid check (birth_date <= current_date)
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  status public.product_status not null default 'DRAFT',
  price_cents integer not null,
  currency text not null default 'EUR',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint products_price_positive check (price_cents >= 0)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  sku text unique,
  stock_quantity integer not null default 0,
  price_delta_cents integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_stock_positive check (stock_quantity >= 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null,
  customer_name text not null,
  phone text,
  status public.order_status not null default 'PENDING',
  total_cents integer not null default 0,
  currency text not null default 'EUR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_positive check (total_cents >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  label text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  total_cents integer not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_prices_positive check (unit_price_cents >= 0 and total_cents >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  registration_id uuid references public.registrations(id) on delete set null,
  provider text not null,
  provider_reference text,
  status public.payment_status not null default 'PENDING',
  amount_cents integer not null,
  currency text not null default 'EUR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount_cents >= 0)
);

create index if not exists recruitment_applications_status_idx
  on public.recruitment_applications (status, created_at desc);

create index if not exists products_public_idx
  on public.products (status, order_index);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, is_active);

create index if not exists orders_profile_idx
  on public.orders (profile_id, created_at desc);

create index if not exists payments_order_idx
  on public.payments (order_id);

drop trigger if exists recruitment_applications_set_updated_at on public.recruitment_applications;
create trigger recruitment_applications_set_updated_at
before update on public.recruitment_applications
for each row execute function public.set_updated_at();

drop trigger if exists product_categories_set_updated_at on public.product_categories;
create trigger product_categories_set_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

alter table public.recruitment_applications enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists "recruitment_public_insert" on public.recruitment_applications;
create policy "recruitment_public_insert"
on public.recruitment_applications
for insert
to anon, authenticated
with check (true);

drop policy if exists "recruitment_admin_read" on public.recruitment_applications;
create policy "recruitment_admin_read"
on public.recruitment_applications
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "recruitment_admin_update" on public.recruitment_applications;
create policy "recruitment_admin_update"
on public.recruitment_applications
for update
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "product_categories_public_read" on public.product_categories;
create policy "product_categories_public_read"
on public.product_categories
for select
to anon, authenticated
using (is_active = true or public.is_admin_role());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products
for select
to anon, authenticated
using (status = 'ACTIVE' or public.is_admin_role());

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read"
on public.product_variants
for select
to anon, authenticated
using (is_active = true or public.is_admin_role());

drop policy if exists "shop_admin_write_categories" on public.product_categories;
create policy "shop_admin_write_categories"
on public.product_categories
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "shop_admin_write_products" on public.products;
create policy "shop_admin_write_products"
on public.products
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "shop_admin_write_variants" on public.product_variants;
create policy "shop_admin_write_variants"
on public.product_variants
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "orders_own_read" on public.orders;
create policy "orders_own_read"
on public.orders
for select
to authenticated
using (profile_id = auth.uid() or public.is_admin_role());

drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write"
on public.orders
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "order_items_own_read" on public.order_items;
create policy "order_items_own_read"
on public.order_items
for select
to authenticated
using (
  public.is_admin_role()
  or exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.profile_id = auth.uid()
  )
);

drop policy if exists "payments_own_read" on public.payments;
create policy "payments_own_read"
on public.payments
for select
to authenticated
using (
  public.is_admin_role()
  or exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and orders.profile_id = auth.uid()
  )
);

grant insert on public.recruitment_applications to anon, authenticated;
grant select on public.product_categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select, insert, update on public.recruitment_applications to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_variants to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
