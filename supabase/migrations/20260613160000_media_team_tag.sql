-- Médiathèque : rattachement d'un média à une équipe (tag principal pour le ciblage & la réutilisation).
-- Un média taggé « équipe X » pourra : apparaître sur la page de l'équipe, être filtré, et déclencher
-- une notification automatique aux familles concernées (CRM intelligent).
alter table public.media_assets
  add column if not exists team_id uuid references public.teams(id) on delete set null;

create index if not exists media_assets_team_idx on public.media_assets (team_id);
