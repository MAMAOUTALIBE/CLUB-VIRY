-- Archivage réversible et attribution des dossiers : inscriptions et candidatures
-- de détection.
--
-- Ces deux tables reçoivent des saisies venues du public : doublons, tests, spam,
-- dossiers ouverts par erreur. Les supprimer définitivement casserait l'historique
-- (documents, paiements) ; on archive donc, et la purge reste bloquée tant qu'une
-- dépendance existe (voir PURGE_DEPENDENCIES dans src/lib/db/soft-delete.ts).
--
-- `assigned_to` répond à l'autre besoin : savoir qui, au club, prend un dossier en
-- charge. La référence est posée en ON DELETE SET NULL — le départ d'un dirigeant
-- ne doit jamais faire disparaître un dossier de famille.

alter table public.registrations add column if not exists deleted_at timestamptz;
alter table public.registrations add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
alter table public.registrations add column if not exists assigned_to uuid references public.profiles(id) on delete set null;
alter table public.registrations add column if not exists assigned_at timestamptz;

alter table public.recruitment_applications add column if not exists deleted_at timestamptz;
alter table public.recruitment_applications add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
alter table public.recruitment_applications add column if not exists assigned_to uuid references public.profiles(id) on delete set null;
alter table public.recruitment_applications add column if not exists assigned_at timestamptz;

create index if not exists registrations_not_deleted_idx on public.registrations (created_at desc) where deleted_at is null;
create index if not exists registrations_assigned_idx on public.registrations (assigned_to) where deleted_at is null and assigned_to is not null;
create index if not exists recruitment_not_deleted_idx on public.recruitment_applications (created_at desc) where deleted_at is null;
create index if not exists recruitment_assigned_idx on public.recruitment_applications (assigned_to) where deleted_at is null and assigned_to is not null;
