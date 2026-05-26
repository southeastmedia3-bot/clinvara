# Firebase App Hosting Deployment

The active frontend lives in `frontend/`, and the active backend lives in
`backend/`.

Deploy the frontend with Firebase App Hosting and the backend with Firebase
Functions.

## One-time setup

1. Log in:

```bash
npm run firebase:login
```

2. Create the App Hosting backend:

```bash
npm run firebase:backend:create
```

3. Add required production secrets in Firebase App Hosting or Secret Manager:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

The public Firebase web config is already in `apphosting.yaml`.

## Deploy

App Hosting deploys from GitHub. Push `main`, then run:

```bash
npm run firebase:deploy
```

Deploy backend Functions:

```bash
npm run backend:deploy
```

## Domain

After the backend is live, add your custom domain from Firebase Console:

Firebase Console -> App Hosting -> clinvara backend -> Settings -> Custom domain.

Then update OAuth providers with these production callback URLs:

```text
https://YOUR_DOMAIN/api/auth/oauth/callback/google
https://YOUR_DOMAIN/api/auth/oauth/callback/facebook
```

Also add your domain in Firebase Authentication authorized domains.
