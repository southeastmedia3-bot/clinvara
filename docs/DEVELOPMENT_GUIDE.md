# CLINVARA Development Guide

## Core Rules

- Treat root app as active source.
- Read existing files before editing.
- Prefer existing helpers/components/stores.
- Keep changes targeted.
- Preserve SEO/schema unless explicitly fixing an SEO issue.
- Never commit secrets.
- Run `npx tsc --noEmit` before committing.

## Folder Conventions

- Routes: `app/<route>/page.tsx`.
- Client route UI: `app/<route>/<Name>Client.tsx`.
- Reusable customer UI: `components/<domain>`.
- Admin UI: `components/admin`.
- Firestore client helpers: `lib/firebase`.
- Admin Firestore helpers: `lib/admin`.
- Static fallback content: `lib/data`.
- Domain logic: `lib/<domain>`.
- Zustand stores: `lib/store`.

## Naming Conventions

- Product slugs are lowercase kebab-case and stable.
- Firestore product document IDs should match slugs.
- Order route param should be Firestore document ID.
- Component files use PascalCase.
- Helper files use camelCase or domain names.
- Status strings should map through `lib/orders/status.ts` or `lib/returns/status.ts`.

## Creating Pages

1. Add route under `app`.
2. Use server component for data when possible.
3. Move interactive UI to `Client` component if needed.
4. Add metadata for public pages.
5. Add links to navbar/footer/sitemap only if public and intended.

## Creating Components

1. Reuse existing button/card/table styles.
2. Keep mobile responsiveness.
3. Use semantic HTML.
4. Add accessible labels for icon-only buttons.
5. Avoid browser `alert`, `confirm`, or `prompt` for customer flows.

## Extending Firestore

1. Add helper in `lib/firebase` or `lib/admin`.
2. Update `firestore.rules`.
3. Add indexes if query requires it.
4. Keep customer/admin permissions separated.
5. Avoid N+1 queries.

## Extending Admin

1. Add route under `app/admin`.
2. Add module component under `components/admin`.
3. Add sidebar nav item in `AdminSidebar`.
4. Use `AdminGuard` and existing shell.
5. Use `AdminTable`, `AdminStatCard`, status badges, and formatting helpers.

## Extending Products

- Update `lib/data/products.ts` for fallback/seed source.
- Use product slug as stable identity.
- Add redirects if slug changes.
- Ensure `sitemap.ts`, internal links, search, and metadata still resolve.
- If adding image later, place it under `public/images/products` or migrate to storage with SafeImage support.

## Do's

- Use `SafeImage` for uncertain images.
- Use Firestore-first with local fallback.
- Use typed helpers and shared types.
- Preserve customer/admin chrome separation.
- Keep design premium, compact, and clear.

## Don'ts

- Do not edit `frontend/` or `legacy-root-app/` as active code.
- Do not expose tokens to browser.
- Do not use old product slugs without redirects.
- Do not let users update order statuses.
- Do not create duplicate data models.
- Do not redesign unrelated sections while fixing a bug.
