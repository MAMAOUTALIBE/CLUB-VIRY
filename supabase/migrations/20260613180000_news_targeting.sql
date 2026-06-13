-- Diffusion d'articles ciblés (CRM intelligent) : une actualité peut viser une équipe.
-- À la publication, les familles de l'équipe sont notifiées une seule fois (notified_at).
alter table public.news
  add column if not exists team_id     uuid references public.teams(id) on delete set null,
  add column if not exists notified_at timestamptz;

create index if not exists news_team_idx on public.news (team_id);
