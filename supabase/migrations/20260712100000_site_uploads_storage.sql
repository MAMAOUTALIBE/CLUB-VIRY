-- Bucket de stockage public générique pour les images téléversées depuis le CRM
-- (couvertures d'actualités, images produits, médias, photos de dirigeants…).
-- L'URL publique est stockée dans la colonne image/URL du contenu concerné et rendue via <img>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-uploads',
  'site-uploads',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
