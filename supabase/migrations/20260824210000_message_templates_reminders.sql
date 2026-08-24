-- Phase I — Modèles de messages (e-mail/SMS) + Rappels planifiés. 100 % additif.
-- Étend le pilotage de la communication : des modèles réutilisables et des rappels
-- datés, traités par un point d'entrée qui crée des notifications (in-app immédiat,
-- e-mail mis en file pour l'envoi quand le SMTP sera branché).

do $$
begin
  create type public.message_channel as enum ('EMAIL', 'SMS', 'IN_APP');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.reminder_status as enum ('PENDING', 'SENT', 'CANCELLED');
exception when duplicate_object then null;
end $$;

-- Modèle de message réutilisable.
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  channel public.message_channel not null default 'EMAIL',
  subject text,
  body text not null,
  description text,
  is_active boolean not null default true,
  order_index integer not null default 0,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_templates_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

create unique index if not exists message_templates_key_uidx
  on public.message_templates (key) where deleted_at is null;

-- Rappel planifié : envoyé (ou notifié) à sa date d'échéance.
create table if not exists public.scheduled_reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel public.message_channel not null default 'IN_APP',
  template_id uuid references public.message_templates(id) on delete set null,
  subject text,
  body text,
  run_at timestamptz not null,
  recipient_email text,
  status public.reminder_status not null default 'PENDING',
  sent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scheduled_reminders_due_idx
  on public.scheduled_reminders (status, run_at) where deleted_at is null;

drop trigger if exists message_templates_set_updated_at on public.message_templates;
create trigger message_templates_set_updated_at
before update on public.message_templates
for each row execute function public.set_updated_at();

drop trigger if exists scheduled_reminders_set_updated_at on public.scheduled_reminders;
create trigger scheduled_reminders_set_updated_at
before update on public.scheduled_reminders
for each row execute function public.set_updated_at();

alter table public.message_templates enable row level security;
alter table public.scheduled_reminders enable row level security;

drop policy if exists "message_templates_admin" on public.message_templates;
create policy "message_templates_admin" on public.message_templates for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "scheduled_reminders_admin" on public.scheduled_reminders;
create policy "scheduled_reminders_admin" on public.scheduled_reminders for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

-- Amorce : un modèle d'exemple pour que l'écran ne soit pas vide.
insert into public.message_templates (key, name, channel, subject, body, description, order_index)
values (
  'rappel_cotisation',
  'Rappel de cotisation',
  'EMAIL',
  'Rappel : cotisation {saison}',
  'Bonjour {prenom},' || chr(10) || chr(10) || 'Nous vous rappelons que la cotisation de la saison {saison} reste à régler. Merci de vous rapprocher du secrétariat.' || chr(10) || chr(10) || 'Sportivement, l''ES Viry-Châtillon.',
  'Exemple de modèle. Les {placeholders} sont remplacés lors de l''envoi.',
  10
)
on conflict do nothing;
