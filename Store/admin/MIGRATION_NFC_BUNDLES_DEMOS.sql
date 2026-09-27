-- ============================================================
-- Memora — Love NFC Card bundles + occasion demos migration
-- Run this in the Supabase SQL editor AFTER MIGRATION_CATALOG_V2.sql.
-- Safe to run multiple times (idempotent).
--
-- What it does:
--   1. Allows a new product_type 'bundle-only' (never listed or ordered alone,
--      only resolvable inside bundles). The storefront (assets/js/catalog.js)
--      hides bundle-only products from every grid, the price list, the order
--      form and the "related" pools, and shows "Bundle exclusive" instead of a
--      price on the product page.
--   2. Adds the existing Love NFC Card as that bundle-only product, reusing the
--      artwork already in the repo (images/love_card_design.png) and the
--      existing Love Card demo (Demos/Love card/modern/).
--   3. Adds three bundles that include the card — Engagement / Wedding only:
--        wedding-standard-nfc  Wedding Standard + Love NFC Card   950 EGP
--        wedding-premium-nfc   Wedding Premium  + Love NFC Card  1250 EGP
--        engagement-nfc        Engagement       + Love NFC Card   950 EGP
--      (950 / 1250 are the prices of the legacy "Memora Essential" /
--      "Memora Signature" Love Card bundles from SUPABASE_SETUP.sql.)
--      Existing Henna bundles move to sort_order 4-7 so the NFC bundles lead.
--   4. Sets live_demo_url on the occasion products to the new demos shipped
--      in Store/Demos/ (only where no demo URL has been set from the Admin).
--   5. Sets thumbnail_url on the occasion products to preview images captured
--      from those demos (Store/images/previews/, only where no image has been
--      set from the Admin). Until this runs, the storefront shows the same
--      images through the seed media fallback in assets/js/catalog.js.
-- ============================================================

-- ------------------------------------------------------------
-- 1. product_type: allow 'bundle-only'
-- ------------------------------------------------------------
alter table public.products drop constraint if exists products_product_type_check;
alter table public.products add constraint products_product_type_check
  check (product_type in ('product', 'custom', 'bundle-only'));

-- ------------------------------------------------------------
-- 2. Love NFC Card (bundle-only, existing assets)
-- ------------------------------------------------------------
insert into public.products
  (slug, title, name_ar, description, description_ar, price, pricing_type, product_type, category_slug, tier, event_type,
   features, features_ar, designs, thumbnail_url, live_demo_url, icon, badge, featured, is_active, sort_order)
values
  ('love-nfc-card', 'Love NFC Card', 'بطاقة Love NFC',
   'A premium NFC card that opens your invitation website with a tap — gallery, love story, music, countdown and messages. Included exclusively in Engagement and Wedding bundles.',
   'بطاقة NFC فاخرة تفتح موقع دعوتكم بلمسة واحدة — معرض الصور وقصتكم والموسيقى والعد التنازلي والرسائل. متاحة حصرياً ضمن باقات الخطوبة والزفاف.',
   450, 'fixed', 'bundle-only', 'bundles', null, null,
   array['Tap-to-open NFC website link', 'Premium printed card design', 'Photo gallery & love story', 'Music, countdown & messages'],
   array['رابط الموقع يفتح بلمسة NFC', 'تصميم بطاقة مطبوعة فاخر', 'معرض صور وقصة حبكم', 'موسيقى وعد تنازلي ورسائل'],
   '[]'::jsonb, 'images/love_card_design.png', 'Demos/Love card/modern/', 'card', null, false, true, 1)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 3. Bundles that include the Love NFC Card (Engagement / Wedding only)
-- ------------------------------------------------------------
insert into public.bundles (slug, bundle_name, name_ar, description, description_ar, bundle_price, included_product_ids, included_products, thumbnail_url, icon, badge, featured, is_active, sort_order)
select
  b.slug, b.bundle_name, b.name_ar, b.description, b.description_ar, b.bundle_price,
  array(select p.id from public.products p where p.slug = any(b.product_slugs) order by array_position(b.product_slugs, p.slug)),
  array(select p.title from public.products p where p.slug = any(b.product_slugs) order by array_position(b.product_slugs, p.slug)),
  b.thumbnail_url, b.icon, b.badge, b.featured, true, b.sort_order
from (values
  ('wedding-standard-nfc', 'Wedding Standard + Love NFC Card', 'زفاف ستاندرد + بطاقة Love NFC',
   'The Wedding Standard invitation website plus the physical Love NFC Card that opens it with a tap.',
   'موقع دعوة الزفاف ستاندرد مع بطاقة Love NFC الفعلية التي تفتحه بلمسة واحدة.',
   950, array['wedding-standard', 'love-nfc-card'], 'images/Essential_Bundle_image.jpeg', '🎁', null, true, 1),
  ('wedding-premium-nfc', 'Wedding Premium + Love NFC Card', 'زفاف بريميوم + بطاقة Love NFC',
   'The Wedding Premium invitation website plus the physical Love NFC Card that opens it with a tap.',
   'موقع دعوة الزفاف بريميوم مع بطاقة Love NFC الفعلية التي تفتحه بلمسة واحدة.',
   1250, array['wedding-premium', 'love-nfc-card'], 'images/Signutare_Bundle_Image.jpeg', '🎁', 'best-value', true, 2),
  ('engagement-nfc', 'Engagement + Love NFC Card', 'خطوبة + بطاقة Love NFC',
   'The Engagement invitation website plus the physical Love NFC Card that opens it with a tap.',
   'موقع دعوة الخطوبة مع بطاقة Love NFC الفعلية التي تفتحه بلمسة واحدة.',
   950, array['engagement', 'love-nfc-card'], 'images/love_card_design.png', '🎁', null, true, 3)
) as b(slug, bundle_name, name_ar, description, description_ar, bundle_price, product_slugs, thumbnail_url, icon, badge, featured, sort_order)
on conflict (slug) do nothing;

-- Existing Henna bundles follow the NFC bundles.
update public.bundles set sort_order = sort_order + 3
 where slug in ('henna-wedding-standard', 'henna-wedding-premium', 'henna-bachelorette', 'henna-bachelorette-game', 'henna-bachelorette-game-wedding-invitaion')
   and sort_order <= 4;

-- ------------------------------------------------------------
-- 4. Occasion demos (Store/Demos/*) — only where nothing was set from the Admin
-- ------------------------------------------------------------
update public.products p
   set live_demo_url = d.url
  from (values
    ('engagement',    'Demos/engagement/'),
    ('henna',         'Demos/henna/'),
    ('birthday',      'Demos/birthday/'),
    ('gender-reveal', 'Demos/gender-reveal/'),
    ('date',          'Demos/date/'),
    ('bachelorette',  'Demos/bachelorette/')
  ) as d(slug, url)
 where p.slug = d.slug
   and (p.live_demo_url is null or p.live_demo_url = '');

-- ------------------------------------------------------------
-- 5. Occasion preview images (captured from the demos above) — only where nothing was set from the Admin
--    ("Bachelorette + Game" is the same invitation as "Bachelorette", so it shares its preview.)
-- ------------------------------------------------------------
update public.products p
   set thumbnail_url = d.url
  from (values
    ('engagement',        'images/previews/engagement.jpg'),
    ('henna',             'images/previews/henna.jpg'),
    ('birthday',          'images/previews/birthday.jpg'),
    ('gender-reveal',     'images/previews/gender-reveal.jpg'),
    ('date',              'images/previews/date.jpg'),
    ('bachelorette',      'images/previews/bachelorette.jpg'),
    ('bachelorette-game', 'images/previews/bachelorette.jpg')
  ) as d(slug, url)
 where p.slug = d.slug
   and (p.thumbnail_url is null or p.thumbnail_url = '');
