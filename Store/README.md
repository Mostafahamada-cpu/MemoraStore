# Memora Store

Memora is a premium digital wedding invitation template store built with HTML, CSS, and vanilla JavaScript.

## Current Catalog

### Products

| Product | Price | Live Demo |
| --- | ---: | --- |
| Modern Minimal | 500 EGP | https://modern-minimal-delta.vercel.app/ |
| Luxury Bloom | 800 EGP | https://luxury-bloom-demo.vercel.app/ |
| Authentic | 800 EGP | https://authentic-demo-chi.vercel.app/ |

Love Card is not sold as an individual product.

### Bundles

| Bundle | Includes | Price |
| --- | --- | ---: |
| Memora Essential | Modern Minimal + Love Card | 950 EGP |
| Memora Signature | Luxury Bloom + Love Card | 1250 EGP |

## WhatsApp Purchase Flow

Buy buttons open:

```text
https://wa.me/201099885633
```

With this message:

```text
Hi! I'm interested in purchasing:
[Product Name]
```

## Admin Dashboard

Admin files live in:

```text
admin/
```

Pages:

- `admin/index.html` - Supabase login
- `admin/dashboard.html` - protected dashboard shell
- `admin/assets/admin.js` - auth, CRUD, tables, charts, storage upload logic
- `admin/assets/admin.css` - dark glassmorphism admin UI
- `admin/assets/supabase-config.js` - Supabase project configuration
- `admin/SUPABASE_SETUP.sql` - database, RLS, seed data, and storage setup

Before deployment, update `admin/assets/supabase-config.js` with your Supabase URL and anon key, then run `admin/SUPABASE_SETUP.sql` in the Supabase SQL editor.

## Deployment

This project remains static and Vercel-compatible. Deploy the folder as-is after configuring Supabase.
