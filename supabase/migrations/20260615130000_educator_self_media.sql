-- Auto-gestion éducateur : photo de profil téléversée.
-- Supabase étant interne (non exposé), les photos sont servies via un proxy
-- applicatif (/api/media/educator/[id]) ; on stocke donc le chemin de l'objet.

alter table public.profiles add column if not exists avatar_path text;

-- Bucket privé pour les photos d'éducateurs (servies via le proxy authentifié-public).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('educator-photos', 'educator-photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
