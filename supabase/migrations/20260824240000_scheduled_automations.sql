-- Fin de chantier — Automatisations conditionnelles PLANIFIÉES. 100 % additif et SÛR :
-- évaluées par un cron, elles font uniquement de la LECTURE + une NOTIFICATION (aucune
-- mutation de données métier). « Relances » : ex. prévenir quand des inscriptions restent
-- en attente depuis N jours. Ne touche pas au moteur d'automatisations événementiel existant.

create table if not exists public.scheduled_automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  condition_key text not null,
  threshold_days integer not null default 7,
  channel public.message_channel not null default 'IN_APP',
  template_id uuid references public.message_templates(id) on delete set null,
  recipient_email text,
  is_active boolean not null default true,
  last_run_at timestamptz,
  last_match_count integer,
  created_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_automations_condition_check
    check (condition_key in ('registrations_stale', 'recruitment_stale')),
  constraint scheduled_automations_threshold_check
    check (threshold_days >= 0 and threshold_days <= 3650)
);

create index if not exists scheduled_automations_active_idx
  on public.scheduled_automations (is_active) where deleted_at is null;

drop trigger if exists scheduled_automations_set_updated_at on public.scheduled_automations;
create trigger scheduled_automations_set_updated_at
before update on public.scheduled_automations
for each row execute function public.set_updated_at();

alter table public.scheduled_automations enable row level security;

drop policy if exists "scheduled_automations_admin" on public.scheduled_automations;
create policy "scheduled_automations_admin" on public.scheduled_automations for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
