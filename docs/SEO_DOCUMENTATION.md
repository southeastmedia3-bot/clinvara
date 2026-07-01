# SEO Documentation

## SEO Strategy

CLINVARA uses technical SEO, structured data, internal linking, product education, and fast crawlable pages to support skincare ecommerce discovery.

## Core Files

- `app/layout.tsx`
- `app/page.tsx`
- `app/shop/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `lib/data/blogs.ts`
- `lib/data/products.ts`
- `lib/data/internalLinks.ts`

## Metadata

Implemented:

- Site-wide metadataBase.
- Homepage title/description.
- Static page metadata.
- Product-specific metadata.
- Blog-specific metadata.
- Open Graph title/description/url/images.
- Twitter title/description/images.

## Canonical URLs

Canonical URLs are route-specific and use `https://clinvara.global`.

Product canonical URL pattern:

`https://clinvara.global/shop/[slug]`

Blog canonical URL pattern:

`https://clinvara.global/blog/[slug]`

## Sitemap

File: `app/sitemap.ts`.

Includes:

- Homepage.
- Shop.
- Routines.
- Blog list.
- Contact/policies/company pages.
- Product detail URLs.
- Blog detail URLs.

## Robots

File: `app/robots.ts`.

Allows public pages and disallows private/API areas such as account/cart/checkout/admin/API where appropriate.

## JSON-LD Schemas

Implemented schema types include:

- Organization.
- WebSite.
- Product.
- BreadcrumbList.
- FAQPage.
- Review/AggregateRating where applicable.
- Blog/article metadata.

## Product SEO

Product pages use:

- Product name.
- SEO title/description if available.
- Product image if available.
- Current price.
- Availability.
- Reviews/ratings.
- Product JSON-LD.
- Breadcrumb JSON-LD.
- Product FAQ.
- Related reading.

## Blog SEO

Blogs use:

- Article metadata.
- Canonical links.
- Internal product links.
- Related articles/products where relevant.
- Crawlable article structure.

## Internal Linking

Implemented:

- Blog to product links.
- Product to related blogs.
- Homepage to products/categories/concerns/routines.
- Footer to policies/company/quick links.
- Search/shop/product internal paths.

## Important Warnings

- Do not remove redirects for old product slugs.
- Do not modify sitemap/robots/schema casually.
- Do not hardcode homepage `og:url` on every page.
- Keep product slugs stable.
- If a product slug changes, add a permanent redirect.

## Future SEO Improvements

- Add Google Merchant Center feed after payment/product operational readiness.
- Add richer review collection when reviews are real.
- Add blog author schema if authorship becomes important.
- Add image CDN/storage metadata if product images move to Firebase Storage.
