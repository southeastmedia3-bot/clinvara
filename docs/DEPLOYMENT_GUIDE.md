# Deployment Guide

## Local Setup

```bash
npm install
npm --prefix backend install
cp .env.local.example .env.local
npm run dev
```

## Validation

```bash
npx tsc --noEmit
npm run lint
```

For full production validation:

```bash
npm run build
```

Run build only when appropriate for release validation.

## App Hosting Deployment

```bash
firebase deploy --only apphosting:clinvara-backend --project clinvara-f6235
```

or:

```bash
npm run firebase:deploy
```

## Backend Functions Deployment

```bash
firebase deploy --only functions:backend --project clinvara-f6235
```

or:

```bash
npm run backend:deploy
```

## Firestore Rules and Indexes

```bash
firebase deploy --only firestore --project clinvara-f6235
```

## Full Deploy

```bash
firebase deploy --project clinvara-f6235
```

Use carefully. Confirm what changed before deploying everything.

## Secrets

Set server-only values with Firebase secrets/App Hosting secrets. Never commit `.env.local` or service account JSON.

Example:

```bash
firebase apphosting:secrets:set RESEND_API_KEY --project clinvara-f6235
```

## Rollback

Use Firebase console/App Hosting release history for frontend rollback where available. For code rollback:

1. Revert or checkout known-good commit.
2. Redeploy affected target.
3. If Firestore rules caused the issue, redeploy previous rules immediately.

## Deployment Checklist

1. `git status` clean except intended changes.
2. No secrets staged.
3. `npx tsc --noEmit`.
4. `npm run lint`.
5. `npm run build` for release QA.
6. Deploy Functions if backend changed.
7. Deploy App Hosting if frontend/config changed.
8. Deploy Firestore if rules/indexes changed.
9. Smoke test live homepage/shop/PDP/cart/orders/admin/email/social.

## Common Issues

- Email code changed but Functions not deployed.
- Firestore rules changed but not deployed.
- Secret exists but is not mounted to the runtime.
- OAuth redirect URI missing for live domain.
- Product changed in Firestore but static local fallback still shown due to empty/failed Firestore read.
