-- =============================================================
-- Corrección del generador de slug
-- Ejecuta este archivo en Supabase Dashboard > SQL Editor.
-- Repara: function substr(uuid, integer, integer) does not exist
-- =============================================================

create or replace function public.generate_restaurant_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 1;
begin
  -- Si es un UPDATE y ya tiene un slug personalizado (no es el slug por defecto 'restaurant-xxxx'), lo preservamos.
  if TG_OP = 'UPDATE' and old.slug is not null and old.slug not like 'restaurant-%' then
    new.slug := old.slug;
    return new;
  end if;

  if new.name is not null and trim(new.name) <> '' then
    -- Convertir a minúsculas y reemplazar tildes y eñes
    base_slug := lower(new.name);
    base_slug := translate(base_slug, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN');
    base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
  else
    -- Los UUID deben convertirse a texto antes de usar substr.
    base_slug := 'restaurant-' || substr(new.id::text, 1, 8);
  end if;

  final_slug := base_slug;

  while exists (
    select 1
    from public.restaurants
    where slug = final_slug
      and id <> new.id
  ) loop
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_generate_slug on public.restaurants;

create trigger trg_generate_slug
  before insert or update of name on public.restaurants
  for each row
  execute function public.generate_restaurant_slug();
