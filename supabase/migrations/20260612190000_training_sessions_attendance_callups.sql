-- Espace educateur V2 : vie d'equipe
--   training_sessions  : seances / entrainements d'une equipe
--   session_attendance : presences des joueurs a une seance
--   match_callups      : convocations des joueurs a un match
--
-- Securite : ecriture RLS reservee aux roles d'administration. Les educateurs
-- agissent via /api/educator/* (service role) avec controle canManageTeam — meme
-- modele que matches / team_players apres durcissement. Ces tables sont INTERNES
-- (pas de lecture publique).

-- ============ SEANCES ============
create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  starts_at timestamptz not null,
  duration_min integer,
  location text,
  theme text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists training_sessions_team_starts_idx on public.training_sessions (team_id, starts_at desc);

-- ============ PRESENCES ============
create table if not exists public.session_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'PRESENT' check (status in ('PRESENT', 'ABSENT', 'EXCUSE', 'BLESSE')),
  created_at timestamptz not null default now(),
  unique (session_id, player_id)
);
create index if not exists session_attendance_session_idx on public.session_attendance (session_id);

-- ============ CONVOCATIONS ============
create table if not exists public.match_callups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'CONVOQUE' check (status in ('CONVOQUE', 'REMPLACANT', 'NON_CONVOQUE', 'BLESSE')),
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);
create index if not exists match_callups_match_idx on public.match_callups (match_id);

-- ============ RLS (admin-only ; educateurs via service role applicatif) ============
alter table public.training_sessions enable row level security;
alter table public.session_attendance enable row level security;
alter table public.match_callups enable row level security;

drop policy if exists "training_sessions_admin_all" on public.training_sessions;
create policy "training_sessions_admin_all"
on public.training_sessions for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "session_attendance_admin_all" on public.session_attendance;
create policy "session_attendance_admin_all"
on public.session_attendance for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "match_callups_admin_all" on public.match_callups;
create policy "match_callups_admin_all"
on public.match_callups for all to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

grant select, insert, update, delete on public.training_sessions to authenticated;
grant select, insert, update, delete on public.session_attendance to authenticated;
grant select, insert, update, delete on public.match_callups to authenticated;
