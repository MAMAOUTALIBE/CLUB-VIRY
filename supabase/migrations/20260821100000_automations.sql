-- Automatisations du CRM.
--
-- Une règle n'est PAS créée librement : chaque clé correspond à un comportement
-- réellement câblé dans le code (`src/lib/automations.ts`). Le CRM pilote donc
-- l'activation de ces règles et expose leur journal d'exécution, plutôt que de
-- laisser inventer des règles qui ne déclencheraient rien.

create table if not exists public.automation_rules (
  key text primary key,
  is_enabled boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null references public.automation_rules(key) on delete cascade,
  status text not null check (status in ('SUCCESS', 'SKIPPED', 'FAILED')),
  message text,
  affected_count integer not null default 0,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists automation_runs_rule_created_idx
  on public.automation_runs (rule_key, created_at desc);

create index if not exists automation_runs_created_idx
  on public.automation_runs (created_at desc);

-- Les règles câblées aujourd'hui. Rejouable : `do nothing` préserve l'état d'activation.
insert into public.automation_rules (key) values
  ('match_callups'),
  ('team_session_change'),
  ('team_media_added'),
  ('team_news_published'),
  ('registration_subscription'),
  ('notification_dispatch')
on conflict (key) do nothing;

drop trigger if exists automation_rules_set_updated_at on public.automation_rules;
create trigger automation_rules_set_updated_at
before update on public.automation_rules
for each row execute function public.set_updated_at();

alter table public.automation_rules enable row level security;
alter table public.automation_runs enable row level security;

-- Aucune lecture publique : ces tables décrivent le fonctionnement interne du club.
drop policy if exists "automation_rules_admin_all" on public.automation_rules;
create policy "automation_rules_admin_all"
on public.automation_rules
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

-- Le journal est écrit par le service role (hors RLS) : les administrateurs le lisent seulement.
drop policy if exists "automation_runs_admin_read" on public.automation_runs;
create policy "automation_runs_admin_read"
on public.automation_runs
for select
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
