-- Registration workflow foundations.

do $$
begin
  create type public.registration_status as enum (
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'MISSING_DOCUMENTS',
    'VALIDATED',
    'REJECTED',
    'CANCELLED'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_status as enum ('REQUESTED', 'UPLOADED', 'VALIDATED', 'REJECTED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete restrict,
  family_id uuid not null references public.families(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  submitted_by uuid references public.profiles(id) on delete set null,
  status public.registration_status not null default 'SUBMITTED',
  notes text,
  admin_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, player_id)
);

create table if not exists public.registration_documents (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  document_type text not null,
  label text not null,
  status public.document_status not null default 'REQUESTED',
  file_path text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, document_type)
);

create index if not exists registrations_family_idx
  on public.registrations (family_id, created_at desc);

create index if not exists registrations_player_idx
  on public.registrations (player_id);

create index if not exists registrations_status_idx
  on public.registrations (status);

create index if not exists registration_documents_registration_idx
  on public.registration_documents (registration_id);

create or replace function public.can_access_registration(target_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.registrations
    where id = target_registration_id
      and (public.is_family_member(family_id) or public.is_admin_role())
  );
$$;

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

drop trigger if exists registration_documents_set_updated_at on public.registration_documents;
create trigger registration_documents_set_updated_at
before update on public.registration_documents
for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;
alter table public.registration_documents enable row level security;

drop policy if exists "registrations_family_read" on public.registrations;
create policy "registrations_family_read"
on public.registrations
for select
to authenticated
using (public.is_family_member(family_id) or public.is_admin_role());

drop policy if exists "registrations_family_insert" on public.registrations;
create policy "registrations_family_insert"
on public.registrations
for insert
to authenticated
with check (public.is_family_member(family_id) or public.is_admin_role());

drop policy if exists "registrations_family_update" on public.registrations;
create policy "registrations_family_update"
on public.registrations
for update
to authenticated
using (
  public.is_admin_role()
  or (public.is_family_member(family_id) and status in ('DRAFT', 'SUBMITTED', 'MISSING_DOCUMENTS'))
)
with check (
  public.is_admin_role()
  or (public.is_family_member(family_id) and status in ('DRAFT', 'SUBMITTED', 'MISSING_DOCUMENTS'))
);

drop policy if exists "registrations_admin_delete" on public.registrations;
create policy "registrations_admin_delete"
on public.registrations
for delete
to authenticated
using (public.is_admin_role());

drop policy if exists "registration_documents_family_read" on public.registration_documents;
create policy "registration_documents_family_read"
on public.registration_documents
for select
to authenticated
using (public.can_access_registration(registration_id));

drop policy if exists "registration_documents_family_insert" on public.registration_documents;
create policy "registration_documents_family_insert"
on public.registration_documents
for insert
to authenticated
with check (public.can_access_registration(registration_id));

drop policy if exists "registration_documents_family_update" on public.registration_documents;
create policy "registration_documents_family_update"
on public.registration_documents
for update
to authenticated
using (public.can_access_registration(registration_id))
with check (public.can_access_registration(registration_id));

drop policy if exists "registration_documents_admin_delete" on public.registration_documents;
create policy "registration_documents_admin_delete"
on public.registration_documents
for delete
to authenticated
using (public.is_admin_role());

grant select, insert, update, delete on public.registrations to authenticated;
grant select, insert, update, delete on public.registration_documents to authenticated;
grant execute on function public.can_access_registration(uuid) to authenticated;
