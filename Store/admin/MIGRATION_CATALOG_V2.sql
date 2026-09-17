-- ============================================================
-- Memora Catalog v2 migration
-- Run this in the Supabase SQL editor AFTER SUPABASE_SETUP.sql
-- and MEMORA_CRM_MIGRATION.sql. Safe to run multiple times.
--
-- Adds:
--   * categories  (Wedding / More Moments / Bundles / Custom)
--   * addons      (Location, Countdown, Music, ... Custom Animation)
--   * bilingual + catalog columns on products and bundles
--   * custom-order + add-on columns on orders (no separate order system)
--   * public read access for the storefront (active rows only)
--   * SECURITY FIX: removes the anon SELECT policy on orders
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. Categories
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_ar text,
  description text,
  description_ar text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. Add-ons
-- ------------------------------------------------------------
create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_ar text,
  description text,
  description_ar text,
  price numeric not null default 0,
  pricing_type text not null default 'fixed',
  icon text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint addons_pricing_type_check check (pricing_type in ('free', 'fixed', 'from'))
);

-- ------------------------------------------------------------
-- 3. Products: catalog + bilingual columns
-- ------------------------------------------------------------
alter table public.products
  add column if not exists slug text,
  add column if not exists name_ar text,
  add column if not exists description_ar text,
  add column if not exists product_type text default 'product',
  add column if not exists category_slug text,
  add column if not exists tier text,
  add column if not exists event_type text,
  add column if not exists pricing_type text default 'fixed',
  add column if not exists features text[] default '{}',
  add column if not exists features_ar text[] default '{}',
  add column if not exists designs jsonb default '[]'::jsonb,
  add column if not exists included_addons text[] default '{}',
  add column if not exists icon text,
  add column if not exists badge text,
  add column if not exists sort_order integer default 0,
  add column if not exists is_active boolean default true;

create unique index if not exists products_slug_key on public.products (slug);

alter table public.products drop constraint if exists products_product_type_check;
alter table public.products add constraint products_product_type_check
  check (product_type in ('product', 'custom'));

alter table public.products drop constraint if exists products_pricing_type_check;
alter table public.products add constraint products_pricing_type_check
  check (pricing_type in ('fixed', 'from'));

-- Legacy rows (from SUPABASE_SETUP.sql) had no slug and used category = Standard/Premium.
-- Modern Minimal / Luxury Bloom / Authentic are now *designs* inside the Wedding products,
-- so legacy rows are deactivated instead of deleted (delete them from Admin when ready).
update public.products
   set is_active = false,
       tier = coalesce(tier, category),
       category_slug = coalesce(category_slug, 'wedding')
 where slug is null;

-- ------------------------------------------------------------
-- 4. Bundles: relationships by product id + bilingual columns
-- ------------------------------------------------------------
alter table public.bundles
  add column if not exists slug text,
  add column if not exists name_ar text,
  add column if not exists description_ar text,
  add column if not exists included_product_ids uuid[] default '{}',
  add column if not exists badge text,
  add column if not exists icon text,
  add column if not exists sort_order integer default 0,
  add column if not exists is_active boolean default true;

create unique index if not exists bundles_slug_key on public.bundles (slug);

-- Legacy Love Card bundles are not part of the new catalog: deactivate, keep for reference.
update public.bundles set is_active = false where slug is null;

-- ------------------------------------------------------------
-- 5. Orders: add-ons, event details, custom requests (same table)
-- ------------------------------------------------------------
alter table public.orders
  add column if not exists order_type text default 'standard',
  add column if not exists product_slug text,
  add column if not exists selected_design text,
  add column if not exists selected_addons text[] default '{}',
  add column if not exists base_price numeric,
  add column if not exists addons_total numeric default 0,
  add column if not exists event_type text,
  add column if not exists event_date date,
  add column if not exists event_names text,
  add column if not exists custom_details jsonb,
  add column if not exists quoted_price numeric,
  add column if not exists admin_notes text;

alter table public.orders drop constraint if exists orders_order_type_check;
alter table public.orders add constraint orders_order_type_check
  check (order_type in ('standard', 'custom'));

-- Custom requests are created without a price; total_amount stays 0 until quoted.
alter table public.orders alter column total_amount set default 0;

create index if not exists idx_orders_order_type on public.orders (order_type);
create index if not exists idx_orders_event_type on public.orders (event_type);

-- ------------------------------------------------------------
-- 6. Seed: categories
-- ------------------------------------------------------------
insert into public.categories (slug, name, name_ar, description, description_ar, sort_order)
values
  ('wedding',  'Wedding',      'حفل الزفاف',   'Our flagship invitation websites for your big day.',          'مواقع الدعوة الأساسية ليومكم الكبير.', 1),
  ('moments',  'Other Occasions', 'مناسبات أخرى', 'Digital invitations for every celebration along the way.',   'دعوات رقمية لكل مناسبة على طول الطريق.', 2),
  ('bundles',  'Bundles',      'الباقات',      'Combine invitations and save on the total.',                 'اجمعوا بين الدعوات ووفّروا في الإجمالي.', 3),
  ('custom',   'Custom',       'تصميم خاص',    'A fully customised invitation built around your vision.',   'دعوة مصممة بالكامل حول رؤيتكم.', 4)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 7. Seed: add-ons (official pricing)
-- ------------------------------------------------------------
insert into public.addons (slug, name, name_ar, description, description_ar, price, pricing_type, icon, sort_order)
values
  ('location',             'Location',             'الموقع',            'Venue details with a map link.',                                   'تفاصيل المكان مع رابط الخريطة.', 0,   'free',  '📍', 1),
  ('countdown',            'Countdown',            'العد التنازلي',     'Live countdown to your event.',                                    'عد تنازلي مباشر حتى موعد المناسبة.', 0,   'free',  '⏳', 2),
  ('music',                'Music',                'الموسيقى',          'Your chosen track playing on the invitation.',                     'المقطوعة التي تختارونها تعمل داخل الدعوة.', 100, 'fixed', '🎵', 3),
  ('background-animation', 'Background Animation', 'خلفية متحركة',      'Subtle animated background matching your theme.',                  'خلفية متحركة هادئة تناسب الثيم.', 100, 'fixed', '✨', 4),
  ('gallery',              'Gallery',              'معرض الصور',        'A photo gallery section for your favourite moments.',              'قسم لمعرض الصور لأجمل لحظاتكم.', 200, 'fixed', '📸', 5),
  ('our-story',            'Our Story',            'قصتنا',             'A dedicated section telling your story.',                          'قسم مخصص يروي قصتكم.', 200, 'fixed', '💌', 6),
  ('rsvp',                 'RSVP',                 'تأكيد الحضور',      'Guests confirm attendance online and you track replies.',          'يؤكد الضيوف حضورهم أونلاين وتتابعون الردود.', 400, 'fixed', '✅', 7),
  ('custom-animation',     'Custom Animation',     'أنيميشن مخصص',      'Bespoke animation made for you. Final price depends on complexity.','أنيميشن خاص بكم. السعر النهائي حسب التعقيد.', 150, 'from',  '🎬', 8)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 8. Seed: products (official pricing)
-- ------------------------------------------------------------
insert into public.products
  (slug, title, name_ar, description, description_ar, price, pricing_type, product_type, category_slug, tier, event_type,
   features, features_ar, designs, thumbnail_url, live_demo_url, icon, badge, featured, is_active, sort_order)
values
  ('wedding-standard', 'Wedding Standard', 'دعوة زفاف — ستاندرد',
   'A clean, elegant wedding invitation website with everything your guests need.',
   'موقع دعوة زفاف أنيق وبسيط يحتوي على كل ما يحتاجه ضيوفكم.',
   500, 'fixed', 'product', 'wedding', 'Standard', 'wedding',
   array['Modern Minimal design', 'Event details, location & countdown', 'Mobile-first responsive layout', 'Lifetime access'],
   array['تصميم Modern Minimal', 'تفاصيل المناسبة والموقع والعد التنازلي', 'تصميم متجاوب يعمل على كل الأجهزة', 'وصول مدى الحياة'],
   '[{"name":"Modern Minimal","demo_url":"https://modern-minimal-delta.vercel.app/","image_url":"images/demo_modern_minimal.png"}]'::jsonb,
   'images/demo_modern_minimal.png', 'https://modern-minimal-delta.vercel.app/', '💍', 'bestseller', true, true, 1),

  ('wedding-premium', 'Wedding Premium', 'دعوة زفاف — بريميوم',
   'Our most refined wedding experience with animated gold accents and a choice of premium designs.',
   'أرقى تجربة زفاف لدينا مع لمسات ذهبية متحركة واختيار بين تصاميم بريميوم.',
   800, 'fixed', 'product', 'wedding', 'Premium', 'wedding',
   array['Choice of Luxury Bloom or Authentic design', 'Animated gold accents & advanced animations', 'Event details, location & countdown', 'Priority support & lifetime updates'],
   array['اختيار بين تصميم Luxury Bloom أو Authentic', 'لمسات ذهبية متحركة وأنيميشن متقدم', 'تفاصيل المناسبة والموقع والعد التنازلي', 'دعم ذو أولوية وتحديثات مدى الحياة'],
   '[{"name":"Luxury Bloom","demo_url":"https://luxury-bloom-demo.vercel.app/","image_url":"images/demo_luxury_bloom.png"},{"name":"Authentic","demo_url":"https://authentic-demo-chi.vercel.app/","image_url":"images/demo_royal_gold.png"}]'::jsonb,
   'images/demo_luxury_bloom.png', 'https://luxury-bloom-demo.vercel.app/', '👑', 'premium', true, true, 2),

  ('engagement', 'Engagement Invitation', 'دعوة خطوبة',
   'Announce your engagement with a romantic digital invitation.',
   'أعلنوا خطوبتكم بدعوة رقمية رومانسية.',
   500, 'fixed', 'product', 'moments', null, 'engagement',
   array['Romantic engagement layout', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
   array['تصميم خطوبة رومانسي', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '💐', null, false, true, 1),

  ('henna', 'Henna Invitation', 'دعوة حنة',
   'A festive henna night invitation full of colour and tradition.',
   'دعوة ليلة حنة مبهجة مليئة بالألوان والتقاليد.',
   500, 'fixed', 'product', 'moments', null, 'henna',
   array['Festive henna-night styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
   array['ستايل ليلة حنة مبهج', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '🪷', null, false, true, 2),

  ('gender-reveal', 'Gender Reveal Invitation', 'دعوة الكشف عن نوع المولود',
   'Build the suspense with a playful gender reveal invitation.',
   'زيدوا التشويق بدعوة مرحة للكشف عن نوع المولود.',
   400, 'fixed', 'product', 'moments', null, 'gender-reveal',
   array['Playful pink & blue styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
   array['ستايل مرح باللونين الوردي والأزرق', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '🎀', null, false, true, 3),

  ('birthday', 'Birthday Invitation', 'دعوة عيد ميلاد',
   'A joyful birthday invitation for kids and grown-ups alike.',
   'دعوة عيد ميلاد مبهجة للأطفال والكبار.',
   350, 'fixed', 'product', 'moments', null, 'birthday',
   array['Joyful birthday styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
   array['ستايل عيد ميلاد مبهج', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '🎂', null, false, true, 4),

  ('date', 'Date Invitation', 'دعوة موعد رومانسي',
   'Invite your special someone to an unforgettable date.',
   'ادعوا شخصكم المميز إلى موعد لا يُنسى.',
   250, 'fixed', 'product', 'moments', null, 'date',
   array['Intimate one-page invitation', 'Date, time & location', 'Countdown to the moment', 'Lifetime access'],
   array['دعوة رومانسية من صفحة واحدة', 'التاريخ والوقت والمكان', 'عد تنازلي حتى اللحظة', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '🌹', null, false, true, 5),

  ('bachelorette', 'Bachelorette Invitation', 'دعوة سهرة العروسة',
   'Gather the girls with a fun bachelorette party invitation.',
   'اجمعي صديقاتك بدعوة مرحة لسهرة العروسة.',
   500, 'fixed', 'product', 'moments', null, 'bachelorette',
   array['Fun bachelorette styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
   array['ستايل مرح لسهرة العروسة', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '🥂', null, false, true, 6),

  ('bachelorette-game', 'Bachelorette + "Who''s Most Likely To" Online Game', 'دعوة سهرة العروسة + لعبة "مين الأكثر احتمالاً" أونلاين',
   'The bachelorette invitation plus an online "Who''s Most Likely To" game your guests play together.',
   'دعوة سهرة العروسة مع لعبة "مين الأكثر احتمالاً" أونلاين تلعبها الضيفات معاً.',
   800, 'fixed', 'product', 'moments', null, 'bachelorette',
   array['Everything in the Bachelorette Invitation', '"Who''s Most Likely To" online game', 'Play together from any phone', 'Lifetime access'],
   array['كل ما في دعوة سهرة العروسة', 'لعبة "مين الأكثر احتمالاً" أونلاين', 'العبوا معاً من أي هاتف', 'وصول مدى الحياة'],
   '[]'::jsonb, null, null, '🎉', 'new', true, true, 7),

  ('custom-invitation', 'Custom Invitation', 'دعوة مخصصة',
   'A completely customised invitation designed around your event, style and sections. Final price depends on complexity.',
   'دعوة مخصصة بالكامل حول مناسبتكم وأسلوبكم والأقسام التي تريدونها. السعر النهائي حسب التعقيد.',
   800, 'from', 'custom', 'custom', null, 'custom',
   array['Any event type', 'Your style, colours & sections', 'Custom animations available', 'Quoted after we review your request'],
   array['أي نوع مناسبة', 'أسلوبكم وألوانكم وأقسامكم', 'إمكانية إضافة أنيميشن مخصص', 'نحدد السعر بعد مراجعة طلبكم'],
   '[]'::jsonb, null, null, '✨', null, true, true, 1)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 9. Seed: bundles (relationships by product id)
-- ------------------------------------------------------------
insert into public.bundles (slug, bundle_name, name_ar, description, description_ar, bundle_price, included_product_ids, included_products, icon, badge, featured, is_active, sort_order)
select
  b.slug, b.bundle_name, b.name_ar, b.description, b.description_ar, b.bundle_price,
  array(select p.id from public.products p where p.slug = any(b.product_slugs) order by array_position(b.product_slugs, p.slug)),
  array(select p.title from public.products p where p.slug = any(b.product_slugs) order by array_position(b.product_slugs, p.slug)),
  b.icon, b.badge, b.featured, true, b.sort_order
from (values
  ('henna-wedding-standard', 'Henna + Wedding Standard', 'حنة + زفاف ستاندرد',
   'Henna night and Wedding Standard invitations together at a better combined price.',
   'دعوتا الحنة والزفاف ستاندرد معاً بسعر مجمّع أفضل.',
   900, array['henna', 'wedding-standard'], '🎁', null, true, 1),
  ('henna-wedding-premium', 'Henna + Wedding Premium', 'حنة + زفاف بريميوم',
   'Henna night and Wedding Premium invitations together at a better combined price.',
   'دعوتا الحنة والزفاف بريميوم معاً بسعر مجمّع أفضل.',
   1150, array['henna', 'wedding-premium'], '🎁', 'best-value', true, 2),
  ('henna-bachelorette', 'Henna + Bachelorette', 'حنة + سهرة العروسة',
   'Henna night and Bachelorette invitations together at a better combined price.',
   'دعوتا الحنة وسهرة العروسة معاً بسعر مجمّع أفضل.',
   900, array['henna', 'bachelorette'], '🎁', null, true, 3),
  ('henna-bachelorette-game', 'Henna + Bachelorette + Online Game', 'حنة + سهرة العروسة + اللعبة الأونلاين',
   'Henna night, Bachelorette invitation and the "Who''s Most Likely To" online game together.',
   'دعوة الحنة وسهرة العروسة ولعبة "مين الأكثر احتمالاً" الأونلاين معاً.',
   1150, array['henna', 'bachelorette-game'], '🎁', null, true, 4)
) as b(slug, bundle_name, name_ar, description, description_ar, bundle_price, product_slugs, icon, badge, featured, sort_order)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 10. Row level security
-- ------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.addons enable row level security;
alter table public.products enable row level security;
alter table public.bundles enable row level security;
alter table public.orders enable row level security;

-- Admin (authenticated) full access
drop policy if exists "Authenticated admins can manage categories" on public.categories;
create policy "Authenticated admins can manage categories" on public.categories for all to authenticated using (true) with check (true);
drop policy if exists "Authenticated admins can manage addons" on public.addons;
create policy "Authenticated admins can manage addons" on public.addons for all to authenticated using (true) with check (true);

-- Storefront (anon) can read active catalog rows only
drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories" on public.categories for select to anon using (is_active = true);
drop policy if exists "Public can read active addons" on public.addons;
create policy "Public can read active addons" on public.addons for select to anon using (is_active = true);
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select to anon using (is_active = true);
drop policy if exists "Public can read active bundles" on public.bundles;
create policy "Public can read active bundles" on public.bundles for select to anon using (is_active = true);

-- SECURITY FIX: customers' orders (names, phones, emails) must never be readable with the anon key.
drop policy if exists "Public can read own orders" on public.orders;
drop policy if exists "Allow public order inserts" on public.orders;
create policy "Allow public order inserts" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "Authenticated admins can manage orders" on public.orders;
create policy "Authenticated admins can manage orders" on public.orders for all to authenticated using (true) with check (true);

-- Storage: allow admins to delete replaced assets
drop policy if exists "Authenticated admins can delete assets" on storage.objects;
create policy "Authenticated admins can delete assets" on storage.objects
for delete to authenticated
using (bucket_id = 'memora-assets');
