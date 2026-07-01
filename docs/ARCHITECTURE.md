# CLINVARA Architecture

CLINVARA is a Next.js App Router ecommerce application with Firebase App Hosting, Firebase Authentication, Cloud Firestore, and Firebase Functions.

## Active Application Boundary

The active application is the repository root:

- `app/`
- `components/`
- `lib/`
- `backend/`
- `public/`

`frontend/` and `legacy-root-app/` are historical/reference copies. Do not treat them as deployment roots unless intentionally restoring old code.

## Routing Architecture

App Router routes:

- `/`: homepage.
- `/shop`: product listing.
- `/shop/[slug]`: product detail.
- `/cart`: cart and checkout.
- `/wishlist`: dedicated wishlist.
- `/account`: account dashboard.
- `/account/orders`: customer orders.
- `/account/orders/[orderId]`: order detail.
- `/skin-analysis`: Skin Analysis and Routine Builder.
- `/blog`: blog listing.
- `/blog/[slug]`: blog article.
- `/track-order`: public tracking lookup.
- `/contact`, `/about-us`, `/our-values`, `/careers`, `/sustainability`.
- `/privacy-policy`, `/terms-and-conditions`, `/shipping-policy`, `/return-refund-policy`, `/faqs`.
- `/admin/*`: protected admin app.
- `/api/*`: Next.js API routes.

## Rendering and Data Flow

Products are Firestore-first:

1. Fetch Firestore `products`.
2. Normalize to shared `Product` type.
3. Merge/fallback with static `lib/data/products.ts`.
4. Use normalized catalog across homepage, shop, product detail, search, wishlist, cart, admin where applicable.

Orders:

1. Customer checkout creates root order and customer mirror atomically.
2. Customer order detail route uses Firestore document ID.
3. Admin status updates must update root order and mirror.
4. Email event triggers are dispatched from order status transitions.

Returns:

1. Customer creates return request from order details.
2. Admin manages return status.
3. Return status timeline maps through `lib/returns/status.ts`.

Skin analysis:

1. Quiz answers are processed by `lib/skin-analysis/recommendations.ts`.
2. Score is computed by `lib/skin-analysis/score.ts`.
3. Guests persist locally.
4. Logged-in users persist to `customers/{uid}/skinAnalyses`.

## Authentication

Firebase Authentication is source of truth for live user identity. `components/providers/ClientBootstrap.tsx` listens to auth changes and hydrates Zustand state. Customer profiles are synced in Firestore.

Admin authorization is based on Firestore role or allowed admin emails. Admin UI is wrapped by `AdminGuard`.

## State Management

Zustand stores:

- `lib/store/authStore.ts`: auth state, login/register modal state.
- `lib/store/cartStore.ts`: cart state, local/Firestore sync, delete-wins consistency.
- `lib/store/wishlistStore.ts`: wishlist state, local/Firestore sync, dedupe.

## Backend Architecture

Backend Functions live in `backend/`:

- `backend/index.js`: Express app, routes, OAuth, email events, social feed, chat.
- `backend/emailService.js`: Resend templates and sending.
- `backend/socialFeed.js`: social platform fetch/normalization.
- `backend/data/products.js`: backend product context.

Next API routes also exist in `app/api/` for app-local needs and social/auth compatibility.

## Firebase Architecture

- App Hosting: serves root Next app.
- Functions: serves backend Express API and Instagram feed function.
- Firestore: operational database.
- Auth: customer/admin identity.
- Secret Manager/App Hosting secrets: server-only configuration.

## SEO Architecture

SEO uses:

- Static and dynamic Next metadata.
- `app/sitemap.ts`.
- `app/robots.ts`.
- Product, blog, homepage JSON-LD.
- Canonical URLs and Open Graph/Twitter metadata.

## Reusable Component Relationships

- `Navbar` opens `SearchOverlay`, `CartDrawer`, `AccountMenu`, and links wishlist/cart/account.
- `ProductGrid` renders multiple `ProductCard`s.
- `ProductDetail` handles PDP content and uses SafeImage, StarRating, SizeSelector.
- Admin pages use `AdminShell`, `AdminSidebar`, `AdminTopbar`, `AdminTable`, `AdminStatCard`.
- `ToastProvider` supports polished user feedback.

## Extension Principles

- Add domain logic under `lib/<domain>`.
- Add Firestore reads/writes under `lib/firebase` or `lib/admin`.
- Add customer UI under route-specific `app` folders and reusable `components`.
- Add admin UI under `components/admin` and route under `app/admin`.
- Update Firestore rules whenever adding new writable data.
