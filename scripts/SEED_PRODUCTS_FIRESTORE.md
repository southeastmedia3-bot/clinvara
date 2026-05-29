# Seed Firestore Products

The storefront now reads `products` from Firestore first and falls back to
`lib/data/products.ts` only when Firestore is empty or unavailable.

To seed the first product set safely:

1. Open `/admin/products` with an approved admin account.
2. Create or edit products using each product `slug` as the stable identity.
3. Keep document IDs stable by saving products with the existing `id` or `slug`.

Recommended Firestore document IDs:

- `1` or `niacinamide-10-zinc-serum`
- `2` or `nmf-ha-cleanser`
- `3` or `deep-pigmentation-cream`
- `4` or `ceramide-moisture`

Do not duplicate products with new random IDs unless the product is genuinely new.
If a product should disappear from the storefront without deleting history, set
`active` to `false` in the admin product form.
