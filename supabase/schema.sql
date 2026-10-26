-- Sales Insights : schéma de base de données Supabase
-- À coller dans Supabase > SQL Editor > New query, puis "Run".

-- Un "dataset" = un fichier CSV importé et nettoyé par un utilisateur
create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  row_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Les ventes nettoyées, rattachées à un dataset
create table if not exists public.sales (
  id bigint generated always as identity primary key,
  dataset_id uuid not null references public.datasets (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sale_date date not null,
  product text not null,
  category text not null,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  city text not null
);

create index if not exists sales_dataset_id_idx on public.sales (dataset_id);
create index if not exists datasets_user_id_idx on public.datasets (user_id);

-- Sécurité : chaque utilisateur ne voit et ne modifie que ses propres données
alter table public.datasets enable row level security;
alter table public.sales enable row level security;

drop policy if exists "datasets_owner_all" on public.datasets;
create policy "datasets_owner_all" on public.datasets
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sales_owner_all" on public.sales;
create policy "sales_owner_all" on public.sales
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
