-- Suppression réversible (corbeille) pour les contenus éditoriaux sensibles.
-- Une ligne « supprimée » depuis le CRM porte `deleted_at` non nul : elle disparaît
-- du site public et des listes admin, mais reste restaurable depuis la corbeille.
-- (Les équipes / matchs / médias conservent leur logique d'archivage is_active/status.)

alter table public.news add column if not exists deleted_at timestamptz;
alter table public.partners add column if not exists deleted_at timestamptz;
alter table public.products add column if not exists deleted_at timestamptz;
alter table public.club_officials add column if not exists deleted_at timestamptz;

-- Index partiels : accélèrent les lectures courantes « non supprimé » sans peser sur la corbeille.
create index if not exists news_not_deleted_idx on public.news (created_at desc) where deleted_at is null;
create index if not exists partners_not_deleted_idx on public.partners (order_index) where deleted_at is null;
create index if not exists products_not_deleted_idx on public.products (order_index) where deleted_at is null;
create index if not exists club_officials_not_deleted_idx on public.club_officials (order_index) where deleted_at is null;
