# Known Issues and Limitations

## Payment

Payment gateway is not integrated. Orders can be created, but online payment capture/verification is pending.

## Shipping

Delivery estimates are rule based. Real courier tracking is not connected.

## Marketplace Integrations

External channel admin module is foundation-only. No real Amazon/Flipkart/Blinkit/Zepto/Swiggy/JioMart/BigBasket APIs are connected.

## Product Image Management

Images are static files. Admin image upload/storage workflow is not implemented.

## Social Feeds

Instagram/YouTube/Threads feeds depend on valid tokens, permissions, and platform API availability. Fallback UI should prevent broken customer experience.

## Testing

There is no comprehensive automated integration/e2e test suite yet. Current validation relies on TypeScript, lint, manual QA, and production smoke tests.

## Legacy Folders

`frontend/` and `legacy-root-app/` remain in the repository. They are not active source but can confuse future developers.

## Email Reliability

Email architecture exists, but delivery depends on Resend key/domain configuration and Functions deployment. Add queue/retry later.

## Reviews

Review moderation and analytics exist. Real post-purchase review submission may need further workflow polish depending on launch needs.

## Analytics

Admin analytics use Firestore-derived calculations. Advanced event analytics and caching can be improved.

## Skin Analysis

Skin Analysis is rules-based and quiz-driven. It is not a medical diagnosis, not photo-based, and not AI-powered yet.

## Production Monitoring

Dedicated error monitoring/alerting is not fully implemented.

## Technical Debt

- Reduce confusion from archived folders.
- Add tests.
- Centralize more settings in Firestore/admin where useful.
- Add stricter validation schemas for backend request payloads.
- Add retry/queue behavior for emails.
