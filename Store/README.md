# Memora Store

Memora is a premium digital invitation store (weddings first, plus engagements, henna nights, birthdays and more) built with HTML, CSS, vanilla JavaScript and Supabase. No build step; deploy the `Store` folder as a static site.

## Catalog (managed from the Admin)

The storefront reads its catalog from Supabase (`categories`, `products`, `bundles`, `addons`). If Supabase is unreachable **or the catalog migration has not been run yet**, it falls back to the seed catalog embedded in `assets/js/catalog.js` (identical to the SQL seed).

**Media fallback:** when a product row in Supabase has no `thumbnail_url` or `live_demo_url` yet, the store uses the seed's value for the same slug (the demo and preview image shipped in this repo). Only those two media fields are filled; names, prices, add-ons and bundles always come from the database, and anything set in the database/Admin wins. Running `admin/MIGRATION_NFC_BUNDLES_DEMOS.sql` writes the same values into the database.

### Invitations

| Product | Price |
| --- | ---: |
| Birthday Invitation | 400 EGP |
| Date Invitation | 500 EGP |
| Gender Reveal Invitation | 500 EGP |
| Engagement Invitation | 500 EGP |
| Henna Invitation | 500 EGP |
| Bachelorette Invitation | 500 EGP |
| Bachelorette + "Who's Most Likely To" Online Game | 800 EGP |
| Wedding Standard (design: Modern Minimal) | 500 EGP |
| Wedding Premium (designs: Luxury Bloom, Authentic) | 800 EGP |
| Custom Invitation | from 800 EGP |
| Love NFC Card | Bundle exclusive (`product_type = 'bundle-only'`, reference value 450 EGP) |

The **Love NFC Card** is never listed or ordered on its own: `catalog.js` keeps bundle-only products out of every grid, the price list, the order form and the related-products pool, and `product.html` shows "Bundle exclusive" plus the bundles that include it. It is only available inside the Engagement and Wedding bundles below.

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
| Wedding Standard + Love NFC Card | 500 EGP + card | 950 EGP |
| Wedding Premium + Love NFC Card | 800 EGP + card | 1250 EGP |
| Engagement + Love NFC Card | 500 EGP + card | 950 EGP |
| Henna + Wedding Standard | 1000 EGP | 900 EGP |
| Henna + Wedding Premium | 1300 EGP | 1150 EGP |
| Henna + Bachelorette | 1000 EGP | 900 EGP |
| Henna + Bachelorette + Online Game | 1300 EGP | 1150 EGP |

## Demos

The Wedding designs link to their Vercel deployments. The other occasions ship with static demos inside `Demos/` (the product's `live_demo_url`, opened from the product page, cards and order form):

| Product | Demo | Built from |
| --- | --- | --- |
| Engagement | `Demos/engagement/` | Modern Minimal template (no RSVP) + rose/gold theme |
| Henna | `Demos/henna/` | Modern Minimal template (no RSVP) + three Egyptian henna concepts: **Shaabi Night** (burgundy & gold, string lights), **Sa'idi** (terracotta & woven bands) and **Nubian** (painted walls & woven plates). A switcher at the bottom (demo only) changes concept; `?concept=shaabi|saidi|nubian` opens one directly. Each concept's copy, programme and venue live in `CONFIG.concepts` in `script.js` |
| Birthday | `Demos/birthday/` | Modern Minimal template (no RSVP) + pastel theme |
| Gender Reveal | `Demos/gender-reveal/` | Modern Minimal template (no RSVP) + pink/blue theme + **"Who do you think it is?" guest vote** (results appear after voting) and a **sealed reveal** that opens on its own at `CONFIG.reveal.at` (the demo has a preview button once you've voted). Votes are kept in the visitor's browser on top of `CONFIG.voteSeed`; no backend |
| Date | `Demos/date/` | The Date Invitation template with the date as the hero and a **Date Studio** ("Your date. Your theme. Your story."): pick a date and one of six themes (Anniversary · Pharaonic, Romantic, Birthday, Proposal, Celebration, Seasonal) and the palette, motifs, wording, countdown and timed reveals follow. `?theme=<key>&date=YYYY-MM-DD` opens a combination directly |
| Bachelorette | `Demos/bachelorette/` | The Bachelorette Trip template (stock photos; wishes & photo proofs are kept in the visitor's browser only — no Firebase/Cloudinary) |
| Love NFC Card | `Demos/Love card/modern/` | Existing Love Card demo |

Each occasion also has a **preview image** captured from its demo: `images/previews/<slug>.jpg` (1200×900, used as the product thumbnail). "Bachelorette + Online Game" uses the Bachelorette preview (same invitation); its game is not part of the public demo, so it has no demo link.

Demo photos are Unsplash hotlinks (same approach as the Authentic template). Each template-based demo is self-contained (`index.html`, `style.css`, `theme.css`, `script.js`) — edit `CONFIG` at the top of `script.js` to change names, dates and venues.

Append `?catalog=seed` to any store page to preview the built-in seed catalog (useful before a catalog migration has been run on Supabase).

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home: Hero → Live demos (filterable) → Wedding (Standard / Premium tiers, one card per design) → Occasions → Bundles → Pricing (base + add-ons = total, interactive) → Custom → How it works → Why Memora → FAQ → Final CTA |
| `product.html?id=<slug>` | Product / bundle details (designs, included products, add-ons) |
| `order-form.html?product=<slug>[&design=<name>][&addons=<slug,slug>]` | 5-step order: invitation → customise (palette + add-ons) → details → event → review. `addons` (sent by the homepage price builder) pre-ticks paid add-ons; unknown or free slugs are ignored |
| `checkout.html` | Order summary, InstaPay, saves order to Supabase, confirms via WhatsApp |
| `custom-order.html` | Custom Invitation request (saved as `orders.order_type = 'custom'`, then WhatsApp) |
| `thank-you.html` | Post-request landing page |

Shared scripts: `assets/js/i18n.js` (EN/AR + RTL, `data-i18n` attributes, EN | العربية switcher), `assets/js/icons.js` (line-icon set matching the demos; products without artwork get a branded icon tile), `assets/js/catalog.js` (Supabase catalog loader + seed + responsive image markup), `assets/js/premium.js` (demo tiles, wedding tier board, product/bundle cards, price builder, nav, animations).

## Images & performance

- Card images are served as WebP renditions from `images/opt/` (480w / 960w, 4:3) through `<picture>`; the original file (the URL stored in the catalog) stays as the fallback. The map lives in `RENDITIONS` in `assets/js/catalog.js` — an image uploaded from the Admin (not in the map) is simply served as-is.
- Hero phone screens are in `images/hero/` (WebP + JPEG fallback).
- Fonts load with `<link>` + preconnect in each page's `<head>` (no CSS `@import`).
- To add a rendition for a new artwork: create `images/opt/<name>-480.webp` and `-960.webp` (4:3) and add one line to `RENDITIONS`.

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
5. `admin/MIGRATION_NFC_BUNDLES_DEMOS.sql` – **Love NFC Card + bundles + demos**: allows `product_type = 'bundle-only'`, adds the Love NFC Card (existing artwork), the three Engagement/Wedding NFC bundles, points the occasion products at their `Demos/` demo URLs and sets their preview images (only where the Admin hasn't set one). Until it is run the store keeps the current catalog (with the media fallback above); `?catalog=seed` previews the result.

6. `admin/MIGRATION_DEMOS_V2.sql` – new prices (Date Invitation 250 → **500 EGP**, Birthday 350 → **400 EGP**, Gender Reveal 400 → **500 EGP**), plus the new Henna / Gender Reveal / Date product descriptions and features (only where the original seed text is unchanged).

Until step 3 is run the store shows the built-in seed catalog and checkout falls back to the legacy `orders` columns automatically.

## Local preview

```bash
python -m http.server 8787 --directory Store
```

Then open http://localhost:8787/.
