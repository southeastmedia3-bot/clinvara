# Testing Guide

## Required Command Checks

```bash
npx tsc --noEmit
npm run lint
```

For release builds:

```bash
npm run build
```

## Customer QA

### Homepage

- Hero images fit correctly.
- CTA links work.
- Best sellers show products.
- Social section never appears broken.
- Blog previews link correctly.
- FAQ expands if applicable.
- Mobile has no horizontal scroll.

### Shop

- `/shop` shows products.
- Best sellers filter works.
- Category filter works.
- Concern filter works.
- Search/sort work.
- Product cards are equal height.

### Product Detail

- Product image or placeholder displays.
- Product title/price/MRP/rating correct.
- Add to cart disabled if out of stock.
- Wishlist works.
- Accordions have content.
- Delivery estimate shows.
- Related reading/products links resolve.
- Metadata does not break route.

### Search

- Search opens from desktop/mobile.
- Finds product by name/category/concern/ingredient.
- Product links work.
- Empty state is clear.

### Wishlist

- Add product.
- Remove product.
- Move/add to cart.
- Refresh persists.
- Logout/login sync works.
- Empty state links to shop.

### Cart

- Add product.
- Increase/decrease quantity.
- Decrease at 1 removes item.
- Subtotal updates.
- Free gift progress updates.
- Checkout requires login/address/email.
- No stale deleted items reappear.

### Checkout/Orders

- Create test order.
- Root order exists.
- Customer mirror exists.
- Account orders show immediately.
- Order details route works on refresh.
- Timeline status displays.
- Cancellation works only for eligible statuses.

### Returns

- Return request starts from order details.
- Required fields validate.
- Customer sees return status.
- Admin status updates reflect to customer.

### Account

- Login/logout.
- Address add/edit/delete.
- Wishlist count.
- Orders button.
- Skin Health section.
- Mobile layout.

### Blog

- Blog list shows all published articles.
- Article pages render.
- Internal product links work.
- Mobile readability.

## Admin QA

- Non-admin cannot access `/admin`.
- Admin can access all modules.
- Products list/edit/save.
- Inventory metrics load.
- Orders accept/reject/status update.
- Returns approve/reject/received/refunded.
- Reviews approve/reject.
- Coupons CRUD.
- Settings save.
- Maintenance tools require `CONFIRM RESET`.
- External channels show foundation states.

## Email QA

- Forgot password sends Firebase email.
- Order placed event reaches backend.
- Admin new order event reaches backend.
- Return requested event reaches backend.
- Functions logs show email diagnostics.

## SEO QA

- `/robots.txt` works.
- `/sitemap.xml` works.
- Product page canonical correct.
- Blog page canonical correct.
- JSON-LD valid.
- No accidental noindex on public pages.

## Mobile Breakpoints

Check:

- 375px.
- 390px.
- 768px.
- 1024px.
- 1366px.
- 1440px.
- 1920px.

## Live Smoke Test

After deploy:

1. Homepage.
2. Shop.
3. Product detail.
4. Add to cart.
5. Wishlist.
6. Login.
7. Cart checkout until pending order.
8. Account orders.
9. Admin order update.
10. Return request.
