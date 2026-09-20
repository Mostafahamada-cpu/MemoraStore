-- ============================================================
-- Memora → Money Tracker sync tracking
-- Run this in the Supabase SQL editor (safe to run multiple times).
-- Adds two columns to orders so the admin dashboard can show whether
-- a Paid order has been pushed to Money Tracker, and offer a retry.
-- ============================================================

alter table public.orders
  add column if not exists moneytracker_sync_status text default null,
  add column if not exists moneytracker_transaction_id text default null;

alter table public.orders drop constraint if exists orders_moneytracker_sync_status_check;
alter table public.orders add constraint orders_moneytracker_sync_status_check
  check (moneytracker_sync_status is null or moneytracker_sync_status in ('synced', 'failed'));

comment on column public.orders.moneytracker_sync_status
  is 'NULL = never synced, synced = income exists in Money Tracker, failed = last push failed (retry from the dashboard)';
comment on column public.orders.moneytracker_transaction_id
  is 'Money Tracker Transaction.id created for this order, once synced';
