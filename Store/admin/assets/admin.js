const MemoraAdmin = (() => {
  const cfg = window.MEMORA_SUPABASE || {};
  const configured = cfg.url && !cfg.url.includes('YOUR_') && cfg.anonKey && !cfg.anonKey.includes('YOUR_');
  const client = configured ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  const bucket = cfg.storageBucket || 'memora-assets';
  const pageSize = 8;
  const TABLES = ['categories', 'products', 'bundles', 'addons', 'orders', 'coupons'];

  const state = {
    session: null,
    view: 'dashboard',
    search: '',
    sort: {},
    page: {},
    orderFilter: { status: 'all', type: 'all' },
    data: { categories: [], products: [], bundles: [], addons: [], orders: [], coupons: [], settings: {} }
  };

  /* Local sample data (only used when Supabase is not configured). Mirrors the storefront seed. */
  const seed = window.MemoraCatalog ? window.MemoraCatalog.seed : { categories: [], products: [], bundles: [], addons: [] };
  const defaults = {
    categories: seed.categories.map((c, i) => ({ id: `cat-${i}`, is_active: true, ...c })),
    products: seed.products.map((p, i) => ({ id: `prod-${i}`, is_active: true, featured: !!p.featured, ...p })),
    bundles: seed.bundles.map((b, i) => ({
      id: `bundle-${i}`, is_active: true, ...b,
      included_product_ids: (b.included_slugs || []).map((slug) => `prod-${seed.products.findIndex((p) => p.slug === slug)}`)
    })),
    addons: seed.addons.map((a, i) => ({ id: `addon-${i}`, is_active: true, ...a })),
    orders: [],
    coupons: [{ id: 'welcome10', coupon_code: 'WELCOME10', discount_percent: 10, expiration_date: '', maximum_uses: 100, current_uses: 0, status: 'Active' }],
    settings: {
      store_name: 'Memora',
      whatsapp_number: '+201099885633',
      business_email: 'support@memora.com',
      footer_text: 'Premium digital invitations for weddings and every moment worth celebrating.',
      seo_title: 'Memora - Premium Digital Invitations',
      seo_description: 'Premium digital invitation websites for weddings, engagements, henna nights and more.'
    }
  };

  /*
    Field types: text, textarea, number, url, email, date, checkbox, file,
    select:a|b|c, select-categories, product-picker, lines (text[] one per line), designs (Name | Demo URL | Image URL), addon-picker
  */
  const schemas = {
    categories: [
      ['name', 'Name (English)', 'text', true], ['name_ar', 'Name (Arabic)', 'text'],
      ['slug', 'Slug (unique, e.g. wedding)', 'text', true],
      ['description', 'Description (English)', 'textarea'], ['description_ar', 'Description (Arabic)', 'textarea'],
      ['sort_order', 'Sort Order', 'number'], ['is_active', 'Active', 'checkbox']
    ],
    products: [
      ['title', 'Name (English)', 'text', true], ['name_ar', 'Name (Arabic)', 'text'],
      ['slug', 'Slug (unique, auto from name)', 'text'],
      ['product_type', 'Type', 'select:product|custom'], ['category_slug', 'Category', 'select-categories'],
      ['tier', 'Tier (Wedding only)', 'select:|Standard|Premium'], ['event_type', 'Event Type', 'select:|wedding|engagement|henna|gender-reveal|birthday|date|bachelorette|custom'],
      ['price', 'Price (EGP)', 'number', true], ['pricing_type', 'Pricing', 'select:fixed|from'],
      ['description', 'Description (English)', 'textarea'], ['description_ar', 'Description (Arabic)', 'textarea'],
      ['features', 'Features (English, one per line)', 'lines'], ['features_ar', 'Features (Arabic, one per line)', 'lines'],
      ['designs', 'Designs (one per line: Name | Demo URL | Image URL)', 'designs'],
      ['included_addons', 'Add-ons included in the base price', 'addon-picker'],
      ['thumbnail_url', 'Thumbnail URL', 'text'], ['thumbnail_file', 'Upload Thumbnail', 'file'],
      ['live_demo_url', 'Live Demo URL', 'url'], ['icon', 'Icon (emoji when no image)', 'text'],
      ['badge', 'Badge', 'select:|bestseller|new|premium|best-value'], ['sort_order', 'Sort Order', 'number'],
      ['featured', 'Featured', 'checkbox'], ['is_active', 'Active', 'checkbox']
    ],
    bundles: [
      ['bundle_name', 'Name (English)', 'text', true], ['name_ar', 'Name (Arabic)', 'text'],
      ['slug', 'Slug (unique, auto from name)', 'text'],
      ['included_product_ids', 'Included Products', 'product-picker'],
      ['bundle_price', 'Bundle Price (EGP)', 'number', true],
      ['description', 'Description (English)', 'textarea'], ['description_ar', 'Description (Arabic)', 'textarea'],
      ['thumbnail_url', 'Thumbnail URL', 'text'], ['thumbnail_file', 'Upload Thumbnail', 'file'],
      ['icon', 'Icon (emoji when no image)', 'text'], ['badge', 'Badge', 'select:|best-value|new|bestseller'],
      ['sort_order', 'Sort Order', 'number'], ['featured', 'Featured', 'checkbox'], ['is_active', 'Active', 'checkbox']
    ],
    addons: [
      ['name', 'Name (English)', 'text', true], ['name_ar', 'Name (Arabic)', 'text'],
      ['slug', 'Slug (unique, auto from name)', 'text'],
      ['price', 'Price (EGP)', 'number'], ['pricing_type', 'Pricing', 'select:free|fixed|from'],
      ['description', 'Description (English)', 'textarea'], ['description_ar', 'Description (Arabic)', 'textarea'],
      ['icon', 'Icon (emoji)', 'text'], ['sort_order', 'Sort Order', 'number'], ['is_active', 'Active', 'checkbox']
    ],
    orders: [
      ['order_type', 'Order Type', 'select:standard|custom'],
      ['customer_name', 'Customer Name', 'text', true],
      ['email', 'Email', 'email'],
      ['phone_number', 'WhatsApp / Phone', 'text', true],
      ['preferred_language', 'Language', 'text'],
      ['purchased_product', 'Product', 'text'],
      ['product_category', 'Category', 'text'],
      ['selected_design', 'Design', 'text'],
      ['event_type', 'Event Type', 'text'],
      ['event_names', 'Names', 'text'],
      ['event_date', 'Event Date', 'date'],
      ['venue', 'Venue', 'text'],
      ['color_preference', 'Colour Preference', 'text'],
      ['music_link', 'Music Link', 'url'],
      ['special_requests', 'Special Requests / Request Summary', 'textarea'],
      ['admin_notes', 'Admin Notes (internal)', 'textarea'],
      ['base_price', 'Base Price', 'number'],
      ['addons_total', 'Add-ons Total', 'number'],
      ['quoted_price', 'Quoted Price (custom orders)', 'number'],
      ['total_amount', 'Total Amount', 'number'],
      ['payment_method', 'Payment Method', 'select:instapay|bank|cash'],
      ['payment_status', 'Payment Status', 'select:Pending|Paid'],
      ['order_status', 'Order Status', 'select:Pending|In Progress|Completed|Cancelled']
    ],
    coupons: [
      ['coupon_code', 'Coupon Code', 'text', true], ['discount_percent', 'Discount %', 'number', true],
      ['expiration_date', 'Expiration Date', 'date'], ['maximum_uses', 'Maximum Uses', 'number'], ['current_uses', 'Current Uses', 'number'],
      ['status', 'Status', 'select:Active|Paused|Expired']
    ],
    settings: [
      ['store_name', 'Store Name', 'text'], ['logo_url', 'Logo URL', 'url'], ['logo_file', 'Upload Logo', 'file'],
      ['hero_banner_url', 'Hero Banner URL', 'url'], ['hero_banner_file', 'Upload Hero Banner', 'file'],
      ['whatsapp_number', 'WhatsApp Number', 'text'], ['business_email', 'Business Email', 'email'],
      ['instagram', 'Instagram', 'url'], ['facebook', 'Facebook', 'url'], ['tiktok', 'TikTok', 'url'],
      ['footer_text', 'Footer Text', 'textarea'], ['seo_title', 'SEO Title', 'text'], ['seo_description', 'SEO Description', 'textarea']
    ]
  };

  const singular = { categories: 'category', products: 'product', bundles: 'bundle', addons: 'add-on', orders: 'order', coupons: 'coupon' };

  /* ── Utilities ── */
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function toast(message, type = 'success') {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function money(value) {
    return `EGP ${Number(value || 0).toLocaleString()}`;
  }

  function slugify(value) {
    return String(value || '').toLowerCase().replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  // Store paths are relative to the Store root ("images/x.png"); the admin lives one level deeper.
  function assetUrl(value) {
    if (!value) return '';
    return /^(https?:)?\/\//.test(value) || value.startsWith('data:') ? value : `../${value.replace(/^\.\.\//, '')}`;
  }

  function getText(row) {
    return Object.values(row || {}).flat().map((v) => (typeof v === 'object' ? JSON.stringify(v) : v)).join(' ').toLowerCase();
  }

  function matchSearch(items) {
    const q = state.search.trim().toLowerCase();
    return q ? items.filter((item) => getText(item).includes(q)) : items;
  }

  function productName(id) {
    const p = state.data.products.find((x) => String(x.id) === String(id));
    return p ? p.title : '';
  }

  /* ── Auth ── */
  async function initLogin() {
    if (!configured) toast('Add Supabase URL and anon key in admin/assets/supabase-config.js', 'error');
    if (client) {
      const { data } = await client.auth.getSession();
      if (data.session) location.href = 'dashboard.html';
    }
    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!client) return toast('Supabase is not configured yet.', 'error');
      const button = event.currentTarget.querySelector('button[type="submit"]');
      button.disabled = true;
      const form = new FormData(event.currentTarget);
      const { error } = await client.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
      button.disabled = false;
      if (error) return toast(error.message, 'error');
      location.href = 'dashboard.html';
    });
  }

  async function requireSession() {
    if (!client) {
      toast('Supabase config is missing. Showing local sample data.', 'error');
      return null;
    }
    const { data } = await client.auth.getSession();
    if (!data.session) {
      location.href = 'index.html';
      return null;
    }
    state.session = data.session;
    document.getElementById('admin-email').textContent = data.session.user.email || 'Admin';
    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') location.href = 'index.html';
    });
    return data.session;
  }

  async function initDashboard() {
    await requireSession();
    bindShell();
    await loadAll();
    render();
    document.getElementById('loading-state').classList.add('hidden');
  }

  function bindShell() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeSidebar = () => { sidebar.classList.remove('open'); if (backdrop) backdrop.classList.remove('show'); };
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        state.view = button.dataset.view;
        state.search = '';
        document.getElementById('global-search').value = '';
        document.querySelectorAll('[data-view]').forEach((el) => el.classList.toggle('active', el.dataset.view === state.view));
        closeSidebar();
        render();
      });
    });
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('show', sidebar.classList.contains('open'));
    });
    if (backdrop) backdrop.addEventListener('click', closeSidebar);
    document.getElementById('global-search').addEventListener('input', (event) => {
      state.search = event.target.value;
      state.page = {};
      render();
    });
    document.getElementById('logout-btn').addEventListener('click', async () => {
      if (client) await client.auth.signOut();
      location.href = 'index.html';
    });
    const editor = document.getElementById('editor-dialog');
    document.getElementById('editor-form').addEventListener('submit', (event) => {
      // Save button and Enter both submit; the handler set by openEditor() persists the record.
      event.preventDefault();
      if (typeof state.currentSave === 'function') state.currentSave();
    });
    editor.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => editor.close()));
  }

  /* ── Data ── */
  async function loadAll() {
    if (!client || !state.session) {
      state.data = JSON.parse(JSON.stringify(defaults));
      return;
    }
    await Promise.all(TABLES.map(loadTable));
    const { data } = await client.from('settings').select('*').limit(1).maybeSingle();
    state.data.settings = data || defaults.settings;
  }

  async function loadTable(table) {
    const orderBy = ['orders', 'coupons'].includes(table) ? { column: 'created_at', ascending: false } : { column: 'sort_order', ascending: true };
    let { data, error } = await client.from(table).select('*').order(orderBy.column, { ascending: orderBy.ascending });
    if (error && orderBy.column === 'sort_order') {
      ({ data, error } = await client.from(table).select('*').order('created_at', { ascending: false }));
    }
    if (error) {
      state.data[table] = [];
      const missing = /schema cache|does not exist/i.test(error.message);
      toast(missing ? `Table "${table}" is missing. Run admin/MIGRATION_CATALOG_V2.sql in Supabase.` : `Could not load ${table}: ${error.message}`, 'error');
      return;
    }
    state.data[table] = data || [];
  }

  /* ── Views ── */
  const titles = { dashboard: 'Dashboard', products: 'Products', bundles: 'Bundles', categories: 'Categories', addons: 'Add-ons', orders: 'Orders', coupons: 'Coupons', analytics: 'Analytics', settings: 'Settings' };

  function render() {
    document.getElementById('view-title').textContent = titles[state.view] || 'Dashboard';
    const root = document.getElementById('view-root');
    root.innerHTML = '';
    if (state.view === 'dashboard') root.appendChild(dashboardView());
    else if (state.view === 'analytics') root.appendChild(analyticsView());
    else if (state.view === 'settings') root.appendChild(settingsView());
    else if (TABLES.includes(state.view)) root.appendChild(tableView(state.view));
  }

  function dashboardView() {
    const wrap = document.createElement('div');
    const orders = state.data.orders;
    const paidRevenue = orders.filter((o) => o.payment_status === 'Paid').reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const customPending = orders.filter((o) => o.order_type === 'custom' && !Number(o.quoted_price)).length;
    wrap.innerHTML = `
      <div class="stats-grid">
        ${stat('Active Products', state.data.products.filter((p) => p.is_active !== false).length)}
        ${stat('Active Bundles', state.data.bundles.filter((b) => b.is_active !== false).length)}
        ${stat('Total Orders', orders.length)}
        ${stat('Confirmed Revenue', money(paidRevenue))}
        ${stat('Pending Payment', orders.filter((o) => o.payment_status === 'Pending').length)}
        ${stat('Custom Requests to Quote', customPending)}
      </div>
      <div class="grid-2">
        <section class="content-card"><div class="card-head"><div><h2>Revenue Overview</h2><p>Paid orders only</p></div></div><canvas class="chart" id="sales-chart"></canvas></section>
        <section class="content-card"><div class="card-head"><div><h2>Order Volume</h2><p>Monthly orders</p></div></div><canvas class="chart" id="orders-chart"></canvas></section>
        <section class="content-card"><div class="card-head"><div><h2>Recent Orders</h2><p>Latest customer orders</p></div></div><div class="mini-list">${miniOrders().join('') || '<p class="muted">No orders yet.</p>'}</div></section>
        <section class="content-card"><div class="card-head"><div><h2>Latest Customers</h2><p>Most recent leads</p></div></div><div class="mini-list">${latestCustomers().join('') || '<p class="muted">No customers yet.</p>'}</div></section>
      </div>`;
    requestAnimationFrame(() => {
      drawBars('sales-chart', monthlyValues('total_amount'), varColor('--gold'));
      drawBars('orders-chart', monthlyValues('count'), varColor('--rose'));
    });
    return wrap;
  }

  function stat(label, value) {
    return `<section class="stat-card"><span class="muted">${esc(label)}</span><strong>${esc(value)}</strong></section>`;
  }

  function miniOrders() {
    return state.data.orders.slice(0, 5).map((o) => `<div class="mini-item"><strong>${esc(o.customer_name || 'Customer')}</strong><span>${o.order_type === 'custom' ? '✨ Custom' : esc(o.purchased_product || 'Order')} • ${esc(o.payment_status || 'Pending')}</span></div>`);
  }

  function latestCustomers() {
    return state.data.orders.slice(0, 5).map((o) => `<div class="mini-item"><strong>${esc(o.customer_name || 'Customer')}</strong><span>${esc(o.email || o.phone_number || '')}</span></div>`);
  }

  function analyticsView() {
    const orders = state.data.orders;
    const paidOrders = orders.filter((o) => o.payment_status === 'Paid');
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="stats-grid">
        ${stat('Total Revenue', money(revenue))}
        ${stat('Paid Orders', paidOrders.length)}
        ${stat('Pending Orders', orders.filter((o) => o.payment_status === 'Pending').length)}
        ${stat('Completed Orders', orders.filter((o) => o.order_status === 'Completed').length)}
        ${stat('Custom Requests', orders.filter((o) => o.order_type === 'custom').length)}
        ${stat('Avg Order Value', money(paidOrders.length > 0 ? revenue / paidOrders.length : 0))}
      </div>
      <div class="grid-3">
        <section class="content-card"><div class="card-head"><h2>Monthly Revenue</h2></div><canvas class="chart" id="analytics-revenue"></canvas></section>
        <section class="content-card"><div class="card-head"><h2>Top Products</h2></div><div class="mini-list">${leaderboard('purchased_product').join('') || '<p class="muted">No data yet.</p>'}</div></section>
        <section class="content-card"><div class="card-head"><h2>Top Add-ons</h2></div><div class="mini-list">${addonLeaderboard().join('') || '<p class="muted">No add-ons ordered yet.</p>'}</div></section>
      </div>`;
    requestAnimationFrame(() => drawBars('analytics-revenue', monthlyValues('total_amount'), varColor('--gold')));
    return wrap;
  }

  function leaderboard(field) {
    const counts = {};
    state.data.orders.forEach((order) => { if (order[field]) counts[order[field]] = (counts[order[field]] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => `<div class="mini-item"><strong>${esc(name)}</strong><span>${count} orders</span></div>`);
  }

  function addonLeaderboard() {
    const counts = {};
    state.data.orders.forEach((order) => (order.selected_addons || []).forEach((slug) => { counts[slug] = (counts[slug] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([slug, count]) => {
      const addon = state.data.addons.find((a) => a.slug === slug);
      return `<div class="mini-item"><strong>${esc(addon ? addon.name : slug)}</strong><span>${count} orders</span></div>`;
    });
  }

  function monthlyValues(type) {
    const months = Array.from({ length: 12 }, () => 0);
    const year = new Date().getFullYear();
    state.data.orders.forEach((order) => {
      if (type !== 'count' && order.payment_status !== 'Paid') return;
      const date = new Date(order.created_at || Date.now());
      if (date.getFullYear() !== year) return;
      months[date.getMonth()] += type === 'count' ? 1 : Number(order.total_amount || 0);
    });
    return months;
  }

  /* ── Tables ── */
  function filteredRows(table) {
    let rows = matchSearch(state.data[table]);
    if (table === 'orders') {
      const { status, type } = state.orderFilter;
      if (type !== 'all') rows = rows.filter((o) => (o.order_type || 'standard') === type);
      if (status === 'pending') rows = rows.filter((o) => o.payment_status !== 'Paid' && o.order_status !== 'Cancelled');
      if (status === 'paid') rows = rows.filter((o) => o.payment_status === 'Paid');
      if (status === 'completed') rows = rows.filter((o) => o.order_status === 'Completed');
      if (status === 'cancelled') rows = rows.filter((o) => o.order_status === 'Cancelled');
    }
    return rows;
  }

  function tableView(table) {
    const all = filteredRows(table);
    const rows = paginate(sortRows(all, table), table);
    const wrap = document.createElement('section');
    wrap.className = 'content-card';
    const hint = {
      products: 'Products shown in the store. Wedding products use Designs for their templates; set Type = custom for the Custom Invitation offer.',
      bundles: 'Pick the included products; the store shows the individual total and the savings automatically.',
      categories: 'Store sections. Slugs wedding / moments / bundles / custom drive the home page layout.',
      addons: 'Optional extras customers pick in the order form. Pricing: free, fixed or "starting from".',
      orders: 'Standard orders come from checkout; custom requests come from the Custom Invitation form.',
      coupons: 'Coupon codes (not yet applied at checkout).'
    }[table] || 'Manage, search, and update records.';
    wrap.innerHTML = `
      <div class="toolbar">
        <div><h2>${esc(titles[table])}</h2><p class="muted">${esc(hint)}</p></div>
        <div class="toolbar-actions">
          <button class="btn primary" data-create="${table}">Create ${esc(singular[table])}</button>
        </div>
      </div>
      ${table === 'orders' ? ordersFilterUI() : ''}
      <div class="table-wrap">${rows.length ? tableMarkup(table, rows) : `<p class="muted empty">No ${table} found.</p>`}</div>
      ${pagerMarkup(table, all.length)}
    `;
    wrap.querySelector('[data-create]').addEventListener('click', () => openEditor(table));
    bindTableActions(wrap, table);
    return wrap;
  }

  function ordersFilterUI() {
    const chip = (group, value, label) => `<button class="btn ghost ${state.orderFilter[group] === value ? 'active' : ''}" data-order-filter="${group}" data-value="${value}">${label}</button>`;
    return `
      <div class="filter-chips">
        <div class="chip-group">${chip('type', 'all', 'All types')}${chip('type', 'standard', 'Standard orders')}${chip('type', 'custom', '✨ Custom requests')}</div>
        <div class="chip-group">${chip('status', 'all', 'Any status')}${chip('status', 'pending', 'Pending payment')}${chip('status', 'paid', 'Paid')}${chip('status', 'completed', 'Completed')}${chip('status', 'cancelled', 'Cancelled')}</div>
      </div>`;
  }

  const columnMap = {
    categories: ['name', 'name_ar', 'slug', 'sort_order', 'is_active'],
    products: ['thumbnail_url', 'title', 'category_slug', 'product_type', 'price', 'featured', 'is_active'],
    bundles: ['bundle_name', 'included_product_ids', 'bundle_price', 'featured', 'is_active'],
    addons: ['icon', 'name', 'name_ar', 'pricing_type', 'price', 'is_active'],
    orders: ['customer_name', 'order_type', 'purchased_product', 'event_names', 'event_date', 'total_amount', 'payment_status', 'order_status'],
    coupons: ['coupon_code', 'discount_percent', 'maximum_uses', 'status']
  };

  function tableMarkup(table, rows) {
    const columns = columnMap[table];
    return `<table><thead><tr>${columns.map((c) => `<th data-sort="${c}">${label(c)}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((c) => `<td>${cell(row, c, table)}</td>`).join('')}<td><div class="row-actions">${table === 'orders' ? ordersActions(row) : standardActions(row, table)}</div></td></tr>`).join('')}</tbody></table>`;
  }

  function ordersActions(order) {
    return `
      <button class="btn ghost" data-action="view" data-id="${order.id}" title="View full details">👁️</button>
      <button class="btn ghost" data-action="edit" data-id="${order.id}" title="Edit order">✏️</button>
      ${order.payment_status === 'Pending' && order.order_type !== 'custom' ? `<button class="btn ghost" data-action="paid" data-id="${order.id}" title="Mark as Paid">💳</button>` : ''}
      ${order.order_type === 'custom' ? `<button class="btn ghost" data-action="quote" data-id="${order.id}" title="Set quoted price">💰</button>` : ''}
      <button class="btn ghost" data-action="whatsapp" data-id="${order.id}" title="Contact via WhatsApp">💬</button>
      <button class="btn danger" data-action="delete" data-id="${order.id}" title="Delete">🗑️</button>`;
  }

  function standardActions(row, table) {
    return `
      <button class="btn ghost" data-action="edit" data-id="${row.id}">Edit</button>
      <button class="btn danger" data-action="delete" data-id="${row.id}">Delete</button>`;
  }

  function cell(row, key, table) {
    const value = row[key];
    if (key === 'thumbnail_url') return value ? `<img class="thumb" src="${esc(assetUrl(value))}" alt="">` : `<span class="thumb thumb-empty">${esc(row.icon || '🖼️')}</span>`;
    if (key === 'included_product_ids') {
      const names = (value || []).map(productName).filter(Boolean);
      return esc(names.length ? names.join(' + ') : (row.included_products || []).join(' + '));
    }
    if (key === 'order_type') return value === 'custom' ? '<span class="pill info">Custom</span>' : '<span class="pill">Standard</span>';
    if (key === 'product_type') return value === 'custom' ? '<span class="pill info">Custom</span>' : 'Product';
    if (key === 'pricing_type') return value === 'free' ? '<span class="pill ok">Free</span>' : value === 'from' ? '<span class="pill warn">From</span>' : 'Fixed';
    if (Array.isArray(value)) return esc(value.join(', '));
    if (typeof value === 'boolean') return value ? '<span class="pill ok">Yes</span>' : '<span class="pill bad">No</span>';
    if (key === 'payment_status') return `<span class="pill ${value === 'Paid' ? 'ok' : 'warn'}">${esc(value || 'Pending')}</span>`;
    if (key === 'order_status') {
      const colors = { 'Pending': 'warn', 'In Progress': 'info', 'Completed': 'ok', 'Cancelled': 'bad' };
      return `<span class="pill ${colors[value] || 'warn'}">${esc(value || 'Pending')}</span>`;
    }
    if (key === 'total_amount' && table === 'orders' && row.order_type === 'custom') return Number(row.quoted_price) ? `${money(row.quoted_price)} <span class="cell-sub">quoted</span>` : `<span class="muted">from ${money(row.base_price || 800)}</span>`;
    if (key.includes('price') || key === 'total_amount') return money(value);
    if (key === 'purchased_product' && row.selected_design) return `<span class="cell-main">${esc(value)}</span><span class="cell-sub">${esc(row.selected_design)}</span>`;
    if (key === 'event_names' && !value && (row.bride_name || row.groom_name)) return esc([row.bride_name, row.groom_name].filter(Boolean).join(' & '));
    if (String(value || '').startsWith('http')) return `<a class="muted" href="${esc(value)}" target="_blank" rel="noopener noreferrer">Link</a>`;
    if ((key === 'wedding_date' || key === 'event_date') && value) return new Date(value).toLocaleDateString();
    if (key === 'event_date' && !value && row.wedding_date) return new Date(row.wedding_date).toLocaleDateString();
    const text = String(value ?? '');
    return esc(text.substring(0, 50)) + (text.length > 50 ? '...' : '');
  }

  function label(key) {
    const custom = { thumbnail_url: 'Image', category_slug: 'Category', product_type: 'Type', included_product_ids: 'Includes', event_names: 'Names', name_ar: 'Arabic', order_type: 'Type' };
    return custom[key] || key.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function bindTableActions(wrap, table) {
    wrap.querySelectorAll('[data-sort]').forEach((th) => th.addEventListener('click', () => {
      state.sort[table] = { key: th.dataset.sort, dir: state.sort[table]?.dir === 'asc' ? 'desc' : 'asc' };
      render();
    }));
    wrap.querySelectorAll('[data-page]').forEach((btn) => btn.addEventListener('click', () => {
      state.page[table] = Math.max(1, (state.page[table] || 1) + Number(btn.dataset.page));
      render();
    }));
    wrap.querySelectorAll('[data-order-filter]').forEach((btn) => btn.addEventListener('click', () => {
      state.orderFilter[btn.dataset.orderFilter] = btn.dataset.value;
      state.page.orders = 1;
      render();
    }));
    wrap.querySelectorAll('[data-action]').forEach((btn) => btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      const row = state.data[table].find((r) => String(r.id) === String(id));
      if (!row) return;
      if (action === 'edit') openEditor(table, row);
      if (action === 'delete') deleteRow(table, row);
      if (action === 'view') viewOrderDetails(row);
      if (action === 'paid') markAsPaid(row);
      if (action === 'quote') quoteOrder(row);
      if (action === 'whatsapp') openWhatsApp(row);
    }));
  }

  function sortRows(rows, table) {
    const sort = state.sort[table];
    if (!sort) return rows;
    return [...rows].sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, { numeric: true }) * (sort.dir === 'asc' ? 1 : -1));
  }

  function paginate(rows, table) {
    const page = state.page[table] || 1;
    return rows.slice((page - 1) * pageSize, page * pageSize);
  }

  function pagerMarkup(table, total) {
    const page = state.page[table] || 1;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return `<div class="pager"><span>${total} record${total === 1 ? '' : 's'}</span><button class="btn ghost" data-page="-1" ${page <= 1 ? 'disabled' : ''}>Prev</button><span>Page ${page} of ${pages}</span><button class="btn ghost" data-page="1" ${page >= pages ? 'disabled' : ''}>Next</button></div>`;
  }

  function settingsView() {
    const wrap = document.createElement('section');
    wrap.className = 'content-card';
    wrap.innerHTML = `<div class="card-head"><div><h2>Settings</h2><p>Store identity, social links, SEO, and contact defaults.</p></div><button class="btn primary" id="edit-settings">Edit Settings</button></div><div class="grid-2">${Object.entries(state.data.settings).filter(([k]) => !['id', 'updated_at', 'visitors'].includes(k)).map(([k, v]) => `<div class="mini-item"><strong>${esc(label(k))}</strong><span>${esc(v || '-')}</span></div>`).join('')}</div>`;
    wrap.querySelector('#edit-settings').addEventListener('click', () => openEditor('settings', state.data.settings));
    return wrap;
  }

  /* ── Editor ── */
  function openEditor(table, row = {}) {
    const dialog = document.getElementById('editor-dialog');
    document.getElementById('dialog-title').textContent = `${row.id ? 'Edit' : 'Create'} ${table === 'settings' ? 'Settings' : singular[table]}`;
    const fields = document.getElementById('dialog-fields');
    fields.innerHTML = schemas[table].map(([name, text, type, required]) => fieldMarkup(name, text, type, row[name], required, row)).join('');
    const saveBtn = document.getElementById('dialog-save');
    saveBtn.style.display = '';
    saveBtn.textContent = 'Save';
    state.currentSave = () => saveRecord(table, row);
    dialog.showModal();
  }

  function fieldMarkup(name, text, type, value, required, row) {
    const req = required ? 'required' : '';
    const full = ['textarea', 'file', 'lines', 'designs', 'product-picker', 'addon-picker'].includes(type) ? ' full' : '';
    if (type === 'textarea') return `<label class="full">${esc(text)}<textarea name="${name}" ${req}>${esc(value || '')}</textarea></label>`;
    if (type === 'lines') return `<label class="full">${esc(text)}<textarea name="${name}" rows="4">${esc((Array.isArray(value) ? value : []).join('\n'))}</textarea></label>`;
    if (type === 'designs') {
      const lines = (Array.isArray(value) ? value : []).map((d) => [d.name, d.demo_url || '', d.image_url || ''].join(' | ')).join('\n');
      return `<label class="full">${esc(text)}<textarea name="${name}" rows="3" placeholder="Luxury Bloom | https://demo.example.com | images/demo_luxury_bloom.png">${esc(lines)}</textarea></label>`;
    }
    if (type === 'checkbox') return `<label class="inline-check"><input type="checkbox" name="${name}" ${value === undefined ? (name === 'is_active' ? 'checked' : '') : (value ? 'checked' : '')}><span>${esc(text)}</span></label>`;
    if (type === 'file') return `<label class="full">${esc(text)}<input type="file" name="${name}" accept="image/*"></label>`;
    if (type.startsWith('select:')) {
      const options = type.replace('select:', '').split('|');
      return `<label>${esc(text)}<select name="${name}">${options.map((opt) => `<option value="${esc(opt)}" ${opt === String(value ?? '') ? 'selected' : ''}>${esc(opt || '—')}</option>`).join('')}</select></label>`;
    }
    if (type === 'select-categories') {
      const cats = state.data.categories.length ? state.data.categories : defaults.categories;
      return `<label>${esc(text)}<select name="${name}">${cats.map((c) => `<option value="${esc(c.slug)}" ${c.slug === value ? 'selected' : ''}>${esc(c.name)} (${esc(c.slug)})</option>`).join('')}</select></label>`;
    }
    if (type === 'product-picker') {
      const selected = new Set((value || []).map(String));
      const products = state.data.products.filter((p) => p.product_type !== 'custom' && (p.is_active !== false || selected.has(String(p.id))));
      return `<fieldset class="full picker"><legend>${esc(text)}</legend>${products.length ? products.map((p) => `<label class="inline-check"><input type="checkbox" name="${name}" value="${p.id}" ${selected.has(String(p.id)) ? 'checked' : ''}><span>${esc(p.title)} <em class="muted">${money(p.price)}${p.is_active === false ? ' · inactive' : ''}</em></span></label>`).join('') : '<p class="muted">Create products first.</p>'}</fieldset>`;
    }
    if (type === 'addon-picker') {
      const selected = new Set(value || []);
      const addons = state.data.addons.filter((a) => a.pricing_type !== 'free');
      return `<fieldset class="full picker"><legend>${esc(text)}</legend>${addons.length ? addons.map((a) => `<label class="inline-check"><input type="checkbox" name="${name}" value="${esc(a.slug)}" ${selected.has(a.slug) ? 'checked' : ''}><span>${esc(a.name)} <em class="muted">${money(a.price)}</em></span></label>`).join('') : '<p class="muted">No paid add-ons yet.</p>'}</fieldset>`;
    }
    const inputValue = type === 'date' && value ? String(value).slice(0, 10) : (value ?? '');
    return `<label class="${full.trim()}">${esc(text)}<input type="${type}" name="${name}" value="${esc(inputValue)}" ${req} ${type === 'number' ? 'step="any"' : ''}></label>`;
  }

  function collectPayload(table, formData) {
    const payload = {};
    schemas[table].forEach(([name, , type]) => {
      if (type === 'file') return;
      if (type === 'checkbox') payload[name] = formData.has(name);
      else if (type === 'number') payload[name] = formData.get(name) === '' ? null : Number(formData.get(name) || 0);
      else if (type === 'lines') payload[name] = String(formData.get(name) || '').split('\n').map((x) => x.trim()).filter(Boolean);
      else if (type === 'designs') {
        payload[name] = String(formData.get(name) || '').split('\n').map((line) => line.split('|').map((x) => x.trim())).filter((parts) => parts[0])
          .map(([nameValue, demo_url, image_url]) => ({ name: nameValue, demo_url: demo_url || '', image_url: image_url || '' }));
      }
      else if (type === 'product-picker' || type === 'addon-picker') payload[name] = formData.getAll(name);
      else if (type === 'date') payload[name] = formData.get(name) || null;
      else payload[name] = formData.get(name) === null ? null : String(formData.get(name)).trim() || null;
    });
    if (table === 'bundles') payload.included_products = (payload.included_product_ids || []).map(productName).filter(Boolean);
    if (['products', 'bundles', 'addons', 'categories'].includes(table)) {
      const base = payload.title || payload.bundle_name || payload.name;
      payload.slug = slugify(payload.slug || base);
      if (payload.sort_order === null) payload.sort_order = 0;
    }
    if (table === 'products' && !payload.tier) payload.tier = null;
    if (table === 'orders' && payload.order_type === 'custom' && Number(payload.quoted_price)) payload.total_amount = Number(payload.quoted_price);
    return payload;
  }

  function validatePayload(table, payload) {
    if (table === 'bundles' && !(payload.included_product_ids || []).length) return 'Select at least one included product.';
    if (['products', 'bundles', 'addons', 'categories'].includes(table)) {
      if (!payload.slug) return 'Slug is required.';
      const price = table === 'bundles' ? payload.bundle_price : payload.price;
      if (table !== 'categories' && (price === null || price < 0)) return 'Price must be 0 or more.';
    }
    return '';
  }

  async function saveRecord(table, original) {
    const form = document.getElementById('editor-form');
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const payload = collectPayload(table, formData);
    const problem = validatePayload(table, payload);
    if (problem) return toast(problem, 'error');

    const saveBtn = document.getElementById('dialog-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try {
      const uploaded = await uploadKnownFiles(table, formData);
      Object.assign(payload, uploaded);

      if (!client || !state.session) {
        saveLocal(table, original, payload);
        return;
      }
      const query = table === 'settings'
        ? client.from('settings').upsert({ ...original, ...payload, id: original.id || 1 }).select().single()
        : original.id
          ? client.from(table).update(payload).eq('id', original.id).select().single()
          : client.from(table).insert(payload).select().single();
      const { data, error } = await query;
      if (error) {
        const hint = /column|schema cache/i.test(error.message) ? ' — run admin/MIGRATION_CATALOG_V2.sql in Supabase.' : /duplicate|unique/i.test(error.message) ? ' — that slug/code already exists.' : '';
        return toast(error.message + hint, 'error');
      }
      applySaved(table, original, data);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  }

  async function uploadKnownFiles(table, formData) {
    const map = { thumbnail_file: 'thumbnail_url', logo_file: 'logo_url', hero_banner_file: 'hero_banner_url' };
    const result = {};
    for (const [fileField, urlField] of Object.entries(map)) {
      const file = formData.get(fileField);
      if (!file || !file.name || !client) continue;
      const safeName = `${table}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '-')}`;
      const { error } = await client.storage.from(bucket).upload(safeName, file, { upsert: true });
      if (error) {
        const missingBucket = /bucket not found|row-level security/i.test(error.message || '');
        toast(missingBucket
          ? `Upload failed: storage bucket "${bucket}" is missing. Run admin/STORAGE_SETUP.sql in Supabase, then retry. The record was saved without the new image.`
          : `Upload failed: ${error.message}`, 'error');
      } else {
        result[urlField] = client.storage.from(bucket).getPublicUrl(safeName).data.publicUrl;
      }
    }
    return result;
  }

  function saveLocal(table, original, payload) {
    const record = { ...original, ...payload, id: original.id || crypto.randomUUID(), created_at: original.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    applySaved(table, original, record);
  }

  function applySaved(table, original, record) {
    if (table === 'settings') state.data.settings = record;
    else if (original.id) state.data[table] = state.data[table].map((item) => (item.id === original.id ? record : item));
    else state.data[table].unshift(record);
    document.getElementById('editor-dialog').close();
    toast('Saved successfully.');
    render();
  }

  function deleteRow(table, row) {
    const dialog = document.getElementById('confirm-dialog');
    const used = table === 'products' ? state.data.bundles.filter((b) => (b.included_product_ids || []).map(String).includes(String(row.id))) : [];
    document.getElementById('confirm-message').textContent = used.length
      ? `This product is included in ${used.length} bundle(s): ${used.map((b) => b.bundle_name).join(', ')}. Remove it from those bundles first.`
      : `Delete "${row.title || row.bundle_name || row.name || row.customer_name || row.coupon_code || 'this record'}"? This cannot be undone.`;
    const confirmBtn = document.getElementById('confirm-delete');
    confirmBtn.style.display = used.length ? 'none' : '';
    confirmBtn.onclick = async () => {
      if (client && state.session) {
        const { error } = await client.from(table).delete().eq('id', row.id);
        if (error) return toast(error.message, 'error');
      }
      state.data[table] = state.data[table].filter((r) => r.id !== row.id);
      dialog.close();
      toast('Deleted successfully.');
      render();
    };
    document.getElementById('confirm-cancel').onclick = () => dialog.close();
    dialog.showModal();
  }

  /* ── Orders ── */
  async function updateOrder(order, patch, successMessage) {
    if (client && state.session) {
      const { error } = await client.from('orders').update(patch).eq('id', order.id);
      if (error) return toast(`Error: ${error.message}`, 'error');
    }
    Object.assign(order, patch);
    toast(successMessage, 'success');
    render();
  }

  function markAsPaid(order) {
    if (!confirm('Mark this order as Paid?')) return;
    updateOrder(order, { payment_status: 'Paid', order_status: order.order_status === 'Pending' ? 'In Progress' : order.order_status }, 'Order marked as Paid ✅');
  }

  function quoteOrder(order) {
    const value = prompt('Final quoted price (EGP) for this custom request:', order.quoted_price || order.base_price || 800);
    if (value === null) return;
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0) return toast('Enter a valid price.', 'error');
    updateOrder(order, { quoted_price: price, total_amount: price, order_status: order.order_status === 'Pending' ? 'In Progress' : order.order_status }, `Quoted ${money(price)} 💰`);
  }

  function openWhatsApp(order) {
    const phone = (order.phone_number || order.whatsapp_number || '').replace(/[^\d]/g, '');
    const message = order.order_type === 'custom'
      ? `Hi ${order.customer_name}, thanks for your custom invitation request with Memora!${Number(order.quoted_price) ? ` Your quoted price is ${money(order.quoted_price)}.` : ''}`
      : `Hi ${order.customer_name}, regarding your Memora order (${order.purchased_product || 'invitation'})...`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  function viewOrderDetails(order) {
    const dialog = document.getElementById('editor-dialog');
    document.getElementById('dialog-title').textContent = `${order.customer_name || 'Customer'} — ${order.order_type === 'custom' ? 'Custom Request' : 'Order Details'}`;
    const fields = document.getElementById('dialog-fields');
    const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—');
    const val = (v) => esc(v || '—');
    const item = (labelText, value, full = false) => `<div class="detail-item${full ? ' full' : ''}"><span>${esc(labelText)}</span><strong>${value}</strong></div>`;
    const section = (title, items) => `<div class="drawer-section"><h3>${esc(title)}</h3><div class="detail-grid">${items.join('')}</div></div>`;
    const addonNames = (order.selected_addons || []).map((slug) => { const a = state.data.addons.find((x) => x.slug === slug); return a ? `${a.name} (${a.pricing_type === 'free' ? 'free' : money(a.price)})` : slug; });
    const custom = order.custom_details || {};
    const eventNames = order.event_names || [order.bride_name, order.groom_name].filter(Boolean).join(' & ');

    fields.innerHTML = `
      <div class="full">
        ${section('Customer Information', [
          item('Full Name', val(order.customer_name)), item('Email', val(order.email)),
          item('WhatsApp / Phone', val(order.phone_number || order.whatsapp_number)), item('Language', val(order.preferred_language)),
          item('Submitted', esc(order.created_at ? new Date(order.created_at).toLocaleString() : '—')), item('Order Type', order.order_type === 'custom' ? '<span class="pill info">Custom request</span>' : '<span class="pill">Standard</span>')
        ])}
        ${section('Event', [
          item('Event Type', val(order.event_type)), item('Names', val(eventNames)),
          item('Event Date', esc(formatDate(order.event_date || order.wedding_date))), item('Venue', val(order.venue)),
          item('Colour Preference', val(order.color_preference)),
          item('Music Link', order.music_link ? `<a href="${esc(order.music_link)}" target="_blank" rel="noopener noreferrer">Open Link</a>` : '—')
        ])}
        ${order.order_type === 'custom' ? section('Custom Request', [
          item('Preferred Style', val(custom.style), true), item('Colours', val(custom.colors)),
          item('Requested Features', esc((custom.requested_feature_names || addonNames).join(', ') || '—'), true),
          item('Special Sections', val(custom.special_sections), true), item('Custom Animation', val(custom.custom_animation), true),
          item('Additional Requirements', val(custom.requirements), true),
          item('Starting Price', money(custom.starting_price || order.base_price || 800)),
          item('Quoted Price', Number(order.quoted_price) ? money(order.quoted_price) : '<span class="pill warn">Not quoted yet</span>')
        ]) : section('Purchase Details', [
          item('Product', val(order.purchased_product)), item('Design', val(order.selected_design)),
          item('Category', val(order.product_category)), item('Add-ons', esc(addonNames.join(', ') || 'None'), true),
          item('Base Price', money(order.base_price ?? order.total_amount)), item('Add-ons Total', money(order.addons_total)),
          item('Total', money(order.total_amount)), item('Payment Method', val(order.payment_method))
        ])}
        ${section('Notes', [item('Special Requests / Summary', `<span class="pre">${val(order.special_requests)}</span>`, true), item('Admin Notes', `<span class="pre">${val(order.admin_notes)}</span>`, true)])}
        ${section('Status', [item('Payment Status', val(order.payment_status)), item('Order Status', val(order.order_status))])}
      </div>`;

    const saveBtn = document.getElementById('dialog-save');
    saveBtn.style.display = '';
    saveBtn.textContent = 'Edit order';
    state.currentSave = () => { dialog.close(); openEditor('orders', order); };
    dialog.showModal();
  }

  /* ── Charts ── */
  function drawBars(id, values, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const max = Math.max(...values, 1);
    const gap = 8;
    const width = (rect.width - gap * (values.length - 1)) / values.length;
    const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    values.forEach((value, index) => {
      const h = (value / max) * (rect.height - 36);
      const x = index * (width + gap);
      const y = rect.height - h - 20;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x, 12, width, rect.height - 32);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, h);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + width / 2, rect.height - 4);
    });
  }

  function varColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  return { initLogin, initDashboard };
})();
