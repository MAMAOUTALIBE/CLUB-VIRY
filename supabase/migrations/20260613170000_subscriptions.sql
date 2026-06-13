-- Abonnements (Phase 4 refonte CRM) : a la souscription (inscription validee, partenariat accepte),
-- un profil recoit un abonnement qui formalise ses droits et l'acces aux contenus.
-- Les preferences de notification (notification_preferences) restent gerees a part (defaut opt-in).

do $$
begin
  create type public.subscription_type as enum ('JOUEUR', 'FAMILLE', 'PARTENAIRE');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_status as enum ('ACTIVE', 'SUSPENDED', 'CANCELLED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  type        public.subscription_type not null,
  status      public.subscription_status not null default 'ACTIVE',
  source      text,
  granted_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (profile_id, type)
);

create index if not exists subscriptions_profile_idx on public.subscriptions (profile_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
