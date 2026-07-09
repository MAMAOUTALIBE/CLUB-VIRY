insert into public.partners (name, slug, logo_url, website_url, tier, description, order_index, is_active)
values
  ('Essonne Département', 'essonne-departement', '/images/partners/essonne.svg', null, 'Institutionnel', null, 10, true),
  ('Ville de Viry-Châtillon', 'ville-de-viry-chatillon', '/images/partners/viry-chatillon.svg', null, 'Institutionnel', null, 20, true),
  ('Intersport', 'intersport-viry', '/images/partners/intersport.svg', 'https://www.intersport.fr', 'Partenaire officiel', null, 30, true),
  ('E.Leclerc', 'leclerc', '/images/partners/leclerc.svg', null, 'Partenaire officiel', null, 40, true),
  ('Engie', 'engie', '/images/partners/engie.svg', null, 'Partenaire officiel', null, 50, true),
  ('Crédit Mutuel', 'credit-mutuel', '/images/partners/credit-mutuel.svg', null, 'Partenaire officiel', null, 60, true),
  ('Nike', 'nike', '/images/partners/nike.svg', null, 'Equipementier', null, 70, true),
  ('Adidas', 'adidas', '/images/partners/adidas.svg', null, 'Equipementier', null, 80, true),
  ('Pro Emba', 'pro-emba', '/images/partners/pro-emba.svg', null, 'Partenaire officiel', 'Materiaux de construction', 90, true),
  ('MS SOL', 'ms-sol', '/images/partners/ms-sol.svg', null, 'Partenaire officiel', 'Travaux et solutions de sol', 100, true)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website_url = coalesce(excluded.website_url, public.partners.website_url),
  tier = excluded.tier,
  description = excluded.description,
  order_index = excluded.order_index,
  is_active = excluded.is_active,
  updated_at = now();
