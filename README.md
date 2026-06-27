# CLINVARA Developer Handover

CLINVARA is a production-oriented clinical skincare ecommerce site built with Next.js, Firebase, Firestore, Firebase Authentication, Firebase Functions, and Firebase App Hosting.

Live site: https://clinvara.global

This document is the primary handover reference for developers. It explains how the project is structured, how to run it locally, how Firebase is used, what is already implemented, and how to safely extend the system.

## 1. Project Overview

CLINVARA supports a complete ecommerce customer journey:

- Homepage with hero content, best sellers, routines, reviews, blog previews, social feed, and SEO content.
- Firestore-first product catalog with static local fallback.
- Shop, filters, search, product detail pages, wishlist, cart, checkout, order history, order details, order tracking, cancellation, and returns.
- Firebase Auth login with Google, Facebook, email/password, password reset, and mobile OTP support.
- Admin dashboard for products, orders, inventory, customers, coupons, reviews, analytics, returns, settings, maintenance tools, and external channel foundations.
- Email automation through Firebase Functions and Resend.
- Social feed support for Instagram, YouTube, and Threads through server-side routes/functions.
- SEO and structured data for homepage, products, blogs, FAQs, breadcrumbs, organization, website, reviews, and sitemap/robots.

The active application lives at the repository root. The `frontend/` and `legacy-root-app/` folders are historical mirrors/archives and are not the active Firebase App Hosting root.

## 2. Technology Stack

| Area | Technology |
| --- | --- |
| Web framework | Next.js 14 App Router |
| Language | TypeScript |
| UI | React 18 |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Animation | Framer Motion |
| State | Zustand |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Backend API | Firebase Functions v2, Express |
| Hosting | Firebase App Hosting |
| Email | Resend via Firebase Functions |
| AI assistant | Groq API |
| Social feed | Instagram Graph/Basic Display, YouTube Data API, Threads API |
| Analytics | Google Analytics 4 |
| SEO | Next.js metadata, sitemap, robots, JSON-LD |

## 3. Folder Structure

```txt
clinvara/
  app/                         Active Next.js App Router routes
    admin/                     Protected admin dashboard routes
    account/                   Customer account, orders, order details
    api/                       Next.js API routes used by the web app
    blog/                      Blog list and detail pages
    cart/                      Cart and checkout flow
    shop/                      Shop listing and product detail pages
    wishlist/                  Dedicated wishlist page
    robots.ts                  Dynamic robots.txt
    sitemap.ts                 Dynamic sitemap.xml
    layout.tsx                 Root layout and global metadata
    page.tsx                   Homepage

  components/
    admin/                     Admin shell, tables, modules, forms
    home/                      Homepage sections
    layout/                    Navbar, footer, announcement bar
    product/                   Product cards, grid, PDP UI
    providers/                 Client bootstrap and toast provider
    shared/                    Brand logo, SafeImage, ratings, GA
    shop/                      Shop client UI
    ui/                        Account menu, cart drawer, login modal, search

  lib/
    admin/                     Admin auth, types, Firestore helpers, formatting
    api/                       API URL helper
    auth/                      Session helpers
    data/                      Static fallback catalog/content/config
    delivery/                  Delivery estimate helper
    email/                     Client event bridge to backend email API
    firebase/                  Firebase client and Firestore services
    hooks/                     Reusable hooks
    orders/                    Order status mapping
    returns/                   Return status mapping
    store/                     Zustand auth/cart/wishlist stores
    types.ts                   Shared domain types
    utils.ts                   Shared utilities

  backend/
    index.js                   Firebase Functions Express API
    emailService.js            Resend templates and send logic
    socialFeed.js              Server-side social feed normalization/fetching
    data/products.js           Backend product context for assistant
    package.json               Backend function dependencies/scripts

  public/                      Static assets
    images/products/           Product images

  scripts/
    seed-products-firestore.mjs Seed/upsert products into Firestore
    SEED_PRODUCTS_FIRESTORE.md  Seed instructions

  styles/                      Global style files
  firebase.json                Firebase App Hosting, Functions, Firestore config
  apphosting.yaml              Firebase App Hosting runtime config
  firestore.rules              Firestore security rules
  firestore.indexes.json       Firestore indexes
  .env.local.example           Local environment variable template
```

## 4. Local Setup

### Prerequisites

- Node.js compatible with the project dependencies.
- npm.
- Firebase CLI: `npm install -g firebase-tools`.
- Access to the Firebase project if you need real auth, Firestore, Functions, or deployment.

### Install dependencies

```bash
npm install
npm --prefix backend install
```

### Configure local environment

```bash
cp .env.local.example .env.local
```

Fill in local values. Never commit `.env.local`.

### Run the web app

```bash
npm run dev
```

Default local URL:

```txt
http://127.0.0.1:3000
```

### Run Firebase Functions locally

```bash
npm run backend:serve
```

Local API base usually follows this shape:

```txt
http://127.0.0.1:5001/<project-id>/asia-south1/api
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the local Functions emulator URL when testing backend routes locally.

## 5. Common Commands

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm run start
npm run backend:serve
npm run backend:deploy
npm run firebase:deploy
```

Important: `npm run build` is a production build command. Use it before release when appropriate, but it is not required for documentation-only changes.

## 6. Environment Variables

Do not expose API keys or secrets in source control. This section documents purpose only.

### Public web variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Firebase Functions Express API base URL |
| `NEXT_PUBLIC_SOCIAL_FEED_URL` | Server-side social feed endpoint |
| `NEXT_PUBLIC_INSTAGRAM_FEED_URL` | Instagram feed function endpoint |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated allowed admin emails for UI guard fallback |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app public API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase analytics measurement ID |

### Server-only variables and secrets

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Session signing secret for backend OAuth session cookie |
| `AUTH_BASE_URL` | Base URL used by OAuth/backend routes |
| `CONTACT_TO_EMAIL` | Destination email for contact/admin notifications |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth app ID |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth client secret |
| `INSTAGRAM_ACCESS_TOKEN` | Server-side Instagram feed token |
| `INSTAGRAM_USER_ID` | Instagram account/user identifier |
| `YOUTUBE_API_KEY` | YouTube Data API key |
| `YOUTUBE_CHANNEL_ID` | YouTube channel ID |
| `THREADS_ACCESS_TOKEN` | Threads feed token |
| `THREADS_USER_ID` | Threads user ID |
| `RESEND_API_KEY` | Resend transactional email API key |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `GROQ_API_KEY` | Groq API key for chat assistant |
| `GROQ_MODEL` | Groq model name |

Production secrets should be stored with Firebase Secret Manager or App Hosting secrets, not committed into the repository.

## 7. Firebase Architecture

Firebase is used for four major areas:

1. Firebase App Hosting serves the Next.js app from the repository root.
2. Firebase Functions serves the Express backend from `backend/`.
3. Firestore stores products, customers, carts, wishlists, orders, returns, reviews, settings, coupons, admin data, external channel foundation data, and contact messages.
4. Firebase Authentication handles customer and admin identity.

### Firebase configuration files

| File | Purpose |
| --- | --- |
| `firebase.json` | Defines App Hosting backend, Functions codebase, Firestore rules/indexes |
| `apphosting.yaml` | App Hosting runtime configuration and env/secret references |
| `.firebaserc` | Firebase project alias |
| `firestore.rules` | Firestore security policy |
| `firestore.indexes.json` | Firestore indexes |

### Active Firebase resources

- App Hosting backend ID: `clinvara-backend`.
- Functions codebase: `backend`.
- Functions region used in code: `asia-south1`.

## 8. Firestore Collections

| Collection | Purpose | Read/write model |
| --- | --- | --- |
| `products` | Firestore-first product catalog | Public read, admin write |
| `orders` | Root order records | Owner/admin read, admin update/delete |
| `customers/{uid}` | Customer profile/account data | Owner/admin read/write with role protection |
| `customers/{uid}/orders` | Customer order mirror | Owner/admin read, admin/backend writes |
| `customers/{uid}/cart` | Logged-in cart sync | Owner/admin read/write |
| `customers/{uid}/wishlist` | Logged-in wishlist sync | Owner/admin read/write |
| `users/{uid}` | User/admin role records | Owner/admin read, role protected |
| `returns` | Return requests and status | Customer create/read own, admin manage |
| `reviews` | Product reviews and moderation | Approved public read, admin moderation |
| `coupons` | Coupon configuration | Public read, admin write |
| `settings` | Storefront settings | Public read, admin write |
| `contactMessages` | Contact form messages | Backend create, admin read/update/delete |
| `analyticsCache` | Admin maintenance cache target | Admin only |
| `externalChannels` | Marketplace channel status foundation | Admin only |
| `externalChannelProducts` | Future channel product records | Admin only |
| `externalChannelInventory` | Future channel inventory records | Admin only |
| `externalChannelOrders` | Future channel order records | Admin only |
| `externalChannelRevenue` | Future channel revenue records | Admin only |
| `externalChannelReturns` | Future channel return records | Admin only |
| `externalChannelSettlements` | Future channel settlement records | Admin only |

## 9. Authentication

Customer auth uses Firebase Authentication and client-side state in `lib/store/authStore.ts`.

Implemented auth-related flows:

- Google sign-in.
- Facebook sign-in.
- Mobile OTP sign-in through Firebase Auth.
- Email/password account creation and login.
- Firebase password reset email flow.
- Auth bootstrap through `components/providers/ClientBootstrap.tsx`.
- Firestore customer profile synchronization.

Admin access is protected by `components/admin/AdminGuard.tsx` and `lib/admin/auth.ts`.
Access is based on Firestore admin roles or the allowed admin email fallback.

## 10. Customer Website Flow

### Homepage

Key files: `app/page.tsx`, `components/home/*`, `lib/data/heroSlides.ts`, `lib/firebase/products.ts`.

Homepage sections include hero carousel, best sellers, category/concern discovery, routines, reviews, social feed, blog preview, FAQ, clinical skincare content, and trust-oriented sections.

### Shop and Product Discovery

Key files: `app/shop/page.tsx`, `components/shop/ShopPageClient.tsx`, `components/product/ProductGrid.tsx`, `components/product/ProductCard.tsx`, `components/ui/SearchOverlay.tsx`.

Shop supports category, concern, best-seller, routine, search, and sorting logic. Products are loaded Firestore-first with local fallback.

### Product Detail Pages

Key files: `app/shop/[slug]/page.tsx`, `components/product/ProductDetail.tsx`, `lib/data/internalLinks.ts`.

Product pages include gallery/placeholder image handling, price/MRP, rating, stock state, add to cart, wishlist, trust badges, delivery estimate, ingredient accordions, FAQ, reviews, related reading, related products, metadata, and JSON-LD.

### Wishlist

Key files: `app/wishlist/page.tsx`, `app/wishlist/WishlistClient.tsx`, `lib/store/wishlistStore.ts`.

Wishlist has a dedicated `/wishlist` route and syncs to Firestore for logged-in users. Dedupe logic prevents duplicate wishlist entries.

### Cart and Checkout

Key files: `app/cart/page.tsx`, `components/ui/CartDrawer.tsx`, `lib/store/cartStore.ts`, `lib/firebase/orders.ts`.

Cart supports local persistence, Firestore sync, quantity controls, remove at quantity zero, latest price refresh, address validation, recommendations, free gift threshold messaging, and order creation.

Checkout currently creates pending orders. Payment gateway integration is not active.

### Orders and Returns

Key files: `app/account/orders/*`, `lib/orders/status.ts`, `lib/firebase/returns.ts`, `lib/returns/status.ts`.

Orders use Firestore document IDs as route params: `/account/orders/[orderId]`. Customers can view orders, details, timelines, delivery estimates, cancel eligible orders, and request returns from order details.

## 11. Admin Panel Modules

| Route | Module | Purpose |
| --- | --- | --- |
| `/admin` | Dashboard | Summary metrics and recent activity |
| `/admin/products` | Products | Product CRUD and catalog editing |
| `/admin/inventory` | Inventory | Stock, low stock, product performance, inventory intelligence |
| `/admin/orders` | Orders | Admin order review, accept/reject/status updates |
| `/admin/customers` | Customers | Customer listing and customer detail context |
| `/admin/coupons` | Coupons | Coupon CRUD |
| `/admin/reviews` | Reviews | Review moderation and review analytics |
| `/admin/analytics` | Analytics | Revenue/order/customer/review/return summaries |
| `/admin/returns` | Returns | Return management workflow |
| `/admin/settings` | Settings | Store settings, support data, social links, announcement text |
| `/admin/maintenance` | Maintenance | Reset tools with typed confirmation |
| `/admin/external-channels` | External Channels | Marketplace foundation and readiness cards |

Admin UI components live in `components/admin/`.

## 12. Email System

Email automation is handled by Firebase Functions and Resend.

Key files:

- `backend/emailService.js`
- `backend/index.js`
- `lib/email/events.ts`

Implemented email events:

- Order placed.
- Order confirmed.
- Order shipped/in transit.
- Order delivered.
- Order cancelled.
- Return requested.
- Return approved.
- Refund processed.
- Admin new order.
- Admin new return.

Forgot password is handled by Firebase Authentication password reset emails, not Resend.

Resend sender configuration uses `CLINVARA <noreply@clinvara.global>`.

Email diagnostics in Functions logs include `EMAIL_TRIGGERED`, `EMAIL_SERVICE_STARTED`, `RESEND_CLIENT_CREATED`, `EMAIL_SENT_SUCCESS`, and `EMAIL_SENT_FAILED`.

## 13. Backend Functions API

Primary backend file: `backend/index.js`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `POST` | `/contact` | Contact form storage and email |
| `GET` | `/social/feed` | Merged Instagram/YouTube/Threads feed |
| `GET` | `/social/instagram-status` | Instagram token status check |
| `GET` | `/social/instagram-feed` | Instagram feed payload |
| `POST` | `/orders/track` | Public order tracking lookup |
| `POST` | `/orders/admin-update` | Admin order status/decision update |
| `POST` | `/orders/customer-cancel` | Customer order cancellation |
| `POST` | `/returns/admin-update` | Admin return status update |
| `POST` | `/emails/event` | Client-triggered email events |
| `POST` | `/chat` | Groq-backed CLINVARA Assist |
| `GET` | `/auth/session` | Backend session cookie read |
| `GET` | `/auth/oauth/:provider` | Google/Facebook OAuth start |
| `GET` | `/auth/oauth/callback/:provider` | Google/Facebook OAuth callback |

Separate exported function: `getInstagramFeed`.

## 14. External Marketplace Architecture

The admin dashboard includes a foundation-only External Channels module.

Supported channel placeholders:

- Amazon
- Flipkart
- Blinkit
- Zepto
- Swiggy Instamart
- Flipkart Minutes
- JioMart
- BigBasket

Current state:

- No real marketplace APIs are connected.
- No credentials are required.
- UI displays professional "Not Connected", "Awaiting Seller Onboarding", and "No Data" states.
- Firestore-ready collection names and TypeScript types exist.

Future integrations should extend `lib/admin/externalChannels.ts` and `components/admin/ExternalChannelsAdmin.tsx`.

## 15. SEO Implementation

SEO work is implemented across `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/shop/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, and static content/policy pages.

Implemented SEO features:

- `metadataBase`.
- Route-specific metadata.
- Canonical URLs.
- Open Graph metadata.
- Twitter metadata.
- Google Search Console verification.
- Sitemap and robots.
- Homepage JSON-LD.
- Organization schema.
- Website schema.
- Product schema.
- FAQ schema.
- Breadcrumb schema.
- Review/aggregate rating schema where applicable.
- Product/blog internal linking.
- Product image alt text improvements.

Do not rewrite SEO unless a specific issue is found.

## 16. Product Catalog

Primary catalog source: `lib/data/products.ts`.

Firestore-first loader: `lib/firebase/products.ts`.

Admin product helpers: `lib/admin/firestore.ts`, `components/admin/ProductForm.tsx`, `components/admin/ProductsAdmin.tsx`.

Current local fallback products:

| Slug | Display name | Status |
| --- | --- | --- |
| `acne-reset-serum` | CLINVARA Acne Reset Serum (Powered by Acnesium) | Active |
| `clear-cleanse-face-wash` | CLINVARA Clear Cleanse (Anti-Acne Face Wash) | Active |
| `deep-pigmentation-cream` | Deep Pigmentation Cream | Active |
| `barrier-restore-gel` | CLINVARA Barrier Restore Gel (Ceramide Moisturizer) | Active |
| `shield-spf-50-sunscreen` | CLINVARA Shield SPF 50+ (Sunscreen) | Out of stock, no image yet |

Important catalog behavior:

- Firestore products override static fallback for matching slugs.
- Static fallback is merged in so new local catalog products can appear before Firestore is seeded.
- `lib/data/productBranding.ts` normalizes renamed product display names without changing slugs or document IDs.
- `SafeImage` renders placeholders for missing images.
- Product detail metadata filters empty image fields to avoid broken image URLs.

### Seeding products into Firestore

See `scripts/SEED_PRODUCTS_FIRESTORE.md` and `scripts/seed-products-firestore.mjs`.

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
node scripts\seed-products-firestore.mjs
```

Use slug as the Firestore document ID to avoid duplicates.

## 17. Security Considerations

- Never commit `.env.local`, API keys, OAuth secrets, Resend keys, service account JSON files, or raw Firebase secrets.
- Public `NEXT_PUBLIC_*` Firebase client config is not the same as server secrets, but environment handling should stay consistent.
- Admin write access is enforced by Firestore rules and admin guards.
- Customer order mirrors are read-only for customers.
- Root order status updates are admin/backend controlled.
- Returns can be created by customers only for their own orders; status updates are admin only.
- Products/settings/coupons/external channel data are admin-write only.
- Contact messages are backend-created and admin-managed.
- Maintenance reset tools require admin access and typed confirmation.
- Resend, Instagram, YouTube, Threads, Groq, OAuth, and AUTH secrets must stay in Firebase secrets or secure environment configuration.

## 18. Deployment

### Type check

```bash
npx tsc --noEmit
```

### Deploy App Hosting

```bash
npm run firebase:deploy
firebase deploy --only apphosting:clinvara-backend --project clinvara-f6235
```

### Deploy backend Functions

```bash
npm run backend:deploy
firebase deploy --only functions:backend --project clinvara-f6235
```

### Deploy Firestore rules/indexes

```bash
firebase deploy --only firestore --project clinvara-f6235
```

### Deploy everything configured in `firebase.json`

```bash
firebase deploy --project clinvara-f6235
```

Use full deploys carefully because they may deploy App Hosting, Functions, and Firestore configuration together.

## 19. Current Implemented Features

### Customer side

- Premium responsive homepage.
- Product discovery through homepage, shop, search, categories, concerns, and routines.
- Product cards with quick add, wishlist, rating, stock badges, and placeholders.
- Product detail pages with trust blocks, accordions, delivery estimates, mobile sticky add to cart, reviews, related reading, and related products.
- Dedicated wishlist page.
- Cart drawer and cart page with quantity controls, recommendations, free gift threshold messaging, address validation, and Firestore/local sync.
- Account dashboard with profile/contact/address/wishlist overview.
- Dedicated orders page and order details pages.
- Order tracking timeline.
- Customer cancellation for eligible order statuses.
- Return request flow attached to order details.
- Search overlay with product discovery.
- Mobile responsive layouts across customer flows.
- Toast/confirmation UI for customer feedback.
- AI chat assistant.
- Live/fallback social feed architecture.

### Admin side

- Protected admin shell and guard.
- Dashboard metrics.
- Products management.
- Inventory module with low stock and performance intelligence.
- Orders management with accept/reject/status updates.
- Customers list.
- Coupons management.
- Reviews moderation and analytics.
- Returns management.
- Analytics.
- Settings management.
- Maintenance reset tools with typed confirmation.
- External marketplace foundation module.
- Admin UI cleanup and table/card formatting improvements.

### Backend/platform

- Firebase App Hosting.
- Firebase Functions Express API.
- Firestore-first storefront data.
- Firestore rules for customer/admin separation.
- Resend email automation.
- Social feed server-side fetchers.
- Groq-backed chat route.
- SEO, sitemap, robots, and JSON-LD.

## 20. Placeholder or Foundation-Only Features

These exist as architecture/UI foundations but are not complete business integrations:

- Payment gateway/Razorpay is not connected.
- External marketplaces are not connected to real Amazon/Flipkart/Blinkit/Zepto/Swiggy/JioMart/BigBasket APIs.
- Courier/shipping API integration is not connected; delivery estimates are rule based.
- Invoice download may require final invoice/PDF generation integration depending on business requirements.
- Coupon helpers exist, but full payment-time coupon settlement depends on the future payment flow.
- Social feed depends on valid platform tokens and API permissions.

## 21. Pending Roadmap

Recommended future work:

1. Payment gateway integration.
2. Invoice generation.
3. Courier partner integration for real shipment tracking.
4. Marketplace API integrations.
5. Admin product image upload/storage workflow.
6. Coupon application in checkout/payment flow.
7. Email template polish and domain monitoring.
8. Automated tests for order/cart/wishlist/returns.
9. Error monitoring and production logging dashboard.
10. Periodic token refresh/health checks for social integrations.

## 22. Troubleshooting

### Product changes in admin are not visible on storefront

- Confirm the product exists in Firestore `products`.
- Confirm `active !== false`.
- Confirm slug is stable and unique.
- Confirm App Hosting was deployed if code changed.
- Clear browser cache if static assets changed.

### Product appears twice

- Check Firestore for duplicate documents with different IDs but the same slug.
- Use slug as document ID.
- Run the seed script only when it upserts by slug.
- Check `lib/firebase/products.ts` dedupe behavior.

### New product has no image

- This is supported. Leave image fields empty and `SafeImage` will render a placeholder.
- Do not point to non-existent image files.

### Email is not received

- Check Firebase Functions logs for `EMAIL_*` diagnostics.
- Confirm `RESEND_API_KEY` is mounted on the backend function.
- Confirm `RESEND_FROM_EMAIL` uses a verified Resend domain.
- Forgot password is sent by Firebase Auth, not Resend.

### Social feed is empty

- Check `/api/social/feed` or the backend `/social/feed` endpoint.
- Confirm platform tokens are valid.
- Instagram and YouTube can fail independently; Threads may still render.
- If all platforms fail, the frontend should show a clean fallback.

### Admin access denied

- Confirm the user is signed in.
- Confirm `users/{uid}.role == "admin"` or `customers/{uid}.role == "admin"`.
- Confirm `NEXT_PUBLIC_ADMIN_EMAILS` includes the admin email if using email fallback.
- Confirm Firestore rules are deployed.

### Cart or wishlist does not persist

- Guests use local storage.
- Logged-in users sync to `customers/{uid}/cart` and `customers/{uid}/wishlist`.
- Check Firestore rules and browser console for permission errors.

### Order detail route says not found

- Order detail routes use Firestore document ID, not public order ID.
- Correct path: `/account/orders/[orderId]`.

### Backend route works locally but not live

- App Hosting deployment does not automatically deploy `backend/` Functions.
- Deploy Functions separately: `firebase deploy --only functions:backend --project clinvara-f6235`.

## 23. Best Practices for Future Developers

- Treat the current root app as the active app.
- Do not deploy or edit `legacy-root-app/` unless intentionally using it as a reference.
- Keep product slugs stable because URLs, orders, reviews, and internal links use them.
- Use Firestore document IDs consistently for orders and product slugs.
- Keep customer data and admin data separated by rules and UI guards.
- Make small, targeted changes and run `npx tsc --noEmit` before committing.
- Do not expose server secrets in client components or `NEXT_PUBLIC_*` variables.
- Preserve existing SEO/schema work unless fixing a specific verified issue.
- Prefer existing helpers and stores before adding new abstractions.
- Keep missing image behavior graceful through `SafeImage`.
- For admin destructive actions, use styled confirmation and typed confirmation where appropriate.
- For email changes, update backend event wiring and verify Functions deployment.
- For marketplace work, extend the foundation rather than replacing it.

## 24. Support and Brand Contacts

- Public support email: [clinvaraglobal@gmail.com](mailto:clinvaraglobal@gmail.com)
- Customer care phone: `+91 72071 18111`
- Instagram: https://www.instagram.com/clinvaraglobal/
- Facebook: https://www.facebook.com/people/Clinvara-global/61590268716995/
- YouTube: https://www.youtube.com/channel/UCi5HxfxaBwjAGqXEbWT_QYQ

## 25. Quick Release Checklist

Before production release:

1. Confirm `.env.local` and service account files are not staged.
2. Run `npx tsc --noEmit`.
3. Run `npm run build` when doing a full release validation.
4. Deploy backend Functions if backend changed.
5. Deploy App Hosting if frontend/config changed.
6. Deploy Firestore rules/indexes if security rules changed.
7. Smoke test homepage, shop, PDP, cart, checkout, orders, returns, admin, email, and social feed.
8. Check Firebase Functions logs for email/backend errors.

---

Copyright 2026 CLINVARA. All rights reserved.
