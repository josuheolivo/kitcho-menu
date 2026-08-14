-- =============================================
-- SQL para Supabase — Kitcho Menu Platform
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================

-- Tabla de restaurantes (1 por usuario dueño)
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text default null,
  slug text not null unique,
  logo_url text default null,
  trial_starts_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '15 days'),
  plan text not null default 'trial' check (plan in ('trial', 'free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla de menús (1 por restaurante)
create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_restaurants_owner on restaurants(owner_id);
create unique index if not exists idx_restaurants_owner_unique on restaurants(owner_id);
create index if not exists idx_restaurants_slug on restaurants(slug);
create index if not exists idx_menus_restaurant on menus(restaurant_id);

-- Función para generar slug único
create or replace function generate_restaurant_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 1;
begin
  -- Si ya tiene nombre, usarlo; sino usar parte del id
  if new.name is not null and new.name != '' then
    base_slug := lower(regexp_replace(new.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
  else
    base_slug := 'restaurant-' || substr(new.id::text, 1, 8);
  end if;
  
  final_slug := base_slug;
  
  -- Asegurar unicidad
  while exists (select 1 from restaurants where slug = final_slug and id != new.id) loop
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  end loop;
  
  new.slug := final_slug;
  return new;
end;
$$ language plpgsql;

-- Trigger para auto-generar slug
drop trigger if exists trg_generate_slug on restaurants;
create trigger trg_generate_slug
  before insert on restaurants
  for each row
  execute function generate_restaurant_slug();

-- RLS (Row Level Security)
alter table restaurants enable row level security;
alter table menus enable row level security;

-- Políticas de restaurantes
create policy "Users can view own restaurant"
  on restaurants for select
  using (auth.uid() = owner_id);

create policy "Users can insert own restaurant"
  on restaurants for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own restaurant"
  on restaurants for update
  using (auth.uid() = owner_id);

-- Políticas de menús
create policy "Users can view own menu"
  on menus for select
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

create policy "Users can insert own menu"
  on menus for insert
  with check (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

create policy "Users can update own menu"
  on menus for update
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Acceso público a menús para lectura (vista pública)
create policy "Public can view menus"
  on menus for select
  using (true);

create policy "Public can view restaurants"
  on restaurants for select
  using (true);

-- =============================================
-- FIN
-- =============================================
