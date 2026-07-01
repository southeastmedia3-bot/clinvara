# Admin Guide

## Access

Admin is available at `/admin`.

Access requires:

- Firebase Auth sign-in.
- Firestore role: `users/{uid}.role === "admin"` or `customers/{uid}.role === "admin"`.
- Optional allowed email fallback via `NEXT_PUBLIC_ADMIN_EMAILS`.

## Layout

Files:

- `app/admin/layout.tsx`
- `components/admin/AdminShell.tsx`
- `components/admin/AdminSidebar.tsx`
- `components/admin/AdminTopbar.tsx`
- `components/admin/AdminGuard.tsx`

Admin pages should not show customer navbar/footer/announcement/chat.

## Dashboard

Route: `/admin`

File: `components/admin/AdminDashboard.tsx`.

Shows metrics and recent operational context.

## Products

Route: `/admin/products`

Files:

- `components/admin/ProductsAdmin.tsx`
- `components/admin/ProductForm.tsx`
- `lib/admin/firestore.ts`

Features:

- List products.
- Add/edit/delete products.
- Manage prices, category, concerns, badge, stock, active/availability, descriptions, ingredients, images, SEO fields.

## Orders

Route: `/admin/orders`

File: `components/admin/OrdersAdmin.tsx`.

Features:

- View orders.
- Search/filter.
- Accept/reject pending orders.
- Update status.
- Add notes/rejection reason.
- Sync root order and customer mirror via backend/admin operation.

## Inventory

Route: `/admin/inventory`

File: `components/admin/InventoryAdmin.tsx`.

Features:

- Low stock alerts.
- Critical/warning/healthy stock indicators.
- Fast/slow moving product calculations from orders.
- Inventory value.
- Product performance.
- Trends/charts where available.

## Customers

Route: `/admin/customers`

File: `components/admin/CustomersAdmin.tsx`.

Features:

- List customers/users.
- Search.
- View profile/order/address context where available.

## Coupons

Route: `/admin/coupons`

File: `components/admin/CouponsAdmin.tsx`.

Features:

- Create/edit/delete coupons.
- Enable/disable.
- Discount type/value/min order/expiry/usage limit fields.

## Reviews

Route: `/admin/reviews`

File: `components/admin/ReviewsAdmin.tsx`.

Features:

- View reviews.
- Approve/reject/delete spam.
- Filter by status.
- Reviews analytics: total, average, distribution, recent reviews, most reviewed, highest rated.

## Analytics

Route: `/admin/analytics`

File: `components/admin/AnalyticsAdmin.tsx`.

Features:

- Revenue/orders/customers/reviews/returns summaries.
- Empty states when Firestore is empty.

## Returns

Route: `/admin/returns`

File: `components/admin/ReturnsAdmin.tsx`.

Features:

- Return list.
- Return detail.
- Approve/reject/received/refunded.
- Prevent invalid transitions.

## Settings

Route: `/admin/settings`

File: `components/admin/SettingsAdmin.tsx`.

Fields:

- Store name.
- Support email/phone.
- Shipping charge.
- Free shipping threshold.
- Social links.
- Announcement text.
- Homepage banner text.

## Maintenance

Route: `/admin/maintenance`

File: `components/admin/MaintenanceAdmin.tsx`.

Tools:

- Reset orders.
- Reset returns.
- Reset reviews.
- Reset analytics cache.

Safety: requires typed `CONFIRM RESET` before execution.

## External Channels

Route: `/admin/external-channels`

File: `components/admin/ExternalChannelsAdmin.tsx`.

Foundation-only for:

- Amazon.
- Flipkart.
- Blinkit.
- Zepto.
- Swiggy Instamart.
- Flipkart Minutes.
- JioMart.
- BigBasket.

No real APIs connected yet.
