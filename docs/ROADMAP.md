# CLINVARA Roadmap

## Short Term

### Payment Integration

Integrate Razorpay or chosen gateway. Required:

- Create payment order server-side.
- Verify payment signature.
- Update order payment status.
- Handle failed payments.
- Prevent duplicate order creation.

### Invoice Generation

Add downloadable invoices for completed/confirmed orders.

### Admin Image Upload

Move from static image paths toward Firebase Storage or a managed asset workflow.

### Coupon Checkout Application

Coupon data exists; full checkout application should be tied to payment/order totals.

### Production Monitoring

Add error logging, performance monitoring, and alerting.

## Medium Term

### Courier Integration

Integrate Shiprocket/Delhivery or similar for:

- Shipment creation.
- Tracking number.
- Real tracking timeline.
- Delivery estimates.

### Marketplace Integrations

Connect:

- Amazon.
- Flipkart.
- Blinkit.
- Zepto.
- Swiggy Instamart.
- Flipkart Minutes.
- JioMart.
- BigBasket.

### Review Submission

Improve authenticated post-purchase review submission.

### Rewards and Referral

Add loyalty points, referral codes, and account rewards.

### Email Automation Hardening

Add queue/retry strategy and template preview/testing.

## Long Term

### AI Skin Advisor

Expand chat and quiz into richer guided AI recommendations.

### Photo Analysis

Add optional user-uploaded photos with privacy controls and AI analysis.

### Subscriptions

Recurring skincare routine subscriptions.

### Advanced Analytics

Demand forecasting, cohort analytics, LTV, retention, and inventory prediction.

### Multi-Channel Operations

Admin panel evolves into central channel operations hub.

## Business Goals

- Increase conversion.
- Build trust around clinical skincare.
- Improve customer retention through routine tracking.
- Prepare marketplace expansion.
- Improve operational control through admin tools.

## Technical Goals

- Keep architecture modular.
- Add automated tests.
- Harden security.
- Improve observability.
- Keep Firestore rules aligned with features.
