-- ============================================================
-- Memora Orders CRM migration
-- Run this in the Supabase SQL editor (safe to run multiple times).
-- Adds the full customer / wedding / purchase fields to orders,
-- updates the order_status options, and allows public checkout inserts.
-- ============================================================

-- 1. New CRM columns
alter table public.orders
  add column if not exists preferred_language text,
  add column if not exists bride_name text,
  add column if not exists groom_name text,
  add column if not exists wedding_date date,
  add column if not exists venue text,
  add column if not exists color_preference text,
  add column if not exists music_link text,
  add column if not exists special_requests text,
  add column if not exists product_category text;

-- 2. order_status: replace legacy "Paid" option with "In Progress"
update public.orders set order_status = 'In Progress' where order_status = 'Paid';

alter table public.orders drop constraint if exists orders_order_status_check;
alter table public.orders add constraint orders_order_status_check
  check (order_status in ('Pending', 'In Progress', 'Completed', 'Cancelled'));

-- 3. The public checkout page (anon key) must be able to create orders
drop policy if exists "Allow public order inserts" on public.orders;
create policy "Allow public order inserts" on public.orders
  for insert to anon with check (true);
