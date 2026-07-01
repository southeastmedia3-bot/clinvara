# CLINVARA Senior Developer Handover

## Executive Summary

CLINVARA is a mature Next.js/Firebase ecommerce codebase with a premium clinical skincare storefront, Firestore-first catalog, customer account flows, orders, returns, admin operations, SEO, email automation foundation, social feed foundation, and skin analysis/routine tracking.

The main missing launch-critical commerce feature is payment integration.

## Architecture Summary

- Frontend: Next.js 14 App Router, React, TypeScript, Tailwind.
- Backend: Firebase Functions Express API under `backend/`.
- Database: Cloud Firestore.
- Auth: Firebase Authentication.
- Hosting: Firebase App Hosting.
- Email: Resend via Functions.
- SEO: Next metadata, sitemap, robots, JSON-LD.
- State: Zustand.

Active code is root-level `app`, `components`, `lib`, `backend`. Ignore `frontend` and `legacy-root-app` unless using as historical reference.

## Current Business Goals

- Build trust as a clinical skincare brand.
- Convert visitors through education and product clarity.
- Support ecommerce operations through admin dashboard.
- Prepare for payment, shipping, marketplace scale, and AI-driven skincare guidance.

## Current Technical Goals

- Keep data Firestore-first.
- Preserve SEO and route stability.
- Keep customer and admin experiences separated.
- Maintain secure Firebase rules.
- Avoid exposing secrets.
- Build future features modularly.

## Implemented System Health

Strong areas:

- Storefront UX.
- Product catalog and fallback.
- Admin operational modules.
- Order/return modeling.
- SEO.
- Firebase rules.
- Email architecture.
- Skin analysis foundation.

Needs improvement:

- Payment.
- Courier tracking.
- Marketplace integrations.
- Automated tests.
- Monitoring.
- Image upload/storage workflow.

## Warnings

- Do not change slugs without redirects.
- Do not use public order IDs as route IDs.
- Do not let customers update order statuses.
- Do not call social APIs directly from browser.
- Do not commit API keys.
- Do not assume App Hosting deploy includes Functions deploy.
- Do not edit `frontend/` or `legacy-root-app/` as active app.

## Recommended Next Priorities

1. Payment gateway.
2. Invoice/PDF generation.
3. Courier integration.
4. Automated tests for cart/order/return/admin.
5. Admin image upload.
6. Production error monitoring.
7. Marketplace real integrations.

## Suggested Onboarding Path

1. Read `README.md`.
2. Read `docs/AI_CONTEXT.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Read `docs/DATABASE_STRUCTURE.md`.
5. Read `docs/ADMIN_GUIDE.md`.
6. Run app locally.
7. Inspect Firebase project/rules.
8. Smoke test customer and admin flows.

## Overall Health

Production readiness is high for a pre-payment storefront/admin system. It is not fully commerce-complete until payment, invoice, and shipping integrations are connected and tested.
