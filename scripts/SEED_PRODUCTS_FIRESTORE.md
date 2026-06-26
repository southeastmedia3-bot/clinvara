# Seed Firestore Products

The storefront now reads `products` from Firestore first and falls back to
`lib/data/products.ts` only when Firestore is empty or unavailable.

To seed the latest CLINVARA product catalog safely with Firebase Admin SDK:

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

- `niacinamide-10-zinc-serum`
- `nmf-ha-cleanser`
- `deep-pigmentation-cream`
- `ceramide-moisture`
- `shield-spf-50-sunscreen`

Do not duplicate products with new random IDs unless the product is genuinely new.
If a product should disappear from the storefront without deleting history, set
`active` to `false` in the admin product form.
