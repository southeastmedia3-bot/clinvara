# CLINVARA Project Structure

The project is now split into separate frontend and backend folders.

The old root-level Next.js app has been moved to `legacy-root-app/` as a
rollback archive. Active application code lives in `frontend/` and `backend/`.

## `frontend/`

Next.js website UI:

- pages and routes in `frontend/app`
- reusable UI in `frontend/components`
- browser Firebase Auth setup in `frontend/lib/firebase`
- public assets in `frontend/public`

The frontend no longer contains `app/api`. It calls the backend through:

```env
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:5001/clinvara-f6235/asia-south1/api"
```

Run locally:

```bash
npm run frontend:dev
```

## `backend/`

Firebase Functions API:

- `POST /chat`
- `POST /contact`
- `GET /auth/session`
- `GET /auth/oauth/google`
- `GET /auth/oauth/facebook`
- OAuth callback routes

Run locally:

```bash
cd backend
npm install
npm run serve
```

Deploy backend:

```bash
npm run backend:deploy
```

## Firebase

- Frontend: Firebase App Hosting from `frontend/`
- Backend: Firebase Functions from `backend/`
- Mobile OTP: Firebase Authentication, called directly from the frontend

Keep secrets out of git. Add production secrets in Firebase:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `AUTH_SECRET`
- `AUTH_BASE_URL`
- `FRONTEND_BASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `ALLOWED_ORIGINS`
