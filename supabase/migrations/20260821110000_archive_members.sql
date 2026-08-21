-- Archivage réversible des adhérents : joueurs, familles et abonnements.
--
-- Ces lignes portent l'historique sportif et administratif du club (dossiers
-- d'inscription, convocations, paiements) : une suppression définitive casserait
-- ces rattachements. On archive donc, et la purge reste bloquée tant qu'une
-- dépendance existe (voir PURGE_DEPENDENCIES dans src/lib/db/soft-delete.ts).

alter table public.players add column if not exists deleted_at timestamptz;
alter table public.players add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
alter table public.families add column if not exists deleted_at timestamptz;
alter table public.families add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
alter table public.subscriptions add column if not exists deleted_at timestamptz;
alter table public.subscriptions add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists players_not_deleted_idx on public.players (created_at desc) where deleted_at is null;
create index if not exists families_not_deleted_idx on public.families (created_at desc) where deleted_at is null;
create index if not exists subscriptions_not_deleted_idx on public.subscriptions (created_at desc) where deleted_at is null;
