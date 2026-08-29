-- Rend le stock d'une commande annulée/remboursée et le réserve à nouveau
-- si un administrateur réouvre ensuite cette commande.
create or replace function public.sync_shop_order_stock_on_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item record;
  v_stock integer;
begin
  if old.status not in ('CANCELLED', 'REFUNDED') and new.status in ('CANCELLED', 'REFUNDED') then
    update public.product_variants variant
    set stock_quantity = variant.stock_quantity + ordered.quantity
    from (
      select variant_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id and variant_id is not null
      group by variant_id
    ) ordered
    where variant.id = ordered.variant_id;
  elsif old.status in ('CANCELLED', 'REFUNDED') and new.status not in ('CANCELLED', 'REFUNDED') then
    for v_item in
      select variant_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id and variant_id is not null
      group by variant_id
    loop
      select stock_quantity into v_stock
      from public.product_variants
      where id = v_item.variant_id and is_active = true
      for update;

      if not found or v_stock < v_item.quantity then
        raise exception 'SHOP_INSUFFICIENT_STOCK';
      end if;

      update public.product_variants
      set stock_quantity = stock_quantity - v_item.quantity
      where id = v_item.variant_id;
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_sync_shop_stock on public.orders;
create trigger orders_sync_shop_stock
before update of status on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.sync_shop_order_stock_on_status();
