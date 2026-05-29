# CLINVARA Backend

Firebase Functions backend for CLINVARA.

## Endpoints

- `GET /health`
- `GET /social/feed`
- `POST /contact`
- `POST /chat`
- `GET /auth/session`
- `GET /auth/oauth/google`
- `GET /auth/oauth/facebook`
- `GET /auth/oauth/callback/google`
- `GET /auth/oauth/callback/facebook`

Mobile OTP is handled client-side by Firebase Authentication in the frontend.

## Local setup

```bash
cd backend
npm install
cp .env.example .env
npm run serve
```

Set `NEXT_PUBLIC_API_BASE_URL` in the frontend to your `api` Functions URL.
For the local emulator, that is usually:

```env
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:5001/clinvara-f6235/asia-south1/api"
```
