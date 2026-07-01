# Database Structure

Database: Cloud Firestore.

## `products/{slug}`

Purpose: Firestore-first product catalog.

Typical fields:

- `id`
- `slug`
- `name`
- `price`
- `mrp`
- `category`
- `concern`
- `concerns`
- `concernSlugs`
- `badge`
- `featured`
- `active`
- `stock`
- `lowStockThreshold`
- `availability`
- `description`
- `ingredients`
- `howToUse`
- `keyIngredients`
- `image`
- `imageHover`
- `gallery`
- `galleryAlt`
- `sizes`
- `rating`
- `reviewCount`
- `seoTitle`
- `seoDescription`
- `createdAt`
- `updatedAt`
- `sortOrder`

Document ID should be the slug.

## `customers/{uid}`

Purpose: customer profile and account data.

Fields may include:

- `uid`
- `email`
- `phone`
- `firstName`
- `lastName`
- `name`
- `pincode`
- `addresses`
- `checkoutEmail`
- `skinAnalysis.latest`
- `role` only for admin-marked customers, protected by rules.

Subcollections:

- `orders/{orderId}`
- `cart/{itemId}`
- `wishlist/{itemId}`
- `skinAnalyses/{analysisId}`

## `customers/{uid}/orders/{orderId}`

Purpose: customer-readable order mirror.

Customers can read but not write. Admin/backend writes status changes.

## `customers/{uid}/cart/{itemId}`

Purpose: logged-in cart persistence.

Item ID should represent product/size identity when possible.

## `customers/{uid}/wishlist/{itemId}`

Purpose: logged-in wishlist persistence.

Use product ID/slug identity to avoid duplicates.

## `customers/{uid}/skinAnalyses/{analysisId}`

Purpose: saved Skin Analysis history.

Fields:

- `answers`
- `result`
- `skinScore`
- `notes`
- `completedAt`
- `recommendationVersion`
- `createdAt`
- `updatedAt`

## `users/{uid}`

Purpose: user/admin role source and optional profile mirror.

Important field:

- `role: "admin"` for admins.

## `orders/{orderId}`

Purpose: root order record.

Fields include:

- `orderId` / `publicOrderId`
- `userId` / `uid` / `customerId`
- `customerName`
- `customerEmail`
- `customerPhone`
- `address`
- `products` / `items`
- `totalAmount`
- `paymentMethod`
- `paymentStatus`
- `orderStatus`
- `status`
- `adminDecision`
- `publicOrderStatus`
- timestamps such as `createdAt`, `updatedAt`, `confirmedAt`, `cancelledAt`.

## `returns/{returnId}`

Purpose: return requests.

Fields:

- `customerId`
- `orderId`
- `productId`
- `productName`
- `reason`
- `notes`
- `status`
- `createdAt`
- `updatedAt`

Allowed customer-created initial status: `requested`.

## `reviews/{reviewId}`

Purpose: submitted/reviewed product reviews.

Fields:

- `productId` / `productSlug`
- `productName`
- `reviewerName`
- `rating`
- `title`
- `body`
- `status`
- `createdAt`

Only approved reviews are public.

## `coupons/{couponId}`

Fields:

- `code`
- `discountType`
- `discountValue`
- `minimumOrderValue`
- `expiryDate`
- `usageLimit`
- `active`

## `settings/{settingId}`

Purpose: storefront/admin-configurable settings.

Common doc:

- `settings/store`

Fields can include store name, support email, phone, shipping charge, free shipping threshold, social links, announcement text, homepage banner text.

## `contactMessages/{messageId}`

Purpose: stored contact form messages.

Backend creates; admin reads/manages.

## External Channel Collections

Foundation-only, admin-only:

- `externalChannels`
- `externalChannelProducts`
- `externalChannelInventory`
- `externalChannelOrders`
- `externalChannelRevenue`
- `externalChannelReturns`
- `externalChannelSettlements`

## Indexes

Indexes live in `firestore.indexes.json`. Add indexes when Firestore complains about composite queries.

## Rules

Rules live in `firestore.rules`. Deploy after any rules change.
