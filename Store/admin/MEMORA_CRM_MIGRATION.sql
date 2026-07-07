-- ============================================================
-- Memora CRM Orders System Migration
-- Safely upgrades existing orders table to production CRM
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. Add missing customer information columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'english';

-- 2. Add wedding details columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS bride_name text,
  ADD COLUMN IF NOT EXISTS groom_name text,
  ADD COLUMN IF NOT EXISTS wedding_date date,
  ADD COLUMN IF NOT EXISTS venue text,
  ADD COLUMN IF NOT EXISTS color_preference text,
  ADD COLUMN IF NOT EXISTS music_link text,
  ADD COLUMN IF NOT EXISTS special_requests text;

-- 3. Add order details columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS product_category text,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'instapay';

-- 4. Update order_status constraint (fix legacy 'Paid' value)
-- First, migrate any existing 'Paid' values to 'Completed'
UPDATE public.orders 
  SET order_status = 'In Progress' 
  WHERE order_status = 'Paid' AND order_status IS NOT NULL;

-- Drop old constraint
ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS orders_order_status_check;

-- Add new constraint with correct values
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_order_status_check 
  CHECK (order_status IN ('Pending', 'In Progress', 'Completed', 'Cancelled'));

-- 5. Create useful indexes for CRM performance
CREATE INDEX IF NOT EXISTS idx_orders_email 
  ON public.orders(email);

CREATE INDEX IF NOT EXISTS idx_orders_phone 
  ON public.orders(phone_number);

CREATE INDEX IF NOT EXISTS idx_orders_wedding_date 
  ON public.orders(wedding_date);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
  ON public.orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_order_status 
  ON public.orders(order_status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_product_category 
  ON public.orders(product_category);

-- 6. Update RLS policies for checkout page (public inserts)
DROP POLICY IF EXISTS "Allow public order inserts" ON public.orders;
CREATE POLICY "Allow public order inserts" ON public.orders
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users (admins) to do everything
DROP POLICY IF EXISTS "Authenticated admins can manage orders" ON public.orders;
CREATE POLICY "Authenticated admins can manage orders" ON public.orders 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public to read their own order (optional, for future order tracking)
DROP POLICY IF EXISTS "Public can read own orders" ON public.orders;
CREATE POLICY "Public can read own orders" ON public.orders
  FOR SELECT TO anon USING (email = current_setting('request.jwt.claims', true)::jsonb->>'email');

-- 7. Add comment documenting the table structure
COMMENT ON TABLE public.orders IS 
  'Complete wedding order CRM. Collects customer, wedding, and payment details. 
   Payment flow: Order inserted with payment_status=Pending, admin confirms via InstaPay -> marks as Paid.';

-- Log migration completion
-- SELECT 'Memora CRM Migration Completed Successfully' AS status;
