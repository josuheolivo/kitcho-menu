-- =============================================================
-- Reparación: un restaurante por usuario
-- Ejecuta este archivo COMPLETO una vez en Supabase Dashboard > SQL Editor.
-- No utiliza tablas temporales, por lo que funciona con el SQL Editor.
-- =============================================================

begin;

do $$
declare
  duplicate_owner_id uuid;
  kept_restaurant_id uuid;
  duplicate_restaurant_id uuid;
begin
  if to_regclass('public.restaurants') is null or to_regclass('public.menus') is null then
    raise exception 'No existen las tablas restaurants y menus. Ejecuta primero supabase.sql.';
  end if;

  -- Repite la consolidación mientras exista algún propietario duplicado.
  loop
    select owner_id
      into duplicate_owner_id
    from public.restaurants
    group by owner_id
    having count(*) > 1
    limit 1;

    exit when duplicate_owner_id is null;

    -- Conserva primero el restaurante con menú con contenido y más reciente.
    select restaurant.id
      into kept_restaurant_id
    from public.restaurants as restaurant
    left join public.menus as menu on menu.restaurant_id = restaurant.id
    where restaurant.owner_id = duplicate_owner_id
    order by
      case when menu.data is not null and menu.data <> '{}'::jsonb then 0 else 1 end,
      coalesce(menu.updated_at, restaurant.updated_at, restaurant.created_at) desc,
      restaurant.id
    limit 1;

    for duplicate_restaurant_id in
      select id
      from public.restaurants
      where owner_id = duplicate_owner_id
        and id <> kept_restaurant_id
    loop
      -- Si ambos tienen menú, se conserva el del restaurante elegido.
      delete from public.menus as duplicate_menu
      where duplicate_menu.restaurant_id = duplicate_restaurant_id
        and exists (
          select 1
          from public.menus as kept_menu
          where kept_menu.restaurant_id = kept_restaurant_id
        );

      -- Si el restaurante elegido no tenía menú, traslada el disponible.
      update public.menus
      set restaurant_id = kept_restaurant_id
      where restaurant_id = duplicate_restaurant_id;

      delete from public.restaurants
      where id = duplicate_restaurant_id;
    end loop;
  end loop;
end;
$$;

create unique index if not exists idx_restaurants_owner_unique
  on public.restaurants(owner_id);

commit;

-- Verificación: debe devolver cero filas.
select owner_id, count(*) as restaurants
from public.restaurants
group by owner_id
having count(*) > 1;
