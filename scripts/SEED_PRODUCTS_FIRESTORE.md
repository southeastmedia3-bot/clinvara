# Seed Firestore Products

The storefront now reads `products` from Firestore first and falls back to
`lib/data/products.ts` only when Firestore is empty or unavailable.

To seed the original four products safely with Firebase Admin SDK:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
node scripts/seed-products-firestore.mjs
```

PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
node scripts\seed-products-firestore.mjs
```

The script uses `firebase-admin` from the existing `backend` dependencies and
requires Application Default Credentials or a service account JSON with
Firestore write access.

It upserts products with the product `slug` as the Firestore document ID, so it
can be run again without creating duplicates.

Recommended Firestore document IDs:

- `1` or `niacinamide-10-zinc-serum`
- `2` or `nmf-ha-cleanser`
- `3` or `deep-pigmentation-cream`
- `4` or `ceramide-moisture`

Do not duplicate products with new random IDs unless the product is genuinely new.
If a product should disappear from the storefront without deleting history, set
`active` to `false` in the admin product form.
