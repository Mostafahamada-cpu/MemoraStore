-- ============================================================
-- Memora — Date / Birthday / Gender Reveal prices + Henna / Gender Reveal / Date demo refresh
-- Run this in the Supabase SQL editor AFTER MIGRATION_NFC_BUNDLES_DEMOS.sql.
-- Safe to run multiple times (idempotent).
--
-- What it does:
--   1. Prices (only where the price is still one of the previous values,
--      so a price set from the Admin since then is left alone):
--        date           250 / 500 → 400 EGP
--        birthday       350       → 400 EGP
--        gender-reveal  400       → 500 EGP
--      No bundle includes these products, so no bundle price depends on them.
--   2. Product copy for the three refreshed demos (Store/Demos/henna, gender-reveal, date):
--        henna          Three Egyptian concepts: Shaabi Night, Sa'idi, Nubian
--        gender-reveal  Guest vote (boy / girl) + sealed reveal
--        date           Built around the chosen date + theme
--      Each field is only replaced while it still holds the original seed text,
--      so anything edited from the Admin is left alone.
--
-- The seed catalog in assets/js/catalog.js and admin/MIGRATION_CATALOG_V2.sql
-- already contain these values.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Prices
-- ------------------------------------------------------------
update public.products p
   set price = c.new_price
  from (values
    ('date',          array[250, 500]::numeric[], 400),
    ('birthday',      array[350]::numeric[],      400),
    ('gender-reveal', array[400]::numeric[],      500)
  ) as c(slug, old_prices, new_price)
 where p.slug = c.slug
   and p.price = any(c.old_prices);

-- ------------------------------------------------------------
-- 2. Product copy (only where the original seed text is unchanged)
-- ------------------------------------------------------------
update public.products p
   set description = c.new_description
  from (values
    ('henna',
     'A festive henna night invitation full of colour and tradition.',
     'An Egyptian henna night invitation in three concepts: Shaabi Night, Sa''idi and Nubian.'),
    ('gender-reveal',
     'Build the suspense with a playful gender reveal invitation.',
     'Build the suspense: guests vote boy or girl, and the answer stays sealed until the reveal.'),
    ('date',
     'Invite your special someone to an unforgettable date.',
     'Your date. Your theme. Your story — an invitation designed around the day you choose.')
  ) as c(slug, old_description, new_description)
 where p.slug = c.slug
   and p.description = c.old_description;

update public.products p
   set description_ar = c.new_description
  from (values
    ('henna',
     'دعوة ليلة حنة مبهجة مليئة بالألوان والتقاليد.',
     'دعوة ليلة حنة مصرية بثلاث أفكار: سهرة شعبي، حنة صعيدي، وحنة نوبي.'),
    ('gender-reveal',
     'زيدوا التشويق بدعوة مرحة للكشف عن نوع المولود.',
     'زيدوا التشويق: يصوّت الضيوف ولد أم بنت، وتبقى الإجابة مخفية حتى لحظة الكشف.'),
    ('date',
     'ادعوا شخصكم المميز إلى موعد لا يُنسى.',
     'موعدكم، طابعكم، قصتكم — دعوة مصممة حول اليوم الذي تختارونه.')
  ) as c(slug, old_description, new_description)
 where p.slug = c.slug
   and p.description_ar = c.old_description;

update public.products p
   set features = c.new_features
  from (values
    ('henna',
     array['Festive henna-night styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
     array['Three Egyptian concepts: Shaabi, Sa''idi & Nubian', 'Night programme, location & countdown', 'Responsive on every device', 'Lifetime access']),
    ('gender-reveal',
     array['Playful pink & blue styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'],
     array['Guest vote: boy or girl', 'Live vote results & a sealed reveal', 'Event details, location & countdown', 'Lifetime access']),
    ('date',
     array['Intimate one-page invitation', 'Date, time & location', 'Countdown to the moment', 'Lifetime access'],
     array['Designed around your chosen date', 'Romantic, anniversary, birthday, proposal, celebration or seasonal theme', 'Countdown & timed location reveals', 'Lifetime access'])
  ) as c(slug, old_features, new_features)
 where p.slug = c.slug
   and p.features = c.old_features;

update public.products p
   set features_ar = c.new_features
  from (values
    ('henna',
     array['ستايل ليلة حنة مبهج', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
     array['ثلاث أفكار مصرية: شعبي وصعيدي ونوبي', 'برنامج الليلة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة']),
    ('gender-reveal',
     array['ستايل مرح باللونين الوردي والأزرق', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'],
     array['تصويت الضيوف: ولد أم بنت', 'نتائج التصويت وكشف مخفي حتى اللحظة', 'تفاصيل المناسبة والموقع والعد التنازلي', 'وصول مدى الحياة']),
    ('date',
     array['دعوة رومانسية من صفحة واحدة', 'التاريخ والوقت والمكان', 'عد تنازلي حتى اللحظة', 'وصول مدى الحياة'],
     array['مصممة حول التاريخ الذي تختارونه', 'طابع رومانسي أو ذكرى سنوية أو عيد ميلاد أو طلب زواج أو احتفال أو موسمي', 'عد تنازلي وكشف الأماكن في وقتها', 'وصول مدى الحياة'])
  ) as c(slug, old_features, new_features)
 where p.slug = c.slug
   and p.features_ar = c.old_features;
