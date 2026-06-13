-- Abonnement & notifications de l'espace Parent / Famille (CDC espace-famille).
-- L0 : préférences opt-in (par catégorie × canal), abonnements Web Push, et extension
-- de la file `notification_logs` existante (catégorie, lien profond, statut "lu" du feed).

do $$
begin
  create type public.notification_category as enum ('convocation', 'session', 'media', 'news', 'event');
exception
  when duplicate_object then null;
end $$;

-- Préférences opt-in : une ligne par (profil, catégorie). L'in-app est toujours actif (non stocké).
create table if not exists public.notification_preferences (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category   public.notification_category not null,
  email      boolean not null default true,
  push       boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (profile_id, category)
);

-- Abonnements Web Push (multi-appareils) — utilisés au lot L3.
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists push_subscriptions_profile_idx on public.push_subscriptions (profile_id);

-- Extension de la file existante : catégorie, lien profond, statut "lu" (feed in-app).
alter table public.notification_logs
  add column if not exists category public.notification_category,
  add column if not exists link     text,
  add column if not exists read_at  timestamptz;

-- Index du feed in-app : notifications d'un destinataire, plus récentes d'abord.
create index if not exists notification_logs_recipient_inapp_idx
  on public.notification_logs (recipient_profile_id, created_at desc)
  where channel = 'in_app';
