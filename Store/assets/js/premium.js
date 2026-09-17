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
  const orderHref = (item) => (item.type === 'custom' ? 'custom-order.html' : `order-form.html?product=${encodeURIComponent(item.slug)}`);

  const tierBadge = (item) => {
    if (item.tier === 'Premium') return `<span class="badge badge-gold">${esc(t('common.badge.premium'))}</span>`;
    if (item.tier === 'Standard') return `<span class="badge badge-rose">${esc(t('common.badge.standard'))}</span>`;
    if (item.kind === 'bundle') return `<span class="badge badge-emerald">${esc(t('common.badge.bundle'))}</span>`;
    if (item.type === 'custom') return `<span class="badge badge-primary">${esc(t('common.badge.custom'))}</span>`;
    return '';
  };

  /* Wedding (hero category): large card, Premium visually elevated, designs shown with real artwork. */
  const weddingCard = (item, index = 0) => {
    const c = C();
    const premium = item.tier === 'Premium';
    const features = c.featuresOf(item).slice(0, 3);
    const designs = item.designs || [];
    return `
      <article class="card wedding-card animate-on-scroll${premium ? ' is-premium' : ''}" data-slug="${esc(item.slug)}" style="animation-delay:${index * 80}ms">
        ${premium ? `<span class="wedding-ribbon">${esc(t('common.mostPremium'))}</span>` : ''}
        <a class="card-image wedding-image" href="${productHref(item)}" aria-label="${esc(c.nameOf(item))}">${c.imageMarkup(item)}</a>
        <div class="card-content">
          <div class="wedding-head">
            <div>
              <span class="tier-label">${esc(premium ? t('common.badge.premium') : t('common.badge.standard'))}</span>
              <h3 class="card-title"><a href="${productHref(item)}">${esc(c.nameOf(item))}</a></h3>
            </div>
            <div class="wedding-price"><span class="card-price">${esc(c.priceLabel(item))}</span><span class="card-price-label">${esc(t('common.oneTime'))}</span></div>
          </div>
          <p class="card-description">${esc(c.descOf(item))}</p>
          ${designs.length ? `
            <div class="design-strip">
              <span class="design-strip-label">${esc(t('common.designsAvailable'))}</span>
              <div class="design-strip-items">
                ${designs.map((d) => `<a class="design-thumb" href="${esc(d.demo_url || productHref(item))}" ${d.demo_url ? 'target="_blank" rel="noopener noreferrer"' : ''} title="${esc(d.name)}">
                  ${d.image_url ? `<img src="${esc(d.image_url)}" alt="${esc(d.name)}" loading="lazy">` : `<span class="design-thumb-empty">${icon('wedding')}</span>`}
                  <span class="design-thumb-name">${esc(d.name)}${d.demo_url ? ' ↗' : ''}</span>
                </a>`).join('')}
              </div>
            </div>` : ''}
          ${features.length ? `<ul class="feature-list">${features.map((f) => `<li>${icon('check', 'feature-check')}<span>${esc(f)}</span></li>`).join('')}</ul>` : ''}
          <div class="card-actions">
            <a href="${productHref(item)}" class="btn btn-outline btn-sm">${esc(t('common.viewInvitation'))}</a>
            <a href="${orderHref(item)}" class="btn btn-primary btn-sm">${esc(t('common.orderNow'))}</a>
          </div>
        </div>
      </article>`;
  };

  /* Other occasions: compact, scannable cards — what it is, one line, price, one CTA. */
  const productCard = (item, index = 0) => {
    const c = C();
    const isCustom = item.type === 'custom';
    return `
      <article class="card occasion-card animate-on-scroll" data-slug="${esc(item.slug)}" style="animation-delay:${index * 50}ms">
        <a class="card-image occasion-image" href="${productHref(item)}" aria-label="${esc(c.nameOf(item))}">
          ${c.imageMarkup(item)}
          ${c.badgeMarkup(item)}
        </a>
        <div class="card-content">
          <h3 class="card-title"><a href="${productHref(item)}">${esc(c.nameOf(item))}</a></h3>
          <p class="card-description">${esc(c.descOf(item))}</p>
          <div class="card-foot">
            <div class="card-price">${esc(c.priceLabel(item))}</div>
            <a href="${productHref(item)}" class="btn btn-primary btn-sm">${esc(isCustom ? t('common.requestQuote') : t('common.viewInvitation'))}</a>
          </div>
        </div>
      </article>`;
  };

  /* Bundles: value first — included products with real artwork where it exists, compare price, savings. */
  const bundleCard = (bundle, index = 0) => {
    const c = C();
    const items = bundle.items || [];
    return `
      <article class="card bundle-card animate-on-scroll${bundle.badge === 'best-value' ? ' is-best' : ''}" data-slug="${esc(bundle.slug)}" style="animation-delay:${index * 60}ms">
        <a class="card-image bundle-image" href="${productHref(bundle)}" aria-label="${esc(c.nameOf(bundle))}">
          ${c.imageMarkup(bundle)}
          ${bundle.badge === 'best-value' ? `<span class="card-badge premium">${esc(t('common.badge.bestValue'))}</span>` : ''}
        </a>
        <div class="card-content">
          <h3 class="card-title"><a href="${productHref(bundle)}">${esc(c.nameOf(bundle))}</a></h3>
          <ul class="bundle-includes">
            ${items.map((p) => `<li>${icon(iconFor(p), 'bundle-item-icon')}<span>${esc(c.nameOf(p))}</span><em>${esc(money(p.price))}</em></li>`).join('')}
          </ul>
          <div class="bundle-pricing">
            <div class="bundle-compare-price">${bundle.compareTotal > bundle.price ? `<s>${esc(money(bundle.compareTotal))}</s>` : ''}<strong class="bundle-price">${esc(money(bundle.price))}</strong></div>
            ${bundle.savings > 0 ? `<span class="save-pill">${icon('tag', 'save-icon')}${esc(t('common.save'))} ${esc(money(bundle.savings))}</span>` : ''}
          </div>
          <div class="card-actions">
            <a href="${productHref(bundle)}" class="btn btn-outline btn-sm">${esc(t('common.viewBundle'))}</a>
            <a href="${orderHref(bundle)}" class="btn btn-primary btn-sm">${esc(t('common.orderNow'))}</a>
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

  const priceRow = (name, value, extra = '') => `<li class="price-row">${extra}<span class="price-name">${esc(name)}</span><span class="price-dots" aria-hidden="true"></span><span class="price-value">${value}</span></li>`;

  const addonValue = (addon) => {
    if (addon.pricingType === 'free') return `<span class="price-pill free">${esc(t('common.free'))}</span>`;
    if (addon.pricingType === 'from') return `<span class="price-pill from">${esc(t('common.from'))} ${esc(money(addon.price, { plus: true }))}</span>`;
    return `<span class="price-pill">${esc(money(addon.price, { plus: true }))}</span>`;
  };

  const renderPriceList = (catalog, baseContainer, addonsContainer) => {
    const c = C();
    if (baseContainer) {
      const groups = catalog.categories
        .filter((cat) => cat.slug !== 'bundles' && cat.slug !== 'custom')
        .map((cat) => ({ cat, items: catalog.productsIn(cat.slug) }))
        .filter((g) => g.items.length);
      const bundles = catalog.bundles;
      const custom = catalog.customProduct();
      baseContainer.innerHTML = `
        ${groups.map((g) => `<h4 class="price-group">${esc(c.nameOf(g.cat))}</h4><ul class="price-rows">${g.items.map((p) => priceRow(c.nameOf(p), esc(money(p.price)))).join('')}</ul>`).join('')}
        ${bundles.length ? `<h4 class="price-group">${esc(t('sections.bundlesTitle'))}</h4><ul class="price-rows">${bundles.map((b) => priceRow(c.nameOf(b), `${b.compareTotal > b.price ? `<s class="price-compare">${esc(money(b.compareTotal))}</s> ` : ''}${esc(money(b.price))}`)).join('')}</ul>` : ''}
        ${custom ? `<h4 class="price-group">${esc(t('sections.customTitle'))}</h4><ul class="price-rows">${priceRow(c.nameOf(custom), `<span class="price-pill from">${esc(c.priceLabel(custom))}</span>`)}</ul>` : ''}`;
    }
    if (addonsContainer) {
      addonsContainer.innerHTML = `<ul class="price-rows">${catalog.addons.map((a) => priceRow(c.nameOf(a), addonValue(a), `<span class="price-icon">${icon(iconFor(a))}</span>`)).join('')}</ul>`;
    }
  };

  return { showNotification, productCard, weddingCard, bundleCard, renderCards, renderPriceList, tierBadge, esc, icon, iconFor };
})();

// ── Navigation Module ── //
const Nav = (() => {
  const init = () => {
    const toggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navbar = document.getElementById('navbar');

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggle.classList.toggle('active');
      });
      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          toggle.classList.remove('active');
        });
      });
    }

    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });
    }
  };

  return { init };
})();

// ── Animations Module ── //
const Animations = (() => {
  let observer;

  const initScrollAnimations = () => {
    if (!('IntersectionObserver' in window)) {
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach((el) => observer.observe(el));
  };

  const initParticles = () => {
    const container = document.getElementById('hero-particles');
    if (!container) return;
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

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  };

  return { initScrollAnimations, initParticles, initSmoothScroll };
})();

// ── Backwards-compatible helper ── //
function initScrollAnimations() {
  Animations.initScrollAnimations();
}

// ── Initialize ── //
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  Animations.initParticles();
  Animations.initScrollAnimations();
  Animations.initSmoothScroll();
});
