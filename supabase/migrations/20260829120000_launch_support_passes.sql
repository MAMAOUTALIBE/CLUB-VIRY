-- Lance les deux offres commerciales comme données CRM éditables.
-- Les clauses DO NOTHING préservent toute modification faite ensuite par un administrateur.
insert into public.product_categories (name, slug, order_index, is_active)
values ('Pass club', 'pass-club', 0, true)
on conflict (slug) do nothing;

insert into public.products (
  category_id,
  name,
  slug,
  description,
  image_url,
  status,
  price_cents,
  currency,
  order_index
)
select
  category.id,
  offer.name,
  offer.slug,
  offer.description,
  '/club-logo.svg',
  'ACTIVE'::public.product_status,
  offer.price_cents,
  'EUR',
  offer.order_index
from public.product_categories category
cross join (
  values
    ('Pass Famille+', 'pass-famille-plus', 'Pass de soutien destiné aux familles du club pour la saison 2026 / 2027.', 5900, 0),
    ('Pass Supporter', 'pass-supporter', 'Pass de soutien destiné aux supporters du club pour la saison 2026 / 2027.', 2900, 1)
) as offer(name, slug, description, price_cents, order_index)
where category.slug = 'pass-club'
on conflict (slug) do nothing;

insert into public.product_variants (product_id, label, sku, stock_quantity, price_delta_cents, is_active)
select
  product.id,
  'Saison 2026 / 2027',
  stock.sku,
  stock.quantity,
  0,
  true
from public.products product
join (
  values
    ('pass-famille-plus', 'PASS-FAMILLE-2026-2027', 100),
    ('pass-supporter', 'PASS-SUPPORTER-2026-2027', 150)
) as stock(slug, sku, quantity) on stock.slug = product.slug
where not exists (
  select 1
  from public.product_variants existing
  where existing.sku = stock.sku
);

-- Crée une commande et réserve son stock dans une transaction PostgreSQL unique.
create or replace function public.create_shop_order_atomic(
  p_profile_id uuid,
  p_email text,
  p_customer_name text,
  p_phone text,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;
  v_unit_price integer;
  v_total integer := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then
    raise exception 'SHOP_INVALID_ITEMS';
  end if;

  insert into public.orders (profile_id, email, customer_name, phone, notes, total_cents, currency, status)
  values (p_profile_id, p_email, p_customer_name, p_phone, p_notes, 0, 'EUR', 'PENDING')
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'productId')::uuid;
    v_variant_id := nullif(v_item ->> 'variantId', '')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity < 1 or v_quantity > 20 then
      raise exception 'SHOP_INVALID_QUANTITY';
    end if;

    select * into v_product
    from public.products
    where id = v_product_id and status = 'ACTIVE' and deleted_at is null
    for share;

    if not found then
      raise exception 'SHOP_PRODUCT_UNAVAILABLE';
    end if;

    if v_variant_id is not null then
      select * into v_variant
      from public.product_variants
      where id = v_variant_id and product_id = v_product_id and is_active = true
      for update;

      if not found then
        raise exception 'SHOP_VARIANT_UNAVAILABLE';
      end if;

      if v_variant.stock_quantity < v_quantity then
        raise exception 'SHOP_INSUFFICIENT_STOCK';
      end if;

      update public.product_variants
      set stock_quantity = stock_quantity - v_quantity
      where id = v_variant.id;

      v_unit_price := v_product.price_cents + v_variant.price_delta_cents;
    else
      if exists (
        select 1 from public.product_variants
        where product_id = v_product_id and is_active = true
      ) then
        raise exception 'SHOP_VARIANT_REQUIRED';
      end if;

      v_unit_price := v_product.price_cents;
    end if;

    if v_unit_price < 1 then
      raise exception 'SHOP_INVALID_PRICE';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      label,
      quantity,
      unit_price_cents,
      total_cents
    )
    values (
      v_order_id,
      v_product.id,
      v_variant_id,
      case when v_variant_id is null then v_product.name else v_product.name || ' - ' || v_variant.label end,
      v_quantity,
      v_unit_price,
      v_unit_price * v_quantity
    );

    v_total := v_total + (v_unit_price * v_quantity);
  end loop;

  update public.orders set total_cents = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

revoke all on function public.create_shop_order_atomic(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.create_shop_order_atomic(uuid, text, text, text, text, jsonb) to service_role;
