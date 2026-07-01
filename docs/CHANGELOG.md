# CLINVARA Changelog

This changelog is organized by major milestones rather than exact release dates.

## Foundation

- Created Next.js App Router ecommerce project.
- Established CLINVARA branding, typography, global styles, layout, navbar, footer, announcement bar.
- Added product catalog, homepage, shop, product detail pages, cart, wishlist, account, contact, policy pages.
- Added product images under `public/images/products`.

## Authentication

- Added Firebase Authentication.
- Added Google and Facebook sign-in flows.
- Added mobile OTP login through Firebase.
- Added email/password account creation.
- Added password reset flow.
- Added Firebase auth bootstrap and logout cleanup.
- Added Firestore customer profile sync.

## Product and Storefront

- Built Firestore-first product loading with static fallback.
- Added product cards, product grid, filters, sorting, search, product availability.
- Added product rename/branding normalization.
- Added slug updates and 301 redirects.
- Added sunscreen product with no image and out-of-stock state.
- Fixed duplicate product rendering and product card spacing/image fitting issues.

## Cart, Wishlist, and Checkout

- Added guest cart local persistence.
- Added logged-in Firestore cart sync.
- Added safe guest-to-user cart merge.
- Added delete-wins consistency to prevent stale cart writes.
- Added remove-on-minus-at-one behavior.
- Added dedicated wishlist page.
- Added wishlist Firestore sync and dedupe.
- Added checkout validation for login, email, address, and selected shipping address.
- Added pending order creation.

## Orders

- Added Firestore root orders and customer order mirrors.
- Added atomic order batch creation.
- Added account orders page.
- Added order details page using Firestore document ID.
- Added order timeline and delivery estimates.
- Added admin accept/reject/update status actions.
- Added customer order cancellation for eligible statuses.
- Added mirror sync for admin status updates.

## Returns

- Added returns collection and customer return requests.
- Added return statuses and transition rules.
- Added admin returns management.
- Added customer return tracking inside order details.
- Refactored returns UX to stay order-attached.

## Admin Dashboard

- Added protected `/admin`.
- Added admin shell/sidebar/topbar.
- Added modules: dashboard, products, orders, inventory, customers, coupons, reviews, analytics, returns, settings, maintenance, external channels.
- Added product CRUD.
- Added review moderation and reviews analytics.
- Added inventory intelligence.
- Added admin UI cleanup and formatting.
- Added maintenance reset tools with typed confirmation.
- Added external marketplace foundation.

## Email

- Added Resend/Firebase Functions email architecture.
- Added order and return event emails.
- Added admin notification emails.
- Switched sender to verified CLINVARA domain sender.
- Added email diagnostic logs.
- Normalized Resend secret usage.

## Social Feed

- Added Instagram/YouTube/Threads feed routes.
- Added server-side token handling.
- Added fallback-safe homepage social strip.
- Fixed duplicate social card rendering.
- Added Threads-first feed fallback behavior when other platforms return empty.

## SEO

- Added metadataBase.
- Added route-specific titles/descriptions.
- Added canonical/OpenGraph/Twitter metadata.
- Added robots and sitemap.
- Added Organization, Website, Product, FAQ, Breadcrumb, Review/AggregateRating schemas.
- Added homepage SEO content sections.
- Added product FAQ and image alt improvements.
- Added blog/product internal linking.
- Expanded blog catalog.

## UX Polish

- Redesigned homepage hero to premium editorial layout.
- Refined header action icons.
- Improved product card compactness and mobile title wrapping.
- Improved product detail trust/purchase sections and mobile sticky CTA.
- Improved cart, wishlist, account, orders, blog readability, admin visual density, and mobile responsiveness.
- Normalized emails to `clinvaraglobal@gmail.com`.
- Removed trademark symbols from product names.

## Security and Deployment Hygiene

- Hardened Firestore rules.
- Migrated sensitive values toward Firebase Secrets/App Hosting secrets.
- Audited server-only vs public env usage.
- Added docs and deployment guides.

## Skin Analysis

- Added Skin Analysis and Routine Builder.
- Added recommendation engine.
- Added scoring engine.
- Added skin analysis history tracking.
- Added notes and account Skin Health section.
- Added Firestore storage for `customers/{uid}/skinAnalyses`.
