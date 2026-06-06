-- Contact messages, notification logs and admin operation foundations.

do $$
begin
  create type public.notification_status as enum ('QUEUED', 'SENT', 'FAILED', 'CANCELLED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status public.request_status not null default 'PENDING',
  source text not null default 'contact_page',
  metadata jsonb not null default '{}'::jsonb,
  assigned_to uuid references public.profiles(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_name_length check (char_length(full_name) between 2 and 160),
  constraint contact_messages_subject_length check (char_length(subject) between 2 and 180),
  constraint contact_messages_message_length check (char_length(message) between 10 and 3000)
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid references public.profiles(id) on delete set null,
  recipient_email text,
  channel text not null default 'email',
  template text not null,
  subject text,
  status public.notification_status not null default 'QUEUED',
  payload jsonb not null default '{}'::jsonb,
  provider_reference text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

create index if not exists contact_messages_email_idx
  on public.contact_messages (email);

create index if not exists notification_logs_status_idx
  on public.notification_logs (status, created_at desc);

create index if not exists notification_logs_recipient_idx
  on public.notification_logs (recipient_profile_id, created_at desc);

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists notification_logs_set_updated_at on public.notification_logs;
create trigger notification_logs_set_updated_at
before update on public.notification_logs
for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
on public.contact_messages
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update"
on public.contact_messages
for update
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "notification_logs_admin_read" on public.notification_logs;
create policy "notification_logs_admin_read"
on public.notification_logs
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "notification_logs_service_insert" on public.notification_logs;
create policy "notification_logs_service_insert"
on public.notification_logs
for insert
to authenticated
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "notification_logs_admin_update" on public.notification_logs;
create policy "notification_logs_admin_update"
on public.notification_logs
for update
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
grant select, insert, update on public.notification_logs to authenticated;
