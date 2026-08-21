-- Campagnes de communication : écrire un message depuis le CRM et l'adresser à un
-- public choisi (tout le club, un rôle, une équipe, une catégorie).
--
-- Jusqu'ici le club ne pouvait notifier que par effet de bord (une convocation, une
-- séance, une actualité) : aucun moyen d'annoncer une assemblée générale ou un
-- report de tournoi. La campagne réutilise la file de notifications existante — un
-- envoi produit une notification par destinataire, in-app toujours, email selon les
-- préférences de chacun.

-- Nouvelle catégorie de préférence : la vie du club se règle séparément des
-- actualités, sinon se désabonner du fil d'actu ferait rater une convocation à l'AG.
alter type public.notification_category add value if not exists 'club';

create table if not exists public.communication_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  audience_type text not null,
  audience_id text,
  link text,
  status text not null default 'DRAFT',
  recipient_count integer not null default 0,
  email_count integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_campaigns_audience_type_valid
    check (audience_type in ('ALL_MEMBERS', 'ROLE', 'TEAM', 'CATEGORY')),
  constraint communication_campaigns_status_valid
    check (status in ('DRAFT', 'SENT')),
  -- Un public ciblé exige sa cible ; « tout le club » n'en prend aucune.
  constraint communication_campaigns_audience_id_required
    check ((audience_type = 'ALL_MEMBERS' and audience_id is null) or (audience_type <> 'ALL_MEMBERS' and audience_id is not null))
);

create index if not exists communication_campaigns_not_deleted_idx
  on public.communication_campaigns (created_at desc) where deleted_at is null;

alter table public.communication_campaigns enable row level security;

-- Aucune lecture publique : une campagne peut viser un groupe restreint et son
-- contenu n'a pas vocation à sortir du CRM. L'application passe, elle, par la clé
-- service_role et applique la permission communication:manage.
drop policy if exists "communication_campaigns_admin_all" on public.communication_campaigns;
create policy "communication_campaigns_admin_all"
on public.communication_campaigns
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
