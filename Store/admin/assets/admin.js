const MemoraAdmin = (() => {
  const cfg = window.MEMORA_SUPABASE || {};
  const configured = cfg.url && !cfg.url.includes('YOUR_') && cfg.anonKey && !cfg.anonKey.includes('YOUR_');
  const client = configured ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  const bucket = cfg.storageBucket || 'memora-assets';
  const pageSize = 8;

  const state = {
    session: null,
    view: 'dashboard',
    search: '',
    sort: {},
    page: {},
    data: {
      products: [],
      bundles: [],
      orders: [],
      coupons: [],
      settings: {}
    }
  };

  const defaults = {
    products: [
      { id: 'modern-minimal', title: 'Modern Minimal', description: 'Clean modern wedding invitation template.', price: 500, category: 'Standard', live_demo_url: 'https://modern-minimal-delta.vercel.app/', buy_url: 'https://wa.me/201099885633', thumbnail_url: '../images/demo_modern_minimal.png', featured: true, in_stock: true },
      { id: 'luxury-bloom', title: 'Luxury Bloom', description: 'Premium invitation with elegant bloom styling.', price: 800, category: 'Premium', live_demo_url: 'https://luxury-bloom-demo.vercel.app/', buy_url: 'https://wa.me/201099885633', thumbnail_url: '../images/demo_luxury_bloom.png', featured: true, in_stock: true },
      { id: 'authentic', title: 'Authentic', description: 'Timeless premium invitation design.', price: 800, category: 'Premium', live_demo_url: 'https://authentic-demo-chi.vercel.app/', buy_url: 'https://wa.me/201099885633', thumbnail_url: '../images/demo_royal_gold.png', featured: true, in_stock: true }
    ],
    bundles: [
      { id: 'memora-essential', bundle_name: 'Memora Essential', description: 'Modern Minimal plus Love Card.', included_products: ['Modern Minimal', 'Love Card'], bundle_price: 950, thumbnail_url: '../images/demo_modern_minimal.png', featured: true },
      { id: 'memora-signature', bundle_name: 'Memora Signature', description: 'Luxury Bloom plus Love Card.', included_products: ['Luxury Bloom', 'Love Card'], bundle_price: 1250, thumbnail_url: '../images/demo_luxury_bloom.png', featured: true }
    ],
    orders: [
      { id: 'sample-1', customer_name: 'Sample Bride', whatsapp_number: '+201099885633', email: 'customer@example.com', purchased_product: 'Modern Minimal', purchased_bundle: '', order_date: new Date().toISOString(), payment_status: 'Pending', order_status: 'Pending', total_amount: 500 }
    ],
    coupons: [
      { id: 'welcome10', coupon_code: 'WELCOME10', discount_percent: 10, expiration_date: '', maximum_uses: 100, current_uses: 0, status: 'Active' }
    ],
    settings: {
      store_name: 'Memora',
      whatsapp_number: '+201099885633',
      business_email: 'support@memora.com',
      footer_text: 'Premium wedding invitation websites and digital love cards.',
      seo_title: 'Memora - Digital Wedding Invitation Templates',
      seo_description: 'Modern, premium, digital wedding invitation templates.'
    }
  };

  const schemas = {
    products: [
      ['title', 'Title', 'text', true], ['description', 'Description', 'textarea'], ['price', 'Price', 'number', true],
      ['category', 'Category', 'text'], ['live_demo_url', 'Live Demo URL', 'url'], ['buy_url', 'Buy URL', 'url'],
      ['thumbnail_url', 'Thumbnail URL', 'url'], ['thumbnail_file', 'Upload Thumbnail', 'file'],
      ['featured', 'Featured', 'checkbox'], ['in_stock', 'In Stock', 'checkbox']
    ],
    bundles: [
      ['bundle_name', 'Bundle Name', 'text', true], ['description', 'Description', 'textarea'],
      ['included_products', 'Included Products', 'text'], ['bundle_price', 'Bundle Price', 'number', true],
      ['thumbnail_url', 'Thumbnail URL', 'url'], ['thumbnail_file', 'Upload Thumbnail', 'file'], ['featured', 'Featured', 'checkbox']
    ],
    orders: [
      ['customer_name', 'Customer Name', 'text', true], ['whatsapp_number', 'WhatsApp Number', 'text'], ['email', 'Email', 'email'],
      ['purchased_product', 'Purchased Product', 'text'], ['purchased_bundle', 'Purchased Bundle', 'text'], ['total_amount', 'Total Amount', 'number'],
      ['payment_status', 'Payment Status', 'select:Pending|Paid'], ['order_status', 'Order Status', 'select:Pending|Paid|Completed|Cancelled']
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

  function getText(row) {
    return Object.values(row || {}).flat().join(' ').toLowerCase();
  }

  function matchSearch(items) {
    const q = state.search.trim().toLowerCase();
    return q ? items.filter((item) => getText(item).includes(q)) : items;
  }

  async function initLogin() {
    if (!configured) toast('Add Supabase URL and anon key in admin/assets/supabase-config.js', 'error');
    if (client) {
      const { data } = await client.auth.getSession();
      if (data.session) location.href = 'dashboard.html';
    }
    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!client) return toast('Supabase is not configured yet.', 'error');
      const form = new FormData(event.currentTarget);
      const { error } = await client.auth.signInWithPassword({
        email: form.get('email'),
        password: form.get('password')
      });
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
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => {
        state.view = button.dataset.view;
        document.querySelectorAll('[data-view]').forEach((el) => el.classList.toggle('active', el.dataset.view === state.view));
        document.getElementById('sidebar').classList.remove('open');
        render();
      });
    });
    document.getElementById('sidebar-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
    document.getElementById('global-search').addEventListener('input', (event) => {
      state.search = event.target.value;
      render();
    });
    document.getElementById('logout-btn').addEventListener('click', async () => {
      if (client) await client.auth.signOut();
      location.href = 'index.html';
    });
  }

  async function loadAll() {
    if (!client || !state.session) {
      state.data = JSON.parse(JSON.stringify(defaults));
      return;
    }
    await Promise.all(['products', 'bundles', 'orders', 'coupons'].map(loadTable));
    const { data } = await client.from('settings').select('*').limit(1).maybeSingle();
    state.data.settings = data || defaults.settings;
  }

  async function loadTable(table) {
    const { data, error } = await client.from(table).select('*').order('created_at', { ascending: false });
    state.data[table] = error ? defaults[table] : (data || []);
    if (error) toast(`Could not load ${table}: ${error.message}`, 'error');
  }

  function render() {
    const titles = { dashboard: 'Dashboard', products: 'Products', bundles: 'Bundles', orders: 'Orders', coupons: 'Coupons', analytics: 'Analytics', settings: 'Settings' };
    document.getElementById('view-title').textContent = titles[state.view];
    const root = document.getElementById('view-root');
    root.innerHTML = '';
    if (state.view === 'dashboard') root.appendChild(dashboardView());
    if (state.view === 'analytics') root.appendChild(analyticsView());
    if (['products', 'bundles', 'orders', 'coupons'].includes(state.view)) root.appendChild(tableView(state.view));
    if (state.view === 'settings') root.appendChild(settingsView());
  }

  function dashboardView() {
    const wrap = document.createElement('div');
    const orders = state.data.orders;
    const paidRevenue = orders.filter((o) => ['Paid', 'Completed'].includes(o.payment_status || o.order_status)).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    wrap.innerHTML = `
      <div class="stats-grid">
        ${stat('Total Products', state.data.products.length)}
        ${stat('Total Bundles', state.data.bundles.length)}
        ${stat('Total Orders', orders.length)}
        ${stat('Total Revenue', money(paidRevenue))}
        ${stat('Visitors', Number(state.data.settings.visitors || 0).toLocaleString())}
      </div>
      <div class="grid-2">
        <section class="content-card"><div class="card-head"><div><h2>Sales Overview</h2><p>Monthly revenue</p></div></div><canvas class="chart" id="sales-chart"></canvas></section>
        <section class="content-card"><div class="card-head"><div><h2>Monthly Orders</h2><p>Order volume</p></div></div><canvas class="chart" id="orders-chart"></canvas></section>
        <section class="content-card"><div class="card-head"><div><h2>Recent Orders</h2><p>Latest customer purchases</p></div></div><div class="mini-list">${miniOrders().join('')}</div></section>
        <section class="content-card"><div class="card-head"><div><h2>Latest Customers</h2><p>Most recent leads</p></div></div><div class="mini-list">${latestCustomers().join('')}</div></section>
      </div>`;
    requestAnimationFrame(() => {
      drawBars('sales-chart', monthlyValues('total_amount'), varColor('--gold'));
      drawBars('orders-chart', monthlyValues('count'), varColor('--rose'));
    });
    return wrap;
  }

  function stat(label, value) {
    return `<section class="stat-card"><span class="muted">${label}</span><strong>${value}</strong></section>`;
  }

  function miniOrders() {
    return state.data.orders.slice(0, 5).map((o) => `<div class="mini-item"><strong>${o.customer_name || 'Customer'}</strong><span>${o.purchased_product || o.purchased_bundle || 'Order'} | ${o.order_status || 'Pending'}</span></div>`);
  }

  function latestCustomers() {
    return state.data.orders.slice(0, 5).map((o) => `<div class="mini-item"><strong>${o.customer_name || 'Customer'}</strong><span>${o.email || o.whatsapp_number || ''}</span></div>`);
  }

  function analyticsView() {
    const orders = state.data.orders;
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const visitors = Number(state.data.settings.visitors || 0);
    const conversion = visitors ? ((orders.length / visitors) * 100).toFixed(1) : '0.0';
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="stats-grid">
        ${stat('Revenue', money(revenue))}
        ${stat('Visitors', visitors.toLocaleString())}
        ${stat('Orders', orders.length)}
        ${stat('Monthly Revenue', money(monthlyValues('total_amount').at(-1) || 0))}
        ${stat('Conversion Rate', `${conversion}%`)}
      </div>
      <div class="grid-3">
        <section class="content-card"><div class="card-head"><h2>Monthly Revenue</h2></div><canvas class="chart" id="analytics-revenue"></canvas></section>
        <section class="content-card"><div class="card-head"><h2>Top Selling Products</h2></div><div class="mini-list">${leaderboard('purchased_product').join('')}</div></section>
        <section class="content-card"><div class="card-head"><h2>Top Selling Bundles</h2></div><div class="mini-list">${leaderboard('purchased_bundle').join('')}</div></section>
        <section class="content-card"><div class="card-head"><h2>Most Viewed Products</h2></div><div class="mini-list">${state.data.products.map((p) => `<div class="mini-item"><strong>${p.title}</strong><span>${p.views || 0} views</span></div>`).join('')}</div></section>
      </div>`;
    requestAnimationFrame(() => drawBars('analytics-revenue', monthlyValues('total_amount'), varColor('--gold')));
    return wrap;
  }

  function leaderboard(field) {
    const counts = {};
    state.data.orders.forEach((order) => {
      if (order[field]) counts[order[field]] = (counts[order[field]] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => `<div class="mini-item"><strong>${name}</strong><span>${count} sales</span></div>`);
  }

  function monthlyValues(type) {
    const months = Array.from({ length: 12 }, () => 0);
    state.data.orders.forEach((order) => {
      const date = new Date(order.order_date || order.created_at || Date.now());
      const month = date.getMonth();
      months[month] += type === 'count' ? 1 : Number(order.total_amount || 0);
    });
    return months;
  }

  function tableView(table) {
    const rows = paginate(sortRows(matchSearch(state.data[table]), table), table);
    const wrap = document.createElement('section');
    wrap.className = 'content-card';
    wrap.innerHTML = `
      <div class="toolbar">
        <div><h2>${table[0].toUpperCase() + table.slice(1)}</h2><p class="muted">Search, sort, paginate, create, edit, and delete records.</p></div>
        <div class="toolbar-actions">
          <button class="btn primary" data-create="${table}">Create ${table.slice(0, -1)}</button>
        </div>
      </div>
      <div class="table-wrap">${tableMarkup(table, rows)}</div>
      ${pagerMarkup(table, matchSearch(state.data[table]).length)}
    `;
    wrap.querySelector('[data-create]').addEventListener('click', () => openEditor(table));
    bindTableActions(wrap, table);
    return wrap;
  }

  function tableMarkup(table, rows) {
    const columns = {
      products: ['title', 'price', 'category', 'live_demo_url', 'featured', 'in_stock'],
      bundles: ['bundle_name', 'bundle_price', 'included_products', 'featured'],
      orders: ['customer_name', 'whatsapp_number', 'email', 'purchased_product', 'purchased_bundle', 'payment_status', 'order_status', 'total_amount'],
      coupons: ['coupon_code', 'discount_percent', 'expiration_date', 'maximum_uses', 'current_uses', 'status']
    }[table];
    return `<table><thead><tr>${columns.map((c) => `<th data-sort="${c}">${label(c)}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((c) => `<td>${cell(row, c)}</td>`).join('')}<td><div class="row-actions"><button class="btn ghost" data-edit="${row.id}">Edit</button><button class="btn danger" data-delete="${row.id}">Delete</button></div></td></tr>`).join('')}</tbody></table>`;
  }

  function cell(row, key) {
    const value = row[key];
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? '<span class="pill ok">Yes</span>' : '<span class="pill bad">No</span>';
    if (key.includes('status')) return `<span class="pill ${value === 'Completed' || value === 'Paid' || value === 'Active' ? 'ok' : value === 'Cancelled' || value === 'Expired' ? 'bad' : 'warn'}">${value || 'Pending'}</span>`;
    if (key.includes('price') || key === 'total_amount') return money(value);
    if (String(value || '').startsWith('http')) return `<a class="muted" href="${value}" target="_blank" rel="noopener noreferrer">Open</a>`;
    return value || '';
  }

  function label(key) {
    return key.replaceAll('_', ' ');
  }

  function bindTableActions(wrap, table) {
    wrap.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => openEditor(table, state.data[table].find((row) => String(row.id) === btn.dataset.edit))));
    wrap.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => confirmDelete(table, btn.dataset.delete)));
    wrap.querySelectorAll('[data-sort]').forEach((th) => th.addEventListener('click', () => {
      state.sort[table] = { key: th.dataset.sort, dir: state.sort[table]?.dir === 'asc' ? 'desc' : 'asc' };
      render();
    }));
    wrap.querySelectorAll('[data-page]').forEach((btn) => btn.addEventListener('click', () => {
      state.page[table] = Math.max(1, (state.page[table] || 1) + Number(btn.dataset.page));
      render();
    }));
  }

  function sortRows(rows, table) {
    const sort = state.sort[table];
    if (!sort) return rows;
    return [...rows].sort((a, b) => String(a[sort.key] || '').localeCompare(String(b[sort.key] || ''), undefined, { numeric: true }) * (sort.dir === 'asc' ? 1 : -1));
  }

  function paginate(rows, table) {
    const page = state.page[table] || 1;
    return rows.slice((page - 1) * pageSize, page * pageSize);
  }

  function pagerMarkup(table, total) {
    const page = state.page[table] || 1;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return `<div class="pager"><button class="btn ghost" data-page="-1" ${page <= 1 ? 'disabled' : ''}>Prev</button><span>Page ${page} of ${pages}</span><button class="btn ghost" data-page="1" ${page >= pages ? 'disabled' : ''}>Next</button></div>`;
  }

  function settingsView() {
    const wrap = document.createElement('section');
    wrap.className = 'content-card';
    wrap.innerHTML = `<div class="card-head"><div><h2>Settings</h2><p>Store identity, social links, SEO, and contact defaults.</p></div><button class="btn primary" id="edit-settings">Edit Settings</button></div><div class="grid-2">${Object.entries(state.data.settings).map(([k, v]) => `<div class="mini-item"><strong>${label(k)}</strong><span>${v || '-'}</span></div>`).join('')}</div>`;
    wrap.querySelector('#edit-settings').addEventListener('click', () => openEditor('settings', state.data.settings));
    return wrap;
  }

  function openEditor(table, row = {}) {
    const dialog = document.getElementById('editor-dialog');
    document.getElementById('dialog-title').textContent = `${row.id ? 'Edit' : 'Create'} ${table === 'settings' ? 'Settings' : table.slice(0, -1)}`;
    const fields = document.getElementById('dialog-fields');
    fields.innerHTML = schemas[table].map(([name, text, type, required]) => fieldMarkup(name, text, type, row[name], required)).join('');
    document.getElementById('dialog-save').onclick = () => saveRecord(table, row);
    dialog.showModal();
  }

  function fieldMarkup(name, text, type, value, required) {
    const full = type === 'textarea' || type === 'file' ? ' full' : '';
    if (type === 'textarea') return `<label class="${full}">${text}<textarea name="${name}" ${required ? 'required' : ''}>${value || ''}</textarea></label>`;
    if (type === 'checkbox') return `<label class="inline-check${full}"><input type="checkbox" name="${name}" ${value ? 'checked' : ''}><span>${text}</span></label>`;
    if (type === 'file') return `<label class="${full}">${text}<input type="file" name="${name}" accept="image/*"></label>`;
    if (type.startsWith('select:')) return `<label>${text}<select name="${name}">${type.replace('select:', '').split('|').map((opt) => `<option ${opt === value ? 'selected' : ''}>${opt}</option>`).join('')}</select></label>`;
    return `<label class="${full}">${text}<input type="${type}" name="${name}" value="${value || ''}" ${required ? 'required' : ''}></label>`;
  }

  async function saveRecord(table, original) {
    const form = document.getElementById('editor-form');
    const formData = new FormData(form);
    const payload = {};
    schemas[table].forEach(([name, , type]) => {
      if (type === 'file') return;
      if (type === 'checkbox') payload[name] = formData.has(name);
      else if (type === 'number') payload[name] = Number(formData.get(name) || 0);
      else if (name === 'included_products') payload[name] = String(formData.get(name) || '').split(',').map((x) => x.trim()).filter(Boolean);
      else payload[name] = formData.get(name) || null;
    });

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
    if (error) return toast(error.message, 'error');
    applySaved(table, original, data);
  }

  async function uploadKnownFiles(table, formData) {
    const map = { thumbnail_file: 'thumbnail_url', logo_file: 'logo_url', hero_banner_file: 'hero_banner_url' };
    const result = {};
    for (const [fileField, urlField] of Object.entries(map)) {
      const file = formData.get(fileField);
      if (!file || !file.name) continue;
      if (!client) continue;
      const safeName = `${table}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '-')}`;
      const { error } = await client.storage.from(bucket).upload(safeName, file, { upsert: true });
      if (error) {
        toast(error.message, 'error');
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
    else if (original.id) state.data[table] = state.data[table].map((item) => item.id === original.id ? record : item);
    else state.data[table].unshift(record);
    document.getElementById('editor-dialog').close();
    toast('Saved successfully.');
    render();
  }

  function confirmDelete(table, id) {
    const dialog = document.getElementById('confirm-dialog');
    document.getElementById('confirm-delete').onclick = async () => {
      if (client && state.session) {
        const { error } = await client.from(table).delete().eq('id', id);
        if (error) return toast(error.message, 'error');
      }
      state.data[table] = state.data[table].filter((row) => String(row.id) !== String(id));
      dialog.close();
      toast('Deleted successfully.');
      render();
    };
    document.getElementById('confirm-cancel').onclick = () => dialog.close();
    dialog.showModal();
  }

  function drawBars(id, values, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const max = Math.max(...values, 1);
    const gap = 8;
    const width = (rect.width - gap * (values.length - 1)) / values.length;
    values.forEach((value, index) => {
      const h = (value / max) * (rect.height - 36);
      const x = index * (width + gap);
      const y = rect.height - h - 20;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x, 12, width, rect.height - 32);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, h);
    });
  }

  function varColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  return { initLogin, initDashboard };
})();
