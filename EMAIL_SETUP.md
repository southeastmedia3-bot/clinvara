# CLINVARA Email Setup

CLINVARA contact and order-status emails are sent server-side through Resend from Firebase Functions. Customer-facing forms still save safely if the email secret is not configured.

## Required Secret

Create the Resend API key secret in Firebase:

```bash
firebase functions:secrets:set RESEND_API_KEY --project clinvara-f6235
```

Paste the Resend API key when prompted.

## Optional Environment Values

- `CONTACT_TO_EMAIL`: defaults to `clinvaraglobal@gmail.com`
- `RESEND_FROM_EMAIL`: defaults to `CLINVARA <clinvaraglobal@gmail.com>`

For production, verify a sender domain in Resend and set `RESEND_FROM_EMAIL` to that verified sender.

## What Sends Email

- Contact form submissions are saved to Firestore `contactMessages` and emailed to `clinvaraglobal@gmail.com`.
- Admin order acceptance emails are sent when an admin accepts an order.
- Admin order rejection emails are sent when an admin rejects an order.

## Manual Test

1. Submit `/contact`.
2. Confirm the message appears in Firestore `contactMessages`.
3. Accept a test order in `/admin/orders`.
4. Reject a test order in `/admin/orders` with a reason.
5. Confirm customer emails are received.
