# AI Context for CLINVARA

Read this before making any changes.

## Identity

CLINVARA is a premium clinical skincare ecommerce project for `https://clinvara.global`.

## Active Codebase

Active app is the repository root. Do not use `frontend/` or `legacy-root-app/` as active source.

## Core Instruction Memory

- Do not redesign unless asked.
- Do not modify SEO/schema unless explicitly required.
- Do not run `npm run build` if user says not to.
- Always verify the directory is `D:\User data\Desktop\clinvara` when working locally.
- Preserve Cormorant Garamond and Plus Jakarta Sans.
- Keep customer UI premium/minimal/clinical.
- Keep admin UI clean/professional/dense.
- Never expose secrets.
- Preserve Firebase Auth/Firestore/cart/wishlist/order/returns logic.

## Critical Architecture

- Firestore-first products with static fallback.
- Product slugs are stable and SEO-sensitive.
- Order details route uses Firestore document ID.
- Customer order mirror is read-only for customers.
- Admin order updates must sync root order and customer mirror.
- Cart async delete must win over stale saves.
- Wishlist must be deduped.
- Payment is not integrated.
- External marketplace module is foundation-only.
- Social feeds are server-side and token-protected.
- Skin analysis history saves under `customers/{uid}/skinAnalyses`.

## Important Files

- `app/layout.tsx`
- `app/page.tsx`
- `app/shop/page.tsx`
- `app/shop/[slug]/page.tsx`
- `app/cart/page.tsx`
- `app/account/AccountClient.tsx`
- `app/account/orders/[orderId]/OrderDetailsClient.tsx`
- `app/skin-analysis/SkinAnalysisClient.tsx`
- `components/layout/Navbar.tsx`
- `components/product/ProductCard.tsx`
- `components/product/ProductDetail.tsx`
- `components/admin/*`
- `lib/data/products.ts`
- `lib/firebase/products.ts`
- `lib/firebase/orders.ts`
- `lib/firebase/returns.ts`
- `lib/store/cartStore.ts`
- `lib/store/wishlistStore.ts`
- `firestore.rules`
- `backend/index.js`
- `backend/emailService.js`

## Do Not Casually Touch

- SEO/schema files.
- `firestore.rules` without understanding access impact.
- Product slugs/redirects.
- Order status sync.
- Auth bootstrap.
- Cart/wishlist stores.
- Backend secret handling.

## Validation

Preferred checks:

- `npx tsc --noEmit`
- `npm run lint`

Build only when appropriate or requested.

## Current Feature State

Implemented:

- Storefront, shop, PDP, search, cart, wishlist.
- Auth and account.
- Orders and returns.
- Admin dashboard.
- Product/admin/inventory/review/analytics/maintenance/external channel foundations.
- Email foundation.
- Social feed.
- SEO.
- Skin analysis routine/history.

Pending:

- Payment.
- Courier.
- Marketplace APIs.
- Admin image upload.
- Automated tests.

## Response Style for Future AI

Be concise but clear. For code tasks, implement and verify. For documentation tasks, be thorough. Always protect user changes and do not revert unrelated work.
