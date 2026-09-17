# Memora Store

Memora is a premium digital invitation store (weddings first, plus engagements, henna nights, birthdays and more) built with HTML, CSS, vanilla JavaScript and Supabase. No build step; deploy the `Store` folder as a static site.

## Catalog (managed from the Admin)

The storefront reads its catalog from Supabase (`categories`, `products`, `bundles`, `addons`). If Supabase is unreachable **or the catalog migration has not been run yet**, it falls back to the seed catalog embedded in `assets/js/catalog.js` (identical to the SQL seed).

### Invitations

| Product | Price |
| --- | ---: |
| Date Invitation | 250 EGP |
| Birthday Invitation | 350 EGP |
| Gender Reveal Invitation | 400 EGP |
| Engagement Invitation | 500 EGP |
| Henna Invitation | 500 EGP |
| Bachelorette Invitation | 500 EGP |
| Bachelorette + "Who's Most Likely To" Online Game | 800 EGP |
| Wedding Standard (design: Modern Minimal) | 500 EGP |
| Wedding Premium (designs: Luxury Bloom, Authentic) | 800 EGP |
| Custom Invitation | from 800 EGP |

### Add-ons

| Add-on | Price |
| --- | ---: |
| Location | FREE |
| Countdown | FREE |
| Music | +100 EGP |
| Background Animation | +100 EGP |
| Gallery | +200 EGP |
| Our Story | +200 EGP |
| RSVP | +400 EGP |
| Custom Animation | from +150 EGP |

### Bundles

| Bundle | Individually | Bundle price |
| --- | ---: | ---: |
| Henna + Wedding Standard | 1000 EGP | 900 EGP |
| Henna + Wedding Premium | 1300 EGP | 1150 EGP |
| Henna + Bachelorette | 1000 EGP | 900 EGP |
| Henna + Bachelorette + Online Game | 1300 EGP | 1150 EGP |

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home: Wedding → More Moments → Bundles → Price List → Custom → FAQ |
| `product.html?id=<slug>` | Product / bundle details (designs, included products, add-ons) |
| `order-form.html?product=<slug>[&design=<name>]` | 5-step order: invitation → customise (palette + add-ons) → details → event → review |
| `checkout.html` | Order summary, InstaPay, saves order to Supabase, confirms via WhatsApp |
| `custom-order.html` | Custom Invitation request (saved as `orders.order_type = 'custom'`, then WhatsApp) |
| `thank-you.html` | Post-request landing page |

Shared scripts: `assets/js/i18n.js` (EN/AR + RTL, `data-i18n` attributes, EN | العربية switcher), `assets/js/icons.js` (line-icon set matching the demos; products without artwork get a branded icon tile), `assets/js/catalog.js` (Supabase catalog loader + seed), `assets/js/premium.js` (wedding/occasion/bundle cards, price list, nav, animations).

## Translations

Every store page supports English and Arabic (RTL). The toggle is in the navbar; the choice is stored in `localStorage` (`memora-lang`). Static text uses `data-i18n="key"`; catalog content uses the `*_ar` columns managed in the Admin (`name_ar`, `description_ar`, `features_ar`).

## Order flow

Visitor → Browse → Product → `order-form.html` → `checkout.html` → InstaPay → **Confirm via WhatsApp** (order row inserted into `orders` with add-ons, design and event details) → Admin.

WhatsApp number: `https://wa.me/201099885633`.

## Admin Dashboard

Admin files live in `admin/`:

- `admin/index.html` – Supabase login
- `admin/dashboard.html` – Dashboard, Orders (standard + custom requests, filters, quote), Products, Bundles, Categories, Add-ons, Coupons, Analytics, Settings
- `admin/assets/admin.js` – auth, CRUD, tables, charts, storage upload
- `admin/assets/supabase-config.js` – Supabase project configuration

## Database setup

Run in the Supabase SQL editor, in order (all scripts are idempotent):

1. `admin/SUPABASE_SETUP.sql` – base tables, RLS, storage bucket
2. `admin/MEMORA_CRM_MIGRATION.sql` – order CRM columns
3. `admin/MIGRATION_CATALOG_V2.sql` – **catalog v2**: categories, add-ons, bilingual product/bundle columns, bundle product relationships, custom-order columns on `orders`, public read policies for the storefront, and a security fix that removes public read access to `orders`.
4. `admin/STORAGE_SETUP.sql` – creates the `memora-assets` storage bucket + policies used by the Admin image uploads (required, otherwise "Upload Thumbnail" fails).

Until step 3 is run the store shows the built-in seed catalog and checkout falls back to the legacy `orders` columns automatically.

## Local preview

```bash
python -m http.server 8787 --directory Store
```

Then open http://localhost:8787/.
