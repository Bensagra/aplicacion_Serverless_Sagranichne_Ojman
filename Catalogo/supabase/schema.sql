-- ============================================================
-- Catálogo · esquema de base de datos (Supabase / Postgres)
-- ============================================================
-- Pegar este script en Supabase Studio → SQL Editor → Run
-- Crea las tablas `profiles` y `foods` con Row Level Security
-- activo para que cada usuario solo vea y edite sus propios datos.
-- ============================================================

-- Extensión necesaria para gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- Tabla: profiles  (1 fila por usuario, id = auth.users.id)
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------------
-- Tabla: foods  (entidades del catálogo, asociadas a cada usuario)
-- ----------------------------------------------------------------
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  notes text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists foods_user_id_idx on public.foods(user_id);

alter table public.foods enable row level security;

drop policy if exists "foods_select_own" on public.foods;
create policy "foods_select_own"
  on public.foods for select
  using (auth.uid() = user_id);

drop policy if exists "foods_insert_own" on public.foods;
create policy "foods_insert_own"
  on public.foods for insert
  with check (auth.uid() = user_id);

drop policy if exists "foods_update_own" on public.foods;
create policy "foods_update_own"
  on public.foods for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "foods_delete_own" on public.foods;
create policy "foods_delete_own"
  on public.foods for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Trigger: crear automáticamente un row en profiles al registrarse
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
