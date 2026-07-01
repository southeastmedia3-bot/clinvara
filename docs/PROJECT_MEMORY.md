# CLINVARA Project Memory

This is the primary project memory document for future AI assistants and developers. Read this before changing code.

## 1. Project Overview

CLINVARA is a clinical skincare ecommerce website for India-focused skincare customers. The business objective is to sell ingredient-led products through a premium, minimal, high-trust digital experience inspired by brands such as The Ordinary, Minimalist, Aesop, Typology, Nykaa, Foxtale, Dot & Key, and modern ecommerce patterns from Amazon and Myntra.

The current production domain is `https://clinvara.global`.

The project is a Next.js App Router application deployed with Firebase App Hosting. Firebase Authentication powers customer identity, Cloud Firestore stores products/customers/orders/returns/reviews/settings/admin data, and Firebase Functions provide backend endpoints for emails, chat, social feeds, order updates, returns updates, OAuth, and contact messages.

Production status: customer-facing storefront, account flows, orders, returns, admin dashboard, SEO, social feed foundation, email automation foundation, product catalog, and skin analysis routine/history features are implemented. Payment gateway integration is intentionally postponed.

Future vision: CLINVARA should become a full ecommerce operations platform with payments, courier tracking, marketplace integrations, AI skin guidance, photo analysis, subscriptions, rewards, referrals, and richer analytics.

## 2. Complete Tech Stack

- Framework: Next.js 14 App Router.
- Language: TypeScript.
- Frontend: React 18.
- Styling: Tailwind CSS and global CSS in `styles/globals.css`.
- Typography: Cormorant Garamond for editorial display headings and Plus Jakarta Sans for body/UI.
- Icons: `lucide-react`.
- Animation: Framer Motion and CSS transitions.
- State management: Zustand stores in `lib/store`.
- Auth: Firebase Authentication plus backend OAuth/session helpers.
- Database: Cloud Firestore.
- Hosting: Firebase App Hosting.
- Backend: Firebase Functions v2, Express API under `backend/`.
- Email: Resend through Firebase Functions.
- AI chat: Groq API through backend `/chat`.
- Social feed: Instagram, YouTube, and Threads server-side feed routes/functions. Platform availability depends on live tokens/permissions.
- SEO: Next.js metadata API, route-specific metadata, sitemap, robots, JSON-LD schemas.
- Analytics: Google Analytics 4 via `components/shared/GoogleAnalytics.tsx`.
- Image handling: Next Image where useful and `components/shared/SafeImage.tsx` for graceful placeholders.
- Deployment: Firebase CLI, App Hosting, Functions, Firestore rules/indexes.

## 3. Complete Project Structure

Active app root is the repository root. Do not treat `frontend/` or `legacy-root-app/` as the active app; they are historical/reference mirrors.

- `app/`: Active Next.js routes.
- `app/admin/`: Protected admin dashboard routes.
- `app/account/`: Customer account dashboard, orders list, order details.
- `app/api/`: Next API routes for social, auth, products, settings, reviews, chat/contact.
- `app/shop/`: Shop listing and product detail pages.
- `app/skin-analysis/`: Skin Analysis and Routine Builder UI.
- `components/admin/`: Admin shell, pages, tables, forms, status badges.
- `components/home/`: Homepage sections.
- `components/layout/`: Navbar, footer, announcement bar, admin chrome hider.
- `components/product/`: Product card/grid/detail components.
- `components/providers/`: Client bootstrap and toast provider.
- `components/ui/`: Account menu, cart drawer, chat bot, login modal, search overlay, confirm dialog.
- `components/shared/`: Safe image, brand logo, star rating, Google Analytics.
- `lib/admin/`: Admin auth, Firestore utilities, types, formatting, external channel metadata.
- `lib/data/`: Static fallback content for products/blogs/reviews/routines/settings/social/hero/internal links.
- `lib/firebase/`: Firebase client and Firestore service helpers.
- `lib/store/`: Zustand stores.
- `lib/orders/`, `lib/returns/`, `lib/delivery/`, `lib/skin-analysis/`: Domain helpers.
- `backend/`: Firebase Functions Express backend.
- `public/`: Static images and manifest.
- `scripts/`: Firestore seed helper and old crop/reference scripts.
- `docs/`: This documentation pack.

## 4. Feature Inventory

### Homepage

Purpose: create a premium first impression and guide product discovery.

Important files:
- `app/page.tsx`
- `components/home/HeroCarousel.tsx`
- `components/home/BestSellers.tsx`
- `components/home/CategoryFilter.tsx`
- `components/home/ConcernFilter.tsx`
- `components/home/RoutineStrip.tsx`
- `components/home/ReviewsSection.tsx`
- `components/home/SocialFeedStrip.tsx`
- `components/home/BlogPreview.tsx`
- `components/home/FaqSection.tsx`
- `components/home/ClinicalSkincareSection.tsx`

How it works: homepage pulls Firestore-first products with local fallback and renders sections for hero, best sellers, categories, concerns, routines, reviews, social content, blog previews, FAQ, and clinical education.

Future improvements: A/B test hero CTAs, add payment-linked promotions, add dynamic merchandising from admin settings.

### Shop

Purpose: all-product discovery with filters.

Important files:
- `app/shop/page.tsx`
- `components/shop/ShopPageClient.tsx`
- `components/product/ProductGrid.tsx`
- `components/product/ProductCard.tsx`
- `lib/firebase/products.ts`

Supports filters for bestsellers, category, concern, routine, availability, sorting, and search-like filtering. It must never render blank; static products are fallback when Firestore is unavailable.

### Product Pages

Purpose: conversion-focused PDPs with SEO and trust content.

Important files:
- `app/shop/[slug]/page.tsx`
- `components/product/ProductDetail.tsx`
- `lib/data/internalLinks.ts`
- `lib/productAvailability.ts`

Includes product gallery, stock logic, add to cart, wishlist, delivery estimate, trust sections, ingredients, how-to-use, FAQ, reviews, related blogs, related products, metadata, Product JSON-LD, breadcrumbs, and graceful missing-image handling.

### Wishlist

Purpose: save products and move them to cart.

Important files:
- `app/wishlist/page.tsx`
- `app/wishlist/WishlistClient.tsx`
- `lib/store/wishlistStore.ts`

Wishlist is a dedicated page, not only account dashboard. It persists locally for guests and syncs to Firestore for logged-in users. Deduplication is Set-based.

### Cart and Checkout

Purpose: cart review, delivery/address validation, and order placement.

Important files:
- `app/cart/page.tsx`
- `components/ui/CartDrawer.tsx`
- `lib/store/cartStore.ts`
- `lib/firebase/orders.ts`
- `lib/delivery/estimate.ts`

Supports guest cart, logged-in Firestore cart, safe merge, quantity controls, remove-on-minus-at-one, recommendations, free gift threshold messaging, checkout validation, and pending order creation. Payment is intentionally not connected.

### Authentication

Purpose: secure customer identity.

Important files:
- `components/ui/LoginModal.tsx`
- `components/providers/ClientBootstrap.tsx`
- `lib/store/authStore.ts`
- `app/api/auth/*`
- `backend/index.js`

Supports Firebase Auth, Google, Facebook, OTP/mobile, email/password, password reset, profile sync, logout cleanup, and account dashboard state.

### Account Dashboard

Purpose: customer overview.

Important files:
- `app/account/page.tsx`
- `app/account/AccountClient.tsx`
- `app/account/orders/page.tsx`
- `app/account/orders/OrdersClient.tsx`
- `app/account/orders/[orderId]/OrderDetailsClient.tsx`

Dashboard shows profile/contact/address/wishlist/order overview and Skin Health. Orders are on `/account/orders`. Order details use Firestore document ID.

### Orders

Purpose: track post-purchase lifecycle.

Important files:
- `lib/firebase/orders.ts`
- `lib/firebase/customerOrders.ts`
- `lib/orders/status.ts`
- `components/admin/OrdersAdmin.tsx`

Orders are created atomically as root order and customer mirror. Admin status changes update both root order and mirror. Customers cannot update order records directly.

### Returns

Purpose: attach return requests to completed/eligible orders.

Important files:
- `lib/firebase/returns.ts`
- `lib/returns/status.ts`
- `components/admin/ReturnsAdmin.tsx`
- `app/account/orders/[orderId]/OrderDetailsClient.tsx`

Customers create own return requests; admins approve/reject/receive/refund. Invalid transitions are prevented.

### Admin Dashboard

Purpose: operational control center.

See `docs/ADMIN_GUIDE.md`.

### Search

Purpose: product discovery overlay.

Important files:
- `components/ui/SearchOverlay.tsx`
- `components/layout/Navbar.tsx`
- `lib/firebase/products.ts`

Search finds products by name, category, concern, and ingredients. It is local/client-side against available product catalog.

### Blogs

Purpose: education, SEO, internal linking.

Important files:
- `lib/data/blogs.ts`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`

Blog pages include SEO, internal product links, related reading/product connections, article content, and metadata.

### SEO

Purpose: organic discoverability and rich results.

See `docs/SEO_DOCUMENTATION.md`.

### Email

Purpose: transactional updates.

See `docs/API_DOCUMENTATION.md` and `docs/FIREBASE_SETUP.md`.

### Social Feed

Purpose: show real/fallback social content.

Important files:
- `components/home/SocialFeedStrip.tsx`
- `app/api/social/*`
- `backend/socialFeed.js`

Frontend should not expose platform tokens. Empty platform responses must not crash the page.

### Skin Analysis and Routine Builder

Purpose: guided quiz that builds a routine and saves progress over time.

Important files:
- `app/skin-analysis/SkinAnalysisClient.tsx`
- `lib/skin-analysis/recommendations.ts`
- `lib/skin-analysis/score.ts`
- `lib/firebase/skinAnalysis.ts`
- `app/account/AccountClient.tsx`

Guests can use the quiz and save local history. Logged-in users save analysis history to `customers/{uid}/skinAnalyses`. Account dashboard shows latest score/history/comparison. Recommendation engine is separate from score/history.

## 5. Admin Panel

Admin routes:
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/inventory`
- `/admin/customers`
- `/admin/coupons`
- `/admin/reviews`
- `/admin/analytics`
- `/admin/returns`
- `/admin/settings`
- `/admin/maintenance`
- `/admin/external-channels`

Admin UI should remain clean, dense, professional, and not reuse customer chrome. `AdminChromeHider` prevents customer nav/footer visual leakage.

## 6. Customer Journey

1. Homepage introduces brand, product hero, best sellers, routines, reviews, social proof, blogs, and FAQs.
2. Customer enters shop through hero CTA, best seller card, nav, search, category, concern, routine, or blog link.
3. Shop filters products and opens product detail.
4. Product page explains benefits, ingredients, trust, delivery estimate, reviews, related content, and add-to-cart/wishlist.
5. Wishlist stores consideration items.
6. Cart validates quantity, stock, latest price, and address/login readiness.
7. Checkout creates pending order. Payment is currently postponed.
8. Order appears in Account Orders immediately.
9. Order detail shows timeline, delivery estimate, cancellation eligibility, and return eligibility.
10. Admin accepts/rejects/updates order.
11. Email events notify customer/admin when configured.
12. Customer requests return from order detail where eligible.

## 7. Product System

Product system is Firestore-first with static fallback.

Key principles:
- Slugs are stable and SEO-sensitive.
- Firestore product document IDs should match slugs.
- Do not duplicate products with same slug.
- Product image fields can be empty; SafeImage handles placeholders.
- Product card, PDP, search, cart, wishlist, orders, and admin should use the same canonical product names.
- Static product data is fallback and seed source, not the long-term operational catalog.

Current product slugs:
- `acne-reset-serum`
- `clear-cleanse-face-wash`
- `deep-pigmentation-cream`
- `barrier-restore-gel`
- `shield-spf-50-sunscreen`

## 8. SEO

Implemented SEO includes metadataBase, canonical URLs, Open Graph, Twitter cards, sitemap, robots, product/blog/page metadata, JSON-LD schemas, internal linking, product FAQ, image alt text, and Google Search Console verification. Do not rework SEO casually.

## 9. Firebase

Firebase roles:
- App Hosting serves Next app.
- Functions serve backend API.
- Firestore stores operational data.
- Auth handles user identity.
- Secret Manager/App Hosting secrets store sensitive keys.

Security rules are in `firestore.rules` and must be deployed after changes.

## 10. Email System

Emails are sent from backend Functions through Resend. Sender should remain `CLINVARA <noreply@clinvara.global>`. Forgot password is Firebase Auth email, not a custom Resend template.

## 11. UI / UX

Design philosophy:
- Premium, minimal, clinical, editorial.
- Avoid loud gradients and oversized template sections.
- Use Cormorant Garamond for display headings and Plus Jakarta Sans for UI/body.
- Cards should be compact, consistent, and mobile-safe.
- Buttons should be clear and conversion-oriented.
- Use professional toast/modal interactions, not browser alerts.
- Mobile must avoid horizontal overflow.

## 12. Blog System

Blog data lives in `lib/data/blogs.ts`. Blog pages render route-specific metadata and article content. Blog/product internal linking is implemented; preserve actual links.

## 13. Search

Search overlay uses local product data and supports product name/category/concern/ingredient discovery. Do not introduce external search unless necessary. Future search can move to Algolia/Typesense when catalog scales.

## 14. Security

Core rules:
- Admin-only writes for products/settings/coupons/order status/review moderation/external channels.
- Customers read own profile/orders/cart/wishlist/skin analyses.
- Customer order mirrors are not customer-writable.
- Returns can be created by the owning customer only, status managed by admin.
- Never expose server tokens to browser.

## 15. Performance

Current strategy:
- Server components where practical.
- Firestore-first with fallback and reasonable fetch usage.
- Safe images and placeholders.
- Client stores only where interactive flows require them.
- Avoid N+1 reads in admin analytics/inventory.

Future improvements: caching strategy, monitoring, image CDN/storage workflow, automated bundle analysis.

## 16. Documentation

Important existing docs:
- `README.md`
- `PROJECT_STRUCTURE.md`
- `FIREBASE_DEPLOY.md`
- `EMAIL_SETUP.md`
- `scripts/SEED_PRODUCTS_FIRESTORE.md`
- `backend/README.md`
- new `/docs` pack.

## 17. Current Project Status

Completed:
- Customer storefront.
- Product catalog.
- Admin dashboard.
- Auth.
- Cart/wishlist.
- Orders/returns.
- Email foundation.
- Social feed foundation.
- SEO.
- Skin analysis and history.

Pending:
- Payment gateway.
- Real shipping/courier integration.
- Marketplace real APIs.
- Admin image upload.
- Strong automated test suite.
- Production monitoring/error reporting.

Intentionally postponed:
- Razorpay/payment flow.
- Courier APIs.
- Marketplace credentials.
- Full AI/photo skin analysis.

## 18. Future Roadmap

Short term:
- Payment integration.
- Admin product image upload.
- Invoice generation.
- Coupon application during checkout.
- Production monitoring.

Medium term:
- Courier tracking.
- Marketplace integrations.
- Review submission flow improvements.
- Referral/rewards.
- Email automation hardening.

Long term:
- AI skin advisor.
- Photo analysis.
- Subscriptions.
- Loyalty/rewards.
- Inventory forecasting.
- Multi-channel marketplace operations.

## 19. Known Limitations

- Payment is not integrated.
- Social APIs depend on valid platform tokens and permissions.
- Product images are static local assets, not admin-uploaded storage assets.
- External channels are foundation-only.
- Delivery estimates are rules-based, not courier-synced.
- Automated tests are limited.
- Some legacy folders remain for reference and should not be used as active app.

## 20. Development Guidelines

- Read current code before changing.
- Prefer existing helpers/stores/components.
- Keep slugs stable.
- Keep Firestore rules in sync with data model.
- Use Firestore document ID for order routes.
- Run `npx tsc --noEmit` before commit.
- Do not run production build unless asked or doing release QA.
- Do not expose secrets.
- Do not casually modify SEO/schema files.
- Keep customer and admin UI separated.
- Preserve typography system.
- Keep changes targeted and reversible.

## 21. Project Memory for Future AI

Before writing code, remember:

- CLINVARA is a premium clinical skincare ecommerce brand, not a generic template.
- Active app is root, not `frontend/` or `legacy-root-app/`.
- Production domain is `clinvara.global`.
- Payment is intentionally not connected yet.
- Use Firestore-first data with static fallback.
- Product slugs are critical SEO/navigation identifiers.
- Firestore product document IDs should use slugs.
- Customer order detail routes use Firestore order document IDs, not public order IDs.
- Customer order mirrors are read-only for customers.
- Admin status changes must sync root order and customer mirror.
- Cart deletion must win over stale async saves.
- Wishlist must dedupe.
- Support email should be `clinvaraglobal@gmail.com`.
- Resend sender should be verified domain sender.
- The UI should stay premium, compact, minimal, and mobile-safe.
- Do not undo SEO/schema work unless fixing a verified issue.
- Do not hardcode social API tokens or call platform APIs from the browser.
- Admin pages should not show customer navbar/footer/announcement/chat.
- Use professional toasts/modals instead of browser alerts.
- Skin analysis recommendation logic, scoring, history, and persistence should remain modular.

Files to modify carefully:
- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/shop/[slug]/page.tsx`
- `lib/data/products.ts`
- `lib/firebase/products.ts`
- `firestore.rules`
- `backend/index.js`
- `backend/emailService.js`
- `components/layout/Navbar.tsx`
- `components/home/HeroCarousel.tsx`

## 22. Final Handover

CLINVARA is a mature pre-payment ecommerce codebase with strong customer UX, admin operations, Firebase architecture, SEO, and data modeling. The next senior developer should prioritize payment integration, operational hardening, automated tests, image upload/storage, courier integration, and production monitoring.

Do not restart architecture. Extend the current root app. Preserve the premium brand language, current route structure, Firestore-first approach, and admin/customer separation.
