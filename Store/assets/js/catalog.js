/* ================================================================
   MEMORA — Catalog loader
   Loads categories / products / bundles / add-ons from Supabase
   (public anon key, active rows only) and falls back to the seed
   catalog below when Supabase is unreachable or still empty.
   The seed mirrors admin/MIGRATION_CATALOG_V2.sql.
   ================================================================ */
(function () {
  const CACHE_KEY = 'memora-catalog-v2';
  const CACHE_TTL = 5 * 60 * 1000;
  const FETCH_TIMEOUT = 6000;

  /* ── Seed / fallback catalog ── */
  const seed = {
    categories: [
      { slug: 'wedding', name: 'Wedding', name_ar: 'حفل الزفاف', sort_order: 1 },
      { slug: 'moments', name: 'Other Occasions', name_ar: 'مناسبات أخرى', sort_order: 2 },
      { slug: 'bundles', name: 'Bundles', name_ar: 'الباقات', sort_order: 3 },
      { slug: 'custom', name: 'Custom', name_ar: 'تصميم خاص', sort_order: 4 },
    ],
    addons: [
      { slug: 'location', name: 'Location', name_ar: 'الموقع', description: 'Venue details with a map link.', description_ar: 'تفاصيل المكان مع رابط الخريطة.', price: 0, pricing_type: 'free', icon: '📍', sort_order: 1 },
      { slug: 'countdown', name: 'Countdown', name_ar: 'العد التنازلي', description: 'Live countdown to your event.', description_ar: 'عد تنازلي مباشر حتى موعد المناسبة.', price: 0, pricing_type: 'free', icon: '⏳', sort_order: 2 },
      { slug: 'music', name: 'Music', name_ar: 'الموسيقى', description: 'Your chosen track playing on the invitation.', description_ar: 'المقطوعة التي تختارونها تعمل داخل الدعوة.', price: 100, pricing_type: 'fixed', icon: '🎵', sort_order: 3 },
      { slug: 'background-animation', name: 'Background Animation', name_ar: 'خلفية متحركة', description: 'Subtle animated background matching your theme.', description_ar: 'خلفية متحركة هادئة تناسب الثيم.', price: 100, pricing_type: 'fixed', icon: '✨', sort_order: 4 },
      { slug: 'gallery', name: 'Gallery', name_ar: 'معرض الصور', description: 'A photo gallery section for your favourite moments.', description_ar: 'قسم لمعرض الصور لأجمل لحظاتكم.', price: 200, pricing_type: 'fixed', icon: '📸', sort_order: 5 },
      { slug: 'our-story', name: 'Our Story', name_ar: 'قصتنا', description: 'A dedicated section telling your story.', description_ar: 'قسم مخصص يروي قصتكم.', price: 200, pricing_type: 'fixed', icon: '💌', sort_order: 6 },
      { slug: 'rsvp', name: 'RSVP', name_ar: 'تأكيد الحضور', description: 'Guests confirm attendance online and you track replies.', description_ar: 'يؤكد الضيوف حضورهم أونلاين وتتابعون الردود.', price: 400, pricing_type: 'fixed', icon: '✅', sort_order: 7 },
      { slug: 'custom-animation', name: 'Custom Animation', name_ar: 'أنيميشن مخصص', description: 'Bespoke animation made for you. Final price depends on complexity.', description_ar: 'أنيميشن خاص بكم. السعر النهائي حسب التعقيد.', price: 150, pricing_type: 'from', icon: '🎬', sort_order: 8 },
    ],
    products: [
      {
        slug: 'wedding-standard', title: 'Wedding Standard', name_ar: 'دعوة زفاف — ستاندرد',
        description: 'A clean, elegant wedding invitation website with everything your guests need.',
        description_ar: 'موقع دعوة زفاف أنيق وبسيط يحتوي على كل ما يحتاجه ضيوفكم.',
        price: 500, pricing_type: 'fixed', product_type: 'product', category_slug: 'wedding', tier: 'Standard', event_type: 'wedding',
        features: ['Modern Minimal design', 'Event details, location & countdown', 'Mobile-first responsive layout', 'Lifetime access'],
        features_ar: ['تصميم Modern Minimal', 'تفاصيل المناسبة والموقع والعد التنازلي', 'تصميم متجاوب يعمل على كل الأجهزة', 'وصول مدى الحياة'],
        designs: [{ name: 'Modern Minimal', demo_url: 'https://modern-minimal-delta.vercel.app/', image_url: 'images/demo_modern_minimal.png' }],
        thumbnail_url: 'images/demo_modern_minimal.png', live_demo_url: 'https://modern-minimal-delta.vercel.app/', icon: '💍', badge: 'bestseller', featured: true, sort_order: 1,
      },
      {
        slug: 'wedding-premium', title: 'Wedding Premium', name_ar: 'دعوة زفاف — بريميوم',
        description: 'Our most refined wedding experience with animated gold accents and a choice of premium designs.',
        description_ar: 'أرقى تجربة زفاف لدينا مع لمسات ذهبية متحركة واختيار بين تصاميم بريميوم.',
        price: 800, pricing_type: 'fixed', product_type: 'product', category_slug: 'wedding', tier: 'Premium', event_type: 'wedding',
        features: ['Choice of Luxury Bloom or Authentic design', 'Animated gold accents & advanced animations', 'Event details, location & countdown', 'Priority support & lifetime updates'],
        features_ar: ['اختيار بين تصميم Luxury Bloom أو Authentic', 'لمسات ذهبية متحركة وأنيميشن متقدم', 'تفاصيل المناسبة والموقع والعد التنازلي', 'دعم ذو أولوية وتحديثات مدى الحياة'],
        designs: [
          { name: 'Luxury Bloom', demo_url: 'https://luxury-bloom-demo.vercel.app/', image_url: 'images/demo_luxury_bloom.png' },
          { name: 'Authentic', demo_url: 'https://authentic-demo-chi.vercel.app/', image_url: 'images/demo_royal_gold.png' },
        ],
        thumbnail_url: 'images/demo_luxury_bloom.png', live_demo_url: 'https://luxury-bloom-demo.vercel.app/', icon: '👑', badge: 'premium', featured: true, sort_order: 2,
      },
      { slug: 'engagement', title: 'Engagement Invitation', name_ar: 'دعوة خطوبة', description: 'Announce your engagement with a romantic digital invitation.', description_ar: 'أعلنوا خطوبتكم بدعوة رقمية رومانسية.', price: 500, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'engagement', features: ['Romantic engagement layout', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'], features_ar: ['تصميم خطوبة رومانسي', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'], icon: '💐', sort_order: 1 },
      { slug: 'henna', title: 'Henna Invitation', name_ar: 'دعوة حنة', description: 'A festive henna night invitation full of colour and tradition.', description_ar: 'دعوة ليلة حنة مبهجة مليئة بالألوان والتقاليد.', price: 500, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'henna', features: ['Festive henna-night styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'], features_ar: ['ستايل ليلة حنة مبهج', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'], icon: '🪷', sort_order: 2 },
      { slug: 'gender-reveal', title: 'Gender Reveal Invitation', name_ar: 'دعوة الكشف عن نوع المولود', description: 'Build the suspense with a playful gender reveal invitation.', description_ar: 'زيدوا التشويق بدعوة مرحة للكشف عن نوع المولود.', price: 400, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'gender-reveal', features: ['Playful pink & blue styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'], features_ar: ['ستايل مرح باللونين الوردي والأزرق', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'], icon: '🎀', sort_order: 3 },
      { slug: 'birthday', title: 'Birthday Invitation', name_ar: 'دعوة عيد ميلاد', description: 'A joyful birthday invitation for kids and grown-ups alike.', description_ar: 'دعوة عيد ميلاد مبهجة للأطفال والكبار.', price: 350, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'birthday', features: ['Joyful birthday styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'], features_ar: ['ستايل عيد ميلاد مبهج', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'], icon: '🎂', sort_order: 4 },
      { slug: 'date', title: 'Date Invitation', name_ar: 'دعوة موعد رومانسي', description: 'Invite your special someone to an unforgettable date.', description_ar: 'ادعوا شخصكم المميز إلى موعد لا يُنسى.', price: 250, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'date', features: ['Intimate one-page invitation', 'Date, time & location', 'Countdown to the moment', 'Lifetime access'], features_ar: ['دعوة رومانسية من صفحة واحدة', 'التاريخ والوقت والمكان', 'عد تنازلي حتى اللحظة', 'وصول مدى الحياة'], icon: '🌹', sort_order: 5 },
      { slug: 'bachelorette', title: 'Bachelorette Invitation', name_ar: 'دعوة سهرة العروسة', description: 'Gather the girls with a fun bachelorette party invitation.', description_ar: 'اجمعي صديقاتك بدعوة مرحة لسهرة العروسة.', price: 500, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'bachelorette', features: ['Fun bachelorette styling', 'Event details, location & countdown', 'Responsive on every device', 'Lifetime access'], features_ar: ['ستايل مرح لسهرة العروسة', 'تفاصيل المناسبة والموقع والعد التنازلي', 'يعمل على كل الأجهزة', 'وصول مدى الحياة'], icon: '🥂', sort_order: 6 },
      { slug: 'bachelorette-game', title: 'Bachelorette + "Who\'s Most Likely To" Online Game', name_ar: 'دعوة سهرة العروسة + لعبة "مين الأكثر احتمالاً" أونلاين', description: 'The bachelorette invitation plus an online "Who\'s Most Likely To" game your guests play together.', description_ar: 'دعوة سهرة العروسة مع لعبة "مين الأكثر احتمالاً" أونلاين تلعبها الضيفات معاً.', price: 800, pricing_type: 'fixed', product_type: 'product', category_slug: 'moments', event_type: 'bachelorette', features: ['Everything in the Bachelorette Invitation', '"Who\'s Most Likely To" online game', 'Play together from any phone', 'Lifetime access'], features_ar: ['كل ما في دعوة سهرة العروسة', 'لعبة "مين الأكثر احتمالاً" أونلاين', 'العبوا معاً من أي هاتف', 'وصول مدى الحياة'], icon: '🎉', badge: 'new', featured: true, sort_order: 7 },
      { slug: 'custom-invitation', title: 'Custom Invitation', name_ar: 'دعوة مخصصة', description: 'A completely customised invitation designed around your event, style and sections. Final price depends on complexity.', description_ar: 'دعوة مخصصة بالكامل حول مناسبتكم وأسلوبكم والأقسام التي تريدونها. السعر النهائي حسب التعقيد.', price: 800, pricing_type: 'from', product_type: 'custom', category_slug: 'custom', event_type: 'custom', features: ['Any event type', 'Your style, colours & sections', 'Custom animations available', 'Quoted after we review your request'], features_ar: ['أي نوع مناسبة', 'أسلوبكم وألوانكم وأقسامكم', 'إمكانية إضافة أنيميشن مخصص', 'نحدد السعر بعد مراجعة طلبكم'], icon: '✨', featured: true, sort_order: 1 },
    ],
    bundles: [
      { slug: 'henna-wedding-standard', bundle_name: 'Henna + Wedding Standard', name_ar: 'حنة + زفاف ستاندرد', description: 'Henna night and Wedding Standard invitations together at a better combined price.', description_ar: 'دعوتا الحنة والزفاف ستاندرد معاً بسعر مجمّع أفضل.', bundle_price: 900, included_slugs: ['henna', 'wedding-standard'], icon: '🎁', featured: true, sort_order: 1 },
      { slug: 'henna-wedding-premium', bundle_name: 'Henna + Wedding Premium', name_ar: 'حنة + زفاف بريميوم', description: 'Henna night and Wedding Premium invitations together at a better combined price.', description_ar: 'دعوتا الحنة والزفاف بريميوم معاً بسعر مجمّع أفضل.', bundle_price: 1150, included_slugs: ['henna', 'wedding-premium'], icon: '🎁', badge: 'best-value', featured: true, sort_order: 2 },
      { slug: 'henna-bachelorette', bundle_name: 'Henna + Bachelorette', name_ar: 'حنة + سهرة العروسة', description: 'Henna night and Bachelorette invitations together at a better combined price.', description_ar: 'دعوتا الحنة وسهرة العروسة معاً بسعر مجمّع أفضل.', bundle_price: 900, included_slugs: ['henna', 'bachelorette'], icon: '🎁', featured: true, sort_order: 3 },
      { slug: 'henna-bachelorette-game', bundle_name: 'Henna + Bachelorette + Online Game', name_ar: 'حنة + سهرة العروسة + اللعبة الأونلاين', description: 'Henna night, Bachelorette invitation and the "Who\'s Most Likely To" online game together.', description_ar: 'دعوة الحنة وسهرة العروسة ولعبة "مين الأكثر احتمالاً" الأونلاين معاً.', bundle_price: 1150, included_slugs: ['henna', 'bachelorette-game'], icon: '🎁', featured: true, sort_order: 4 },
    ],
  };

  /* ── Normalisation ── */
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const arr = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
  const bySort = (a, b) => (a.sortOrder - b.sortOrder) || String(a.slug).localeCompare(String(b.slug));

  function parseDesigns(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      try { return JSON.parse(value); } catch (e) { return []; }
    }
    return [];
  }

  function normalizeCategory(row) {
    return {
      id: row.id || row.slug,
      slug: row.slug,
      name: { en: row.name || row.slug, ar: row.name_ar || '' },
      description: { en: row.description || '', ar: row.description_ar || '' },
      sortOrder: num(row.sort_order),
      active: row.is_active !== false,
    };
  }

  function normalizeAddon(row) {
    return {
      id: row.id || row.slug,
      slug: row.slug,
      name: { en: row.name || row.slug, ar: row.name_ar || '' },
      description: { en: row.description || '', ar: row.description_ar || '' },
      price: num(row.price),
      pricingType: row.pricing_type || (num(row.price) === 0 ? 'free' : 'fixed'),
      icon: row.icon || '•',
      sortOrder: num(row.sort_order),
      active: row.is_active !== false,
    };
  }

  function normalizeProduct(row) {
    const designs = parseDesigns(row.designs).map((d) => ({
      name: d.name || '',
      demo_url: d.demo_url || d.demo || '',
      image_url: d.image_url || d.image || '',
    })).filter((d) => d.name);
    const image = row.thumbnail_url || (designs[0] && designs[0].image_url) || '';
    const demo = row.live_demo_url || (designs[0] && designs[0].demo_url) || '';
    return {
      id: row.id || row.slug,
      slug: row.slug,
      kind: 'product',
      type: row.product_type || 'product',
      name: { en: row.title || row.slug, ar: row.name_ar || '' },
      description: { en: row.description || '', ar: row.description_ar || '' },
      price: num(row.price),
      pricingType: row.pricing_type || 'fixed',
      category: row.category_slug || (row.product_type === 'custom' ? 'custom' : 'moments'),
      tier: row.tier || '',
      eventType: row.event_type || '',
      features: { en: arr(row.features), ar: arr(row.features_ar) },
      designs,
      includedAddons: arr(row.included_addons),
      image,
      demo,
      icon: row.icon || '💌',
      badge: row.badge || '',
      featured: !!row.featured,
      sortOrder: num(row.sort_order),
      active: row.is_active !== false,
    };
  }

  function normalizeBundle(row) {
    return {
      id: row.id || row.slug,
      slug: row.slug,
      kind: 'bundle',
      type: 'bundle',
      name: { en: row.bundle_name || row.slug, ar: row.name_ar || '' },
      description: { en: row.description || '', ar: row.description_ar || '' },
      price: num(row.bundle_price),
      pricingType: 'fixed',
      category: 'bundles',
      tier: '',
      eventType: 'bundle',
      features: { en: [], ar: [] },
      designs: [],
      includedAddons: [],
      includedProductIds: arr(row.included_product_ids),
      includedSlugs: arr(row.included_slugs),
      includedNames: arr(row.included_products),
      image: row.thumbnail_url || '',
      demo: '',
      icon: row.icon || '🎁',
      badge: row.badge || '',
      featured: !!row.featured,
      sortOrder: num(row.sort_order),
      active: row.is_active !== false,
    };
  }

  function build(raw) {
    const categories = raw.categories.map(normalizeCategory).filter((c) => c.active).sort(bySort);
    const addons = raw.addons.map(normalizeAddon).filter((a) => a.active).sort(bySort);
    const products = raw.products.map(normalizeProduct).filter((p) => p.active && p.slug).sort(bySort);
    const bundles = raw.bundles.map(normalizeBundle).filter((b) => b.active && b.slug).sort(bySort);

    const productById = new Map(products.map((p) => [String(p.id), p]));
    const productBySlug = new Map(products.map((p) => [p.slug, p]));

    bundles.forEach((bundle) => {
      const items = [];
      bundle.includedProductIds.forEach((id) => { const p = productById.get(String(id)); if (p) items.push(p); });
      if (!items.length) bundle.includedSlugs.forEach((slug) => { const p = productBySlug.get(slug); if (p) items.push(p); });
      bundle.items = items;
      bundle.compareTotal = items.reduce((sum, p) => sum + p.price, 0);
      bundle.savings = Math.max(0, bundle.compareTotal - bundle.price);
      // A bundle inherits the event types of its items so the order form can ask the right questions.
      bundle.eventTypes = items.map((p) => p.eventType).filter(Boolean);
      bundle.designs = items.flatMap((p) => p.designs.map((d) => ({ ...d, product: p.slug })));
      bundle.designProduct = items.find((p) => p.designs.length > 1) || null;
      if (!bundle.image) bundle.image = (items.find((p) => p.image) || {}).image || '';
      // Only bundles with resolvable products are sellable.
      bundle.sellable = items.length > 0;
    });

    const catalog = {
      categories, addons, products, bundles: bundles.filter((b) => b.sellable),
      getProduct: (slug) => productBySlug.get(slug) || null,
      getBundle: (slug) => bundles.find((b) => b.slug === slug) || null,
      getItem: (slug) => productBySlug.get(slug) || bundles.find((b) => b.slug === slug) || null,
      getAddon: (slug) => addons.find((a) => a.slug === slug) || null,
      getCategory: (slug) => categories.find((c) => c.slug === slug) || null,
      productsIn: (categorySlug) => products.filter((p) => p.category === categorySlug && p.type !== 'custom'),
      sellable: () => [...products.filter((p) => p.type !== 'custom'), ...bundles.filter((b) => b.sellable)],
      customProduct: () => products.find((p) => p.type === 'custom') || null,
      paidAddons: () => addons.filter((a) => a.pricingType !== 'free'),
      freeAddons: () => addons.filter((a) => a.pricingType === 'free'),
    };
    return catalog;
  }

  /* ── Supabase fetch (PostgREST, anon key) ── */
  function supabaseConfig() {
    const cfg = window.MEMORA_SUPABASE || {};
    if (!cfg.url || !cfg.anonKey || /YOUR_/.test(cfg.url) || /YOUR_/.test(cfg.anonKey)) return null;
    return cfg;
  }

  async function fetchTable(cfg, table, query) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
      const response = await fetch(`${cfg.url}/rest/v1/${table}?${query}`, {
        headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${table}: HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchRemote() {
    const cfg = supabaseConfig();
    if (!cfg) return null;
    const [products, bundles, addons, categories] = await Promise.all([
      fetchTable(cfg, 'products', 'select=*&is_active=eq.true&order=sort_order.asc'),
      fetchTable(cfg, 'bundles', 'select=*&is_active=eq.true&order=sort_order.asc'),
      fetchTable(cfg, 'addons', 'select=*&is_active=eq.true&order=sort_order.asc').catch(() => []),
      fetchTable(cfg, 'categories', 'select=*&is_active=eq.true&order=sort_order.asc').catch(() => []),
    ]);
    // The store is only considered database-driven once the catalog migration has been seeded.
    const migrated = products.some((p) => p.slug);
    if (!migrated) return null;
    return {
      products,
      bundles,
      addons: addons.length ? addons : seed.addons,
      categories: categories.length ? categories : seed.categories,
    };
  }

  function readCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.time > CACHE_TTL) return null;
      return parsed.data;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data })); } catch (e) { /* ignore */ }
  }

  let loading = null;
  let current = null;

  async function load(options = {}) {
    if (current && !options.force) return current;
    if (loading && !options.force) return loading;
    loading = (async () => {
      let raw = options.force ? null : readCache();
      let source = 'cache';
      if (!raw) {
        try {
          raw = await fetchRemote();
          source = raw ? 'supabase' : 'seed';
        } catch (error) {
          console.warn('Memora catalog: Supabase unavailable, using seed catalog.', error);
          source = 'seed';
        }
        if (!raw) raw = seed;
        else writeCache(raw);
      }
      current = build(raw);
      current.source = source;
      return current;
    })();
    return loading;
  }

  /* ── Presentation helpers shared by store pages ── */
  const i18n = () => window.MemoraI18n;
  const nameOf = (item) => i18n() ? i18n().pick(item.name) : item.name.en;
  const descOf = (item) => i18n() ? i18n().pick(item.description) : item.description.en;
  const featuresOf = (item) => {
    const list = i18n() ? i18n().pick(item.features) : item.features.en;
    return Array.isArray(list) && list.length ? list : item.features.en;
  };

  function priceLabel(item, opts = {}) {
    const I = i18n();
    const money = I ? I.money(item.price, opts) : `EGP ${item.price}`;
    if (item.pricingType === 'free' || (item.price === 0 && item.pricingType !== 'from')) return I ? I.t('common.free') : 'FREE';
    if (item.pricingType === 'from') return `${I ? I.t('common.from') : 'Starting from'} ${money}`;
    return money;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Real product artwork when it exists; otherwise a branded occasion tile with a line icon (no emoji, no stock imagery).
  function imageMarkup(item, alt) {
    if (item.image) return `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(alt || nameOf(item))}" loading="lazy">`;
    const icons = window.MemoraIcons;
    const glyph = icons ? icons.svg(icons.forItem(item), 'tile-glyph') : '';
    return `<div class="occasion-tile occasion-${escapeHtml(item.eventType || item.kind || 'custom')}" aria-hidden="true"><span class="tile-ring"></span>${glyph}</div>`;
  }

  function badgeMarkup(item) {
    const I = i18n();
    const label = (key) => (I ? I.t(`common.badge.${key}`) : key);
    const badges = [];
    if (item.badge === 'bestseller') badges.push(`<span class="card-badge bestseller">${label('bestseller')}</span>`);
    if (item.badge === 'new') badges.push(`<span class="card-badge new">${label('new')}</span>`);
    if (item.badge === 'best-value') badges.push(`<span class="card-badge premium">${label('bestValue')}</span>`);
    if (item.badge === 'premium' || item.tier === 'Premium') badges.push(`<span class="card-badge premium">${label('premium')}</span>`);
    return badges.join('');
  }

  window.MemoraCatalog = { load, seed, nameOf, descOf, featuresOf, priceLabel, imageMarkup, badgeMarkup, escapeHtml };
})();
