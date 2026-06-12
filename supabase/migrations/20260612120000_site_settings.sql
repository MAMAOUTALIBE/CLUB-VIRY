-- Table de contenu éditable « CMS » : paramètres du club et blocs de contenu
-- (réseaux sociaux, coordonnées, mot du président, bannière inscriptions, chiffres,
-- valeurs, etc.). Stockage clé -> JSON pour rester flexible sans multiplier les tables.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Lecture publique (le site lit ces réglages pour s'afficher).
drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
  on public.site_settings for select
  using (true);

-- Écriture réservée aux rôles d'administration.
drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write"
  on public.site_settings for all
  using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
  with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

-- Valeurs initiales (alignées sur le contenu actuel du site).
insert into public.site_settings (key, value) values
  ('socials', '{"facebook":"","instagram":"","youtube":"","tiktok":"","whatsapp":""}'::jsonb),
  ('contact', '{"phone1":"06 29 67 04 33","phone2":"01 69 96 67 00","email":"esvirychatillon91170@gmail.com","address":"Stade Henri Longuet, 91170 Viry-Châtillon"}'::jsonb),
  ('president', '{"name":"Saglam Ferhat","message":"","photoUrl":""}'::jsonb),
  ('inscriptions_banner', '{"text":"Inscriptions des licenciés : du 09 juin jusqu''à la fin du mois de juin — rejoignez l''ES Viry-Châtillon !","active":true}'::jsonb)
on conflict (key) do nothing;
