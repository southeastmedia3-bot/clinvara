# API Documentation

## API Surfaces

CLINVARA has two API surfaces:

1. Next.js API routes in `app/api`.
2. Firebase Functions Express API in `backend/index.js`.

## Backend Functions API

Base URL is configured through `NEXT_PUBLIC_API_BASE_URL`.

### Health

`GET /health`

Returns backend status.

### Contact

`POST /contact`

Stores contact messages and may send admin email.

### Social Feed

`GET /social/feed`

Returns merged social posts from supported platforms.

`GET /social/instagram-status`

Checks Instagram token/account status.

`GET /social/instagram-feed`

Returns Instagram feed data.

Separate exported function:

`getInstagramFeed`

### Order Tracking

`POST /orders/track`

Public lookup for order tracking with safe fields.

### Admin Order Update

`POST /orders/admin-update`

Admin/backend operation for accept/reject/status updates. Must sync root order and customer mirror.

### Customer Order Cancel

`POST /orders/customer-cancel`

Allows eligible customer cancellation. Must update root order and mirror.

### Admin Return Update

`POST /returns/admin-update`

Admin operation for return approve/reject/received/refunded transitions.

### Email Events

`POST /emails/event`

Client event bridge. Important events include:

- `order_placed`
- `order_confirmed`
- `order_shipped`
- `order_delivered`
- `order_cancelled`
- `return_requested`
- `return_approved`
- `refund_processed`
- `admin_new_order`
- `admin_new_return`

Frontend helper: `lib/email/events.ts`.

Backend sender/templates: `backend/emailService.js`.

### Chat

`POST /chat`

CLINVARA Assist route using Groq if configured. Must not expose API key to browser.

### OAuth

`GET /auth/session`

Reads backend session.

`GET /auth/oauth/:provider`

Starts Google/Facebook OAuth flow.

`GET /auth/oauth/callback/:provider`

OAuth callback handler.

## Next API Routes

Important routes:

- `app/api/products/route.ts`
- `app/api/settings/route.ts`
- `app/api/reviews/route.ts`
- `app/api/contact/route.ts`
- `app/api/chat/route.ts`
- `app/api/social/feed/route.ts`
- `app/api/social/instagram/route.ts`
- `app/api/social/youtube/route.ts`
- `app/api/social/threads/route.ts`
- `app/api/auth/*`

## API Security Rules

- Server tokens stay server-side.
- Do not call Instagram/Threads/YouTube APIs directly from browser.
- Admin mutations should verify admin role.
- Customer mutations should verify ownership.
- Order status changes should never be customer-writable through Firestore.

## Future APIs

Planned:

- Payment order creation/verification.
- Invoice generation.
- Courier tracking.
- Marketplace sync APIs.
- AI photo analysis.
- Subscription/reward/referral APIs.
