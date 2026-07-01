# Component Documentation

## Layout Components

### `Navbar`

File: `components/layout/Navbar.tsx`

Purpose: main customer navigation, search/cart/wishlist/account actions, mobile drawer, shop links.

Relationships: opens `SearchOverlay`, `CartDrawer`, and account menu/login flows through stores.

### `Footer`

File: `components/layout/Footer.tsx`

Purpose: shared footer across customer pages with company links, policies, support email, phone, and socials.

### `AnnouncementBar`

File: `components/layout/AnnouncementBar.tsx`

Purpose: shared promotion strip using announcement/settings data.

### `AdminChromeHider`

File: `components/layout/AdminChromeHider.tsx`

Purpose: prevents customer chrome from showing on admin routes.

## Home Components

- `HeroCarousel`: premium homepage hero slides and product CTA.
- `BestSellers`: bestseller product cards.
- `CategoryFilter`: category discovery tiles.
- `ConcernFilter`: concern-based discovery.
- `RoutineStrip`: routine entry points.
- `ReviewsSection`: customer review/social trust display.
- `SocialFeedStrip`: social feed cards/fallback.
- `BlogPreview`: homepage blog articles.
- `FaqSection`: homepage FAQ.
- `ClinicalSkincareSection`: SEO/trust education content.
- `WhyChooseClinvara`: trust differentiators.
- `SkinConcernsSection`: concern education/discovery.

## Product Components

### `ProductCard`

Purpose: product listing card with image, badge, wishlist, rating, title, concern, price, quick add.

Important behavior: respects stock, title wrapping, SafeImage, quick cart/wishlist.

### `ProductGrid`

Purpose: responsive grid wrapper for product cards.

### `ProductDetail`

Purpose: PDP layout and purchase/content sections.

Includes gallery, stock, add to cart, wishlist, trust badges, delivery estimate, ingredients, FAQs, reviews, related content, and mobile sticky CTA.

### `SizeSelector`

Purpose: display/select available product sizes.

## UI Components

- `SearchOverlay`: product search and suggestions.
- `CartDrawer`: cart preview and quantity controls.
- `AccountMenu`: account/profile menu.
- `LoginModal`: sign-in/register/OTP/password reset UI.
- `ChatBot`: CLINVARA Assist UI.
- `ConfirmDialog`: styled confirmation modal.
- `Button`, `Badge`, `BackButton`: shared small UI primitives.

## Providers

- `ClientBootstrap`: auth, cart, wishlist, customer data bootstrapping.
- `ToastProvider`: toast messages.

## Shared Components

- `SafeImage`: image with fallback/placeholder.
- `BrandLogo`: CLINVARA wordmark/logo renderer.
- `StarRating`: rating display.
- `GoogleAnalytics`: GA4 script integration.

## Admin Components

- `AdminShell`: admin layout wrapper.
- `AdminSidebar`: module navigation.
- `AdminTopbar`: admin title/profile area.
- `AdminGuard`: admin authorization guard.
- `AdminTable`: reusable table shell.
- `AdminStatCard`: metric cards.
- `AdminDashboard`: overview module.
- `ProductsAdmin` and `ProductForm`: product management.
- `OrdersAdmin`, `OrderStatusBadge`: order management.
- `ReturnsAdmin`: returns workflow.
- `InventoryAdmin`: inventory intelligence.
- `ReviewsAdmin`: review moderation and analytics.
- `AnalyticsAdmin`: analytics summaries.
- `CustomersAdmin`, `CouponsAdmin`, `SettingsAdmin`, `MaintenanceAdmin`, `ExternalChannelsAdmin`.

## Usage Guidance

Reuse components rather than adding parallel implementations. If a component is customer-facing, ensure mobile responsiveness and accessible labels. If admin-facing, maintain dense, professional, Shopify/Stripe-like visual hierarchy.
