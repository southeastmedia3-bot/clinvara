# Firebase Setup

## Firebase Project

Project used by deployment scripts: `clinvara-f6235`.

Live domain: `https://clinvara.global`.

## Firebase Services

- Firebase App Hosting: Next.js frontend.
- Firebase Functions: backend Express API.
- Firebase Authentication: customer/admin identity.
- Cloud Firestore: operational data.
- Firebase Secret Manager/App Hosting secrets: server-only secrets.

## Important Files

- `.firebaserc`: project alias.
- `firebase.json`: App Hosting, Functions, Firestore config.
- `apphosting.yaml`: App Hosting env/secrets.
- `firestore.rules`: rules.
- `firestore.indexes.json`: indexes.
- `backend/package.json`: Functions package.
- `backend/index.js`: Express API.

## Local Firebase Config

Local web config comes from `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

These are public Firebase client config values, but still keep local env files out of git.

## Server Secrets

Use Firebase secrets or secure App Hosting environment configuration for:

- `AUTH_SECRET`
- OAuth secrets.
- `RESEND_API_KEY`
- `GROQ_API_KEY`
- Instagram/YouTube/Threads tokens.

Example secret command:

```bash
firebase apphosting:secrets:set RESEND_API_KEY --project clinvara-f6235
```

Functions secret attachment must match the environment variable name used in backend code.

## Deploy App Hosting

```bash
firebase deploy --only apphosting:clinvara-backend --project clinvara-f6235
```

or:

```bash
npm run firebase:deploy
```

## Deploy Functions

```bash
firebase deploy --only functions:backend --project clinvara-f6235
```

or:

```bash
npm run backend:deploy
```

## Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore --project clinvara-f6235
```

## Local Functions

```bash
npm --prefix backend install
npm run backend:serve
```

Set `NEXT_PUBLIC_API_BASE_URL` to local emulator function URL for local web testing.

## Admin Setup

Create a Firebase Auth user, then set admin role in Firestore:

- `users/{uid}.role = "admin"` or
- `customers/{uid}.role = "admin"`

Optionally add email to `NEXT_PUBLIC_ADMIN_EMAILS` for UI guard fallback.

## Common Firebase Issues

- App Hosting deploy does not deploy Functions automatically unless included in full Firebase deploy.
- Backend email changes require Functions deploy.
- Firestore rule changes require Firestore deploy.
- Secret values must be mounted to the runtime that uses them.
- OAuth redirect URLs must match live domain and local development domain.
