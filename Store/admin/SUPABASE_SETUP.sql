-- Memora Admin Dashboard Supabase setup
-- Run this in the Supabase SQL editor, then create an auth user from Authentication > Users.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null default 0,
  category text,
  live_demo_url text,
  buy_url text,
  thumbnail_url text,
  gallery_urls text[] default '{}',
  featured boolean default false,
  in_stock boolean default true,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  bundle_name text not null,
  description text,
  included_products text[] default '{}',
  bundle_price numeric not null default 0,
  thumbnail_url text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  whatsapp_number text,
  email text,
  purchased_product text,
  purchased_bundle text,
  order_date timestamptz default now(),
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Paid')),
  order_status text default 'Pending' check (order_status in ('Pending', 'Paid', 'Completed', 'Cancelled')),
  total_amount numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  coupon_code text not null unique,
  discount_percent numeric not null default 0,
  expiration_date date,
  maximum_uses integer default 0,
  current_uses integer default 0,
  status text default 'Active' check (status in ('Active', 'Paused', 'Expired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.settings (
  id integer primary key default 1,
  store_name text default 'Memora',
  logo_url text,
  hero_banner_url text,
  whatsapp_number text default '+201099885633',
  business_email text,
  instagram text,
  facebook text,
  tiktok text,
  footer_text text,
  seo_title text,
  seo_description text,
  visitors integer default 0,
  updated_at timestamptz default now(),
  constraint single_settings_row check (id = 1)
);

insert into public.products (title, description, price, category, live_demo_url, buy_url, thumbnail_url, featured, in_stock)
values
  ('Modern Minimal', 'Clean modern wedding invitation template.', 500, 'Standard', 'https://modern-minimal-delta.vercel.app/', 'https://wa.me/201099885633', '../images/demo_modern_minimal.png', true, true),
  ('Luxury Bloom', 'Premium invitation with elegant bloom styling.', 800, 'Premium', 'https://luxury-bloom-demo.vercel.app/', 'https://wa.me/201099885633', '../images/demo_luxury_bloom.png', true, true),
  ('Authentic', 'Timeless premium invitation design.', 800, 'Premium', 'https://authentic-demo-chi.vercel.app/', 'https://wa.me/201099885633', '../images/demo_royal_gold.png', true, true)
on conflict do nothing;

insert into public.bundles (bundle_name, description, included_products, bundle_price, thumbnail_url, featured)
values
  ('Memora Essential', 'Modern Minimal plus Love Card.', array['Modern Minimal', 'Love Card'], 950, '../images/demo_modern_minimal.png', true),
  ('Memora Signature', 'Luxury Bloom plus Love Card.', array['Luxury Bloom', 'Love Card'], 1250, '../images/demo_luxury_bloom.png', true)
on conflict do nothing;

insert into public.settings (id, store_name, whatsapp_number, business_email, footer_text, seo_title, seo_description)
values (1, 'Memora', '+201099885633', 'support@memora.com', 'Premium wedding invitation websites and digital love cards.', 'Memora - Digital Wedding Invitation Templates', 'Modern, premium, digital wedding invitation templates.')
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.bundles enable row level security;
alter table public.orders enable row level security;
alter table public.coupons enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Authenticated admins can manage products" on public.products;
drop policy if exists "Authenticated admins can manage bundles" on public.bundles;
drop policy if exists "Authenticated admins can manage orders" on public.orders;
drop policy if exists "Authenticated admins can manage coupons" on public.coupons;
drop policy if exists "Authenticated admins can manage settings" on public.settings;

create policy "Authenticated admins can manage products" on public.products for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage bundles" on public.bundles for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage orders" on public.orders for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage coupons" on public.coupons for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage settings" on public.settings for all to authenticated using (true) with check (true);

-- Create a public bucket named memora-assets in Storage, then add these policies:
insert into storage.buckets (id, name, public)
values ('memora-assets', 'memora-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated admins can upload assets" on storage.objects;
drop policy if exists "Authenticated admins can update assets" on storage.objects;
drop policy if exists "Public can read memora assets" on storage.objects;

create policy "Authenticated admins can upload assets" on storage.objects
for insert to authenticated
with check (bucket_id = 'memora-assets');

create policy "Authenticated admins can update assets" on storage.objects
for update to authenticated
using (bucket_id = 'memora-assets')
with check (bucket_id = 'memora-assets');

create policy "Public can read memora assets" on storage.objects
for select to anon, authenticated
using (bucket_id = 'memora-assets');
