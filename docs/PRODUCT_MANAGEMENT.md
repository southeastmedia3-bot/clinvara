# Product Management

## Data Sources

Product data is Firestore-first with local fallback.

- Firestore collection: `products`.
- Static fallback: `lib/data/products.ts`.
- Firestore service: `lib/firebase/products.ts`.
- Admin service: `lib/admin/firestore.ts`.
- Admin UI: `components/admin/ProductsAdmin.tsx`, `components/admin/ProductForm.tsx`.

## Product Identity

Use slug as stable identity and Firestore document ID.

Current slugs:

- `acne-reset-serum`
- `clear-cleanse-face-wash`
- `deep-pigmentation-cream`
- `barrier-restore-gel`
- `shield-spf-50-sunscreen`

## Product Display Names

Canonical names should be sourced consistently. `lib/data/productBranding.ts` normalizes customer-facing renamed products. Avoid hardcoding old names in UI.

## Product Images

Current images live in:

- `public/images/products`.

Safe missing image behavior:

- New sunscreen has empty image fields and should show placeholder, not broken image requests.
- Use `SafeImage` for uncertain image paths.

## Product Fields

Important fields:

- `slug`
- `name`
- `price`
- `mrp`
- `category`
- `concerns`
- `concernSlugs`
- `badge`
- `featured`
- `active`
- `stock`
- `lowStockThreshold`
- `availability`
- `description`
- `ingredients`
- `howToUse`
- `keyIngredients`
- `sizes`
- `image`
- `imageHover`
- `gallery`
- `galleryAlt`
- `rating`
- `reviewCount`
- `seoTitle`
- `seoDescription`

## Availability

Helpers:

- `lib/productAvailability.ts`.

Rules:

- `stock <= 0` or out-of-stock status disables add to cart.
- Low stock threshold supports badges/admin analytics.

## Product Cards

File: `components/product/ProductCard.tsx`.

Must preserve:

- Equal heights.
- Image ratio.
- Two-line mobile titles.
- Quick add.
- Wishlist.
- Rating.
- Pricing.
- Stock/availability behavior.

## Product Detail Pages

Files:

- `app/shop/[slug]/page.tsx`.
- `components/product/ProductDetail.tsx`.

Must preserve:

- Metadata.
- Product JSON-LD.
- Breadcrumbs.
- Trust sections.
- Delivery estimates.
- Accordions.
- Related reading/products.

## Seed Products

Use:

- `scripts/seed-products-firestore.mjs`.
- `scripts/SEED_PRODUCTS_FIRESTORE.md`.

Command pattern:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
node scripts\seed-products-firestore.mjs
```

## Adding a Product

1. Add to Firestore through admin or seed script.
2. Optionally add static fallback to `lib/data/products.ts`.
3. Use slug as document ID.
4. Add image assets if available.
5. Confirm shop/PDP/search/wishlist/cart render correctly.
6. Confirm sitemap includes product if active.

## Changing a Slug

Only change slugs intentionally. Add permanent redirect in Next config or route handling. Update internal links, sitemap, canonical URL, JSON-LD, breadcrumbs, blog/product related links, and email links if relevant.
