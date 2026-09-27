/* ================================================================
   MEMORA — Premium Marketplace JavaScript
   Store helpers, shared card renderers, navigation, animations.
   Catalog data comes from assets/js/catalog.js (Supabase + seed).
   Translations come from assets/js/i18n.js.
   ================================================================ */

// ── Store Module ── //
const Store = (() => {
  const WHATSAPP_NUMBER = '201099885633';

  const whatsappLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Quick WhatsApp enquiry (secondary CTA). Orders go through order-form.html → checkout.html.
  const buyNow = (name) => {
    const message = window.MemoraI18n && window.MemoraI18n.lang === 'ar'
      ? `مرحباً! أنا مهتم بطلب:\n${name}`
      : `Hi! I'm interested in purchasing:\n${name}`;
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
  };

  return { WHATSAPP_NUMBER, whatsappLink, buyNow };
})();

// ── UI Module ── //
const UI = (() => {
  let notificationTimeout;
  const t = (key, vars) => (window.MemoraI18n ? window.MemoraI18n.t(key, vars) : key);
  const money = (n, opts) => (window.MemoraI18n ? window.MemoraI18n.money(n, opts) : `EGP ${n}`);
  const C = () => window.MemoraCatalog;
  const esc = (v) => (C() ? C().escapeHtml(v) : String(v ?? ''));

  const showNotification = (message, type = 'info') => {
    clearTimeout(notificationTimeout);
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('visible'), 0);
    notificationTimeout = setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const icon = (key, cls) => (window.MemoraIcons ? window.MemoraIcons.svg(key, cls) : '');
  const iconFor = (item) => (window.MemoraIcons ? window.MemoraIcons.forItem(item) : 'custom');
  const productHref = (item) => `product.html?id=${encodeURIComponent(item.slug)}`;
  const orderHref = (item, design) => (item.type === 'custom'
    ? 'custom-order.html'
    : `order-form.html?product=${encodeURIComponent(item.slug)}${design ? `&design=${encodeURIComponent(design)}` : ''}`);

  // Occasion of a catalog item (wedding, henna, …) — drives the category chip, filters and icons.
  const occasionKey = (item) => {
    if (!item) return 'custom';
    if (item.kind === 'bundle') return 'bundle';
    if (item.type === 'custom') return 'custom';
    return item.eventType || (item.category === 'wedding' ? 'wedding' : 'custom');
  };
  const occasionLabel = (key) => {
    const label = t(`occasions.${key}`);
    return label === `occasions.${key}` ? '' : label;
  };
  const tierKey = (item) => (item.tier === 'Premium' ? 'premium' : item.tier === 'Standard' ? 'standard' : '');

  // Demos always open in a new tab, exactly as guests see them.
  const demoButton = (href, cls = 'btn btn-outline btn-sm') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${icon('play', 'btn-glyph')}<span>${esc(t('common.viewDemo'))}</span><span class="sr-only"> ${esc(t('common.opensNewTab'))}</span></a>`;
  const liveBadge = () => `<span class="live-badge"><i aria-hidden="true"></i>${esc(t('common.liveBadge'))}</span>`;

  const tierBadge = (item) => {
    if (item.tier === 'Premium') return `<span class="badge badge-gold">${esc(t('common.badge.premium'))}</span>`;
    if (item.tier === 'Standard') return `<span class="badge badge-rose">${esc(t('common.badge.standard'))}</span>`;
    if (item.kind === 'bundle') return `<span class="badge badge-emerald">${esc(t('common.badge.bundle'))}</span>`;
    if (item.type === 'custom') return `<span class="badge badge-primary">${esc(t('common.badge.custom'))}</span>`;
    return '';
  };

  /* ── Live demo showcase ─────────────────────────────────────────
     One entry per live demo in the catalog: every wedding design, then every
     other product that has a demo URL. Nothing here is hardcoded. */
  const demoEntries = (catalog) => {
    const c = C();
    const entries = [];
    catalog.categories
      .filter((cat) => cat.slug !== 'bundles' && cat.slug !== 'custom')
      .forEach((cat) => catalog.productsIn(cat.slug).forEach((item) => {
        if (item.designs.length) {
          item.designs.forEach((d) => {
            const demo = d.demo_url || (item.designs.length === 1 ? item.demo : '');
            if (demo) entries.push({ item, design: d.name, title: d.name, image: d.image_url || item.image, demo, key: occasionKey(item) });
          });
        } else if (item.demo) {
          entries.push({ item, design: '', title: c.nameOf(item), image: item.image, demo: item.demo, key: occasionKey(item) });
        }
      }));
    return entries;
  };

  const demoTile = (entry) => {
    const c = C();
    const item = entry.item;
    const tier = tierKey(item);
    return `
      <article class="demo-tile" data-filter="${esc(entry.key)}">
        <a class="demo-media" href="${esc(entry.demo)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${t('common.viewDemo')}: ${entry.title} ${t('common.opensNewTab')}`)}">
          <span class="demo-chrome" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="demo-shot">${entry.image ? c.pictureMarkup(entry.image, entry.title, { sizes: '(max-width: 640px) 80vw, 380px' }) : c.imageMarkup(item, entry.title)}</span>
          ${liveBadge()}
          <span class="demo-open" aria-hidden="true">${icon('external')}</span>
        </a>
        <div class="demo-body">
          <p class="demo-cat">${icon(entry.key, 'demo-cat-icon')}<span>${esc(occasionLabel(entry.key))}</span>${tier ? `<span class="demo-tier${tier === 'premium' ? ' is-gold' : ''}">${esc(t(`common.badge.${tier}`))}</span>` : ''}</p>
          <h3 class="demo-name">${esc(entry.title)}</h3>
          <p class="demo-of">${entry.design ? esc(c.nameOf(item)) : esc(c.descOf(item))}</p>
          <div class="demo-foot">
            <span class="demo-price">${esc(c.priceLabel(item))}</span>
            <div class="demo-actions">
              ${demoButton(entry.demo)}
              <a class="btn btn-primary btn-sm" href="${orderHref(item, entry.design)}">${esc(t('common.choose'))}</a>
            </div>
          </div>
        </div>
      </article>`;
  };

  const demoFilters = (entries, active = 'all') => {
    const keys = [...new Set(entries.map((e) => e.key))];
    const chip = (key, label) => `<button type="button" class="chip${key === active ? ' is-active' : ''}" data-demo-filter="${esc(key)}" aria-pressed="${key === active}">${key === 'all' ? '' : icon(key, 'chip-icon')}<span>${esc(label)}</span></button>`;
    return keys.length > 1 ? chip('all', t('common.all')) + keys.map((k) => chip(k, occasionLabel(k) || k)).join('') : '';
  };

  /* ── Wedding storefront: one tier group per wedding product, one card per design ── */
  // orderItem: what the Order button orders (a bundle page shows its products' designs but orders the bundle).
  const designCard = (item, design, multi, orderItem = item) => {
    const c = C();
    const tier = tierKey(item);
    const name = design.name || c.nameOf(item);
    const demo = design.demo_url || (!multi ? item.demo : '');
    const image = design.image_url || item.image;
    const media = image ? c.pictureMarkup(image, name, { sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 380px' }) : c.imageMarkup(item, name);
    return `
      <article class="tier-design${tier === 'premium' ? ' is-premium' : ''}">
        ${demo
          ? `<a class="tier-design-media" href="${esc(demo)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">${media}${liveBadge()}</a>`
          : `<a class="tier-design-media" href="${productHref(item)}" tabindex="-1" aria-hidden="true">${media}</a>`}
        <div class="tier-design-body">
          <div class="tier-design-row">
            <h4 class="tier-design-name">${esc(name)}</h4>
            ${tier ? `<span class="tier-pill${tier === 'premium' ? ' is-gold' : ''}">${esc(t(`common.badge.${tier}`))}</span>` : ''}
          </div>
          <p class="tier-design-of"><span>${esc(c.nameOf(item))}</span><strong>${esc(c.priceLabel(item))}</strong></p>
          <div class="tier-design-actions">
            ${demo ? demoButton(demo) : `<a class="btn btn-outline btn-sm" href="${productHref(item)}">${esc(t('common.details'))}</a>`}
            <a class="btn btn-primary btn-sm" href="${orderHref(orderItem, design.name)}">${esc(t('common.order'))}</a>
          </div>
        </div>
      </article>`;
  };

  const tierGroup = (item) => {
    const c = C();
    const tier = tierKey(item) || 'standard';
    const multi = item.designs.length > 1;
    const designs = item.designs.length ? item.designs : [{ name: '', demo_url: item.demo, image_url: item.image }];
    const features = c.featuresOf(item).slice(0, 4);
    const count = item.designs.length;
    const ribbon = tier === 'premium'
      ? `<span class="tier-ribbon">${esc(t('common.mostPremium'))}</span>`
      : item.badge === 'bestseller' ? `<span class="tier-ribbon is-rose">${esc(t('common.badge.bestseller'))}</span>` : '';
    return `
      <section class="tier-group${tier === 'premium' ? ' is-premium' : ''}" style="--designs:${designs.length}" aria-label="${esc(c.nameOf(item))}">
        <header class="tier-head">
          <div class="tier-head-top"><span class="tier-label">${esc(t(`common.badge.${tier}`))}</span>${ribbon}</div>
          <div class="tier-head-main">
            <h3 class="tier-name"><a href="${productHref(item)}">${esc(c.nameOf(item))}</a></h3>
            <div class="tier-price"><strong>${esc(c.priceLabel(item))}</strong><small>${esc(t('common.oneTime'))}${count ? ` · ${esc(count === 1 ? t('common.designCountOne') : t('common.designCount', { n: count }))}` : ''}</small></div>
          </div>
          <p class="tier-desc">${esc(c.descOf(item))}</p>
          ${features.length ? `<ul class="tier-features">${features.map((f) => `<li>${icon('check', 'tier-check')}<span>${esc(f)}</span></li>`).join('')}</ul>` : ''}
        </header>
        <div class="tier-designs">${designs.map((d) => designCard(item, d, multi)).join('')}</div>
      </section>`;
  };

  const renderWeddingBoard = (items, container) => {
    if (!container) return;
    if (!items.length) { container.innerHTML = `<p class="empty-state">${esc(t('common.noProducts'))}</p>`; return; }
    // Columns follow the number of designs per tier so every design card has the same width.
    container.style.setProperty('--tier-cols', items.map((p) => `${Math.max(1, p.designs.length)}fr`).join(' '));
    container.innerHTML = items.map(tierGroup).join('');
  };

  /* ── Product card: large preview → name → price → demo / order ── */
  const productCard = (item, index = 0) => {
    const c = C();
    const isCustom = item.type === 'custom';
    const label = occasionLabel(occasionKey(item));
    return `
      <article class="shop-card animate-on-scroll" data-slug="${esc(item.slug)}" style="--d:${Math.min(index, 6) * 60}ms">
        <a class="shop-media" href="${productHref(item)}" tabindex="-1" aria-hidden="true">
          ${c.imageMarkup(item, c.nameOf(item), { sizes: '(max-width: 560px) 46vw, (max-width: 1100px) 31vw, 290px' })}
          ${label ? `<span class="shop-cat">${icon(occasionKey(item), 'shop-cat-icon')}${esc(label)}</span>` : ''}
          ${c.badgeMarkup(item)}
          ${item.demo ? liveBadge() : ''}
        </a>
        <div class="shop-body">
          <h3 class="shop-name"><a href="${productHref(item)}">${esc(c.nameOf(item))}</a></h3>
          <p class="shop-desc">${esc(c.descOf(item))}</p>
          <p class="shop-price">${esc(c.priceLabel(item))}</p>
          <div class="shop-actions">
            ${item.demo ? demoButton(item.demo) : `<a class="btn btn-outline btn-sm" href="${productHref(item)}">${esc(t('common.details'))}</a>`}
            <a class="btn btn-primary btn-sm" href="${orderHref(item)}">${esc(isCustom ? t('common.requestQuote') : t('common.order'))}</a>
          </div>
        </div>
      </article>`;
  };

  /* ── Bundles: what's inside, what it costs, what you save (all from the catalog) ── */
  const bundleVisual = (bundle) => {
    const c = C();
    if (bundle.ownImage) return c.pictureMarkup(bundle.ownImage, c.nameOf(bundle), { sizes: '(max-width: 640px) 92vw, 460px' });
    const pics = (bundle.items || []).filter((p) => p.image).slice(0, 3);
    if (!pics.length) return c.imageMarkup(bundle, c.nameOf(bundle));
    return `<span class="bundle-collage n-${pics.length}">${pics.map((p) => `<span class="bundle-collage-item">${c.pictureMarkup(p.image, c.nameOf(p), { sizes: '(max-width: 640px) 46vw, 240px' })}</span>`).join('')}</span>`;
  };

  const bundleCard = (bundle, index = 0) => {
    const c = C();
    const items = bundle.items || [];
    const exclusive = bundle.exclusiveItems || [];
    const best = bundle.badge === 'best-value';
    // Bundle-only items (Love NFC Card) have no standalone price: label them "Included" instead.
    const itemPrice = (p) => (p.bundleOnly ? `<em class="is-exclusive">${esc(t('common.included'))}</em>` : `<em>${esc(money(p.price))}</em>`);
    return `
      <article class="bundle-card animate-on-scroll${best ? ' is-best' : ''}${exclusive.length ? ' has-nfc' : ''}" data-slug="${esc(bundle.slug)}" style="--d:${Math.min(index, 6) * 60}ms">
        <a class="bundle-media" href="${productHref(bundle)}" tabindex="-1" aria-hidden="true">
          ${bundleVisual(bundle)}
          ${best ? `<span class="card-badge premium">${esc(t('common.badge.bestValue'))}</span>` : ''}
          ${exclusive.length ? `<span class="card-badge nfc">${icon('card', 'nfc-badge-icon')}${esc(t('common.nfcIncluded'))}</span>` : ''}
        </a>
        <div class="bundle-body">
          <p class="bundle-kicker">${icon('bundle', 'bundle-kicker-icon')}<span>${esc(t('common.badge.bundle'))}</span></p>
          <h3 class="bundle-name"><a href="${productHref(bundle)}">${esc(c.nameOf(bundle))}</a></h3>
          <ul class="bundle-includes">
            ${items.map((p) => `<li${p.bundleOnly ? ' class="is-exclusive"' : ''}>${icon(iconFor(p), 'bundle-item-icon')}<span>${esc(c.nameOf(p))}</span>${itemPrice(p)}</li>`).join('')}
          </ul>
          <div class="bundle-pricing">
            <div class="bundle-price-stack">
              ${bundle.compareTotal > bundle.price ? `<span class="bundle-was">${esc(t('common.individually'))} <s>${esc(money(bundle.compareTotal))}</s></span>` : ''}
              <strong class="bundle-price">${esc(money(bundle.price))}</strong>
            </div>
            ${bundle.savings > 0 ? `<span class="save-pill">${icon('tag', 'save-icon')}${esc(t('common.save'))} ${esc(money(bundle.savings))}</span>` : ''}
          </div>
          <div class="bundle-actions">
            <a href="${productHref(bundle)}" class="btn btn-outline btn-sm">${esc(t('common.viewBundle'))}</a>
            <a href="${orderHref(bundle)}" class="btn btn-primary btn-sm">${esc(t('common.orderBundle'))}</a>
          </div>
        </div>
      </article>`;
  };

  const renderCards = (items, container, renderer) => {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `<p class="empty-state">${esc(t('common.noProducts'))}</p>`;
      return;
    }
    container.innerHTML = items.map((item, i) => renderer(item, i)).join('');
    Animations.initScrollAnimations();
  };

  /* ── Price builder: base invitation + chosen add-ons = total (catalog prices only) ── */
  const addonPrice = (addon) => {
    if (addon.pricingType === 'free') return `<span class="price-pill free">${esc(t('common.alwaysIncluded'))}</span>`;
    if (addon.pricingType === 'from') return `<span class="price-pill from">${esc(t('common.fromShort'))} ${esc(money(addon.price, { plus: true }))}</span>`;
    return `<span class="price-pill">${esc(money(addon.price, { plus: true }))}</span>`;
  };

  const priceBuilder = (catalog, root) => {
    if (!root) return;
    const c = C();
    const groups = catalog.categories
      .filter((cat) => cat.slug !== 'bundles' && cat.slug !== 'custom')
      .map((cat) => ({ cat, items: catalog.productsIn(cat.slug).filter((p) => p.pricingType !== 'from') }))
      .filter((g) => g.items.length);
    const bases = groups.flatMap((g) => g.items);
    if (!bases.length) { root.innerHTML = `<p class="empty-state">${esc(t('common.noProducts'))}</p>`; return; }
    const state = root.pbState || { base: bases[0].slug, addons: [] };
    if (!bases.some((p) => p.slug === state.base)) state.base = bases[0].slug;
    state.addons = state.addons.filter((slug) => catalog.getAddon(slug));
    root.pbState = state;
    const custom = catalog.customProduct();

    root.innerHTML = `
      <div class="pb-panels">
        <div class="pb-panel">
          <div class="pb-step"><span class="pb-num">1</span><div><h3>${esc(t('pricing.step1Title'))}</h3><p>${esc(t('pricing.step1Sub'))}</p></div></div>
          ${groups.map((g) => `
            <fieldset class="pb-group">
              <legend>${esc(c.nameOf(g.cat))}</legend>
              ${g.items.map((p) => `
                <label class="pb-option">
                  <input type="radio" name="pb-base" value="${esc(p.slug)}"${p.slug === state.base ? ' checked' : ''}>
                  <span class="pb-radio" aria-hidden="true"></span>
                  <span class="pb-option-name">${icon(iconFor(p), 'pb-option-icon')}<span>${esc(c.nameOf(p))}</span></span>
                  <span class="pb-option-price">${esc(money(p.price))}</span>
                </label>`).join('')}
            </fieldset>`).join('')}
          ${custom ? `<p class="pb-custom">${icon('custom', 'pb-custom-icon')}<span>${esc(t('pricing.customRow'))} <a href="#custom">${esc(t('pricing.customLink'))}</a> · ${esc(c.priceLabel(custom))}</span></p>` : ''}
        </div>
        <div class="pb-panel">
          <div class="pb-step"><span class="pb-num">2</span><div><h3>${esc(t('pricing.step2Title'))}</h3><p>${esc(t('pricing.step2Sub'))}</p></div></div>
          <div class="pb-addons" role="group" aria-label="${esc(t('pricing.addonsLabel'))}">
            ${catalog.addons.map((a) => {
              const free = a.pricingType === 'free';
              return `
                <label class="pb-addon${free ? ' is-free' : ''}">
                  <input type="checkbox" value="${esc(a.slug)}"${free ? ' checked disabled' : state.addons.includes(a.slug) ? ' checked' : ''}>
                  <span class="pb-check" aria-hidden="true">${icon('check')}</span>
                  <span class="pb-addon-icon">${icon(iconFor(a))}</span>
                  <span class="pb-addon-text"><strong>${esc(c.nameOf(a))}</strong><small>${esc(c.descOf(a))}</small></span>
                  ${addonPrice(a)}
                </label>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="pb-total" aria-live="polite">
        <div class="pb-eq">
          <span class="pb-eq-part"><small>${esc(t('pricing.eqBase'))}</small><strong data-pb="base"></strong></span>
          <span class="pb-eq-op" aria-hidden="true">${icon('plus')}</span>
          <span class="pb-eq-part"><small>${esc(t('pricing.eqAddons'))}</small><strong data-pb="addons"></strong></span>
          <span class="pb-eq-op" aria-hidden="true">${icon('equals')}</span>
          <span class="pb-eq-part is-total"><small>${esc(t('pricing.totalLabel'))}</small><strong data-pb="total"></strong></span>
        </div>
        <div class="pb-cta">
          <a class="btn btn-primary" data-pb="start" href="order-form.html">${esc(t('pricing.startThis'))}${icon('arrow', 'btn-glyph flip-rtl')}</a>
          <small data-pb="note"></small>
        </div>
      </div>`;

    const update = () => {
      const base = catalog.getOrderable(state.base) || bases[0];
      const extras = state.addons.map((slug) => catalog.getAddon(slug)).filter((a) => a && a.pricingType !== 'free');
      const addonsTotal = extras.reduce((sum, a) => sum + a.price, 0);
      const hasFrom = extras.some((a) => a.pricingType === 'from');
      const q = (k) => root.querySelector(`[data-pb="${k}"]`);
      q('base').textContent = `${c.nameOf(base)} · ${money(base.price)}`;
      q('addons').textContent = extras.length ? `${money(addonsTotal, { plus: true })} (${extras.length})` : money(0);
      q('total').textContent = money(base.price + addonsTotal);
      q('note').textContent = hasFrom ? t('order.fromNote') : t('pricing.exactNote');
      const addonParam = extras.map((a) => a.slug).join(',');
      q('start').setAttribute('href', `order-form.html?product=${encodeURIComponent(base.slug)}${addonParam ? `&addons=${encodeURIComponent(addonParam)}` : ''}`);
      root.querySelectorAll('.pb-option').forEach((el) => el.classList.toggle('is-selected', el.querySelector('input').checked));
      root.querySelectorAll('.pb-addon').forEach((el) => el.classList.toggle('is-selected', el.querySelector('input').checked));
    };

    if (!root.pbBound) {
      root.pbBound = true;
      root.addEventListener('change', (event) => {
        const input = event.target;
        if (input.name === 'pb-base') state.base = input.value;
        else if (input.type === 'checkbox' && !input.disabled) {
          state.addons = input.checked ? [...new Set([...state.addons, input.value])] : state.addons.filter((s) => s !== input.value);
        }
        root.pbUpdate();
      });
    }
    root.pbUpdate = update;
    update();
  };

  // Fills <span data-addon-price="slug"> placeholders inside translated copy with live catalog prices.
  const fillAddonPrices = (catalog, root = document) => {
    root.querySelectorAll('[data-addon-price]').forEach((el) => {
      const addon = catalog.getAddon(el.getAttribute('data-addon-price'));
      if (!addon) { el.textContent = ''; return; }
      const value = addon.pricingType === 'free'
        ? t('common.free')
        : `${addon.pricingType === 'from' ? `${t('common.fromShort')} ` : ''}${money(addon.price, { plus: true })}`;
      el.textContent = ` (${value})`;
    });
  };

  return {
    showNotification, productCard, bundleCard, renderCards, tierBadge, esc, icon, iconFor,
    occasionKey, occasionLabel, demoEntries, demoTile, demoFilters, renderWeddingBoard, designCard,
    priceBuilder, fillAddonPrices, orderHref, productHref,
  };
})();

// ── Navigation Module ── //
const Nav = (() => {
  const init = () => {
    const toggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navbar = document.getElementById('navbar');

    if (toggle && navLinks) {
      const setOpen = (open) => {
        navLinks.classList.toggle('active', open);
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('nav-open', open);
      };
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('active')));
      navLinks.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navLinks.classList.contains('active')) { setOpen(false); toggle.focus(); }
      });
      document.addEventListener('click', (event) => {
        if (navLinks.classList.contains('active') && !event.target.closest('#nav-links, #nav-toggle')) setOpen(false);
      });
      window.addEventListener('resize', () => { if (window.innerWidth > 1024 && navLinks.classList.contains('active')) setOpen(false); }, { passive: true });
    }

    if (navbar) {
      const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  };

  // Highlights the nav link of the section in the middle of the viewport (sections carry data-spy="<nav key>").
  const initScrollSpy = () => {
    const links = [...document.querySelectorAll('[data-nav]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;
    const setActive = (key) => links.forEach((l) => {
      const active = !!key && l.getAttribute('data-nav') === key;
      l.classList.toggle('is-active', active);
      if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.getAttribute('data-spy')); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
  };

  return { init, initScrollSpy };
})();

// ── Animations Module ── //
const Animations = (() => {
  let observer;
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initScrollAnimations = () => {
    if (!('IntersectionObserver' in window) || reducedMotion()) {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => el.classList.add('visible'));
      return;
    }
    observer = observer || new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach((el) => observer.observe(el));
  };

  const initParticles = () => {
    const container = document.getElementById('hero-particles');
    if (!container || reducedMotion()) return;
    const particleCount = window.innerWidth > 768 ? 40 : 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (6 + Math.random() * 6) + 's';
      particle.style.width = (2 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  };

  // Smooth in-page scrolling for every "#section" link, including links rendered after the catalog loads.
  const initSmoothScroll = () => {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      let target = null;
      try { target = document.querySelector(href); } catch (err) { return; }
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', href);
    });
  };

  return { initScrollAnimations, initParticles, initSmoothScroll, reducedMotion };
})();

// ── Backwards-compatible helper ── //
function initScrollAnimations() {
  Animations.initScrollAnimations();
}

// ── Initialize ── //
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  Nav.initScrollSpy();
  Animations.initParticles();
  Animations.initScrollAnimations();
  Animations.initSmoothScroll();
});
