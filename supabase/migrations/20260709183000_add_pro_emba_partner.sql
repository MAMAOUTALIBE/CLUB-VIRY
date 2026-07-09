insert into public.partners (
  name,
  slug,
  logo_url,
  website_url,
  tier,
  description,
  order_index,
  is_active
)
values (
  'Pro Emba',
  'pro-emba',
  '/images/partners/pro-emba.svg',
  null,
  'Partenaire officiel',
  'Materiaux de construction',
  80,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  tier = excluded.tier,
  description = excluded.description,
  order_index = excluded.order_index,
  is_active = excluded.is_active,
  updated_at = now();
