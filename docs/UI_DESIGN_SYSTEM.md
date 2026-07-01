# UI Design System

## Brand Direction

CLINVARA should feel:

- Premium.
- Clinical.
- Minimal.
- Editorial.
- Trustworthy.
- Modern skincare/ecommerce.

References: Aesop, Typology, Augustinus Bader, The Ordinary, Minimalist, Apple, Nykaa, Foxtale.

## Typography

- Display: Cormorant Garamond.
- Body/UI: Plus Jakarta Sans.

Use display type for hero/product/editorial headings. Use body type for navigation, forms, tables, product metadata, and admin UI.

## Colors

Use CSS variables in `styles/globals.css`.

Keep palette calm and clinical. Avoid loud gradients, neon effects, heavy shadows, or one-off colors unless status-specific.

## Spacing

- Use generous whitespace on premium customer pages.
- Use compact density for product cards/admin tables.
- Mobile spacing must prevent clipping and horizontal overflow.

## Buttons

Customer buttons:

- Rounded.
- Clear hierarchy.
- Subtle hover.
- Adequate touch targets.

Admin buttons:

- Practical, compact, clear.
- Destructive actions require confirmation.

## Cards

Customer cards:

- Consistent image ratios.
- Equal heights.
- Clear product title/price/CTA hierarchy.

Admin cards:

- Dense.
- Readable metrics.
- Soft borders.
- Minimal visual noise.

## Animation

Use subtle fade/translate/hover transitions. Avoid dramatic motion.

## Mobile Rules

- No horizontal overflow.
- Product titles can wrap to two lines.
- Touch targets must be comfortable.
- Cart/wishlist/search/account remain accessible.
- Sticky CTAs should not hide content.

## Accessibility

- Icon buttons need `aria-label`.
- Meaningful images need alt text.
- Product image placeholders should not create broken image requests.
- Dialogs/modals should be keyboard accessible where possible.

## Admin Design

Admin should feel like Shopify/Stripe/Vercel/Linear:

- Clean.
- Professional.
- Reduced heavy display font usage.
- Tables easy to scan.
- Status badges consistent.
- Metrics formatted consistently.
