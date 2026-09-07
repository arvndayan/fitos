# FitOS Food Data Architecture

```text
GitHub Pages / future mobile app
        |
        v
FitOS Food API (FastAPI)
        |
        +--> PostgreSQL normalized food catalog
        |
        +--> USDA FoodData Central
        |
        +--> Open Food Facts
        |
        +--> approved Indian food composition imports
```

## Search order
1. Small browser seed for instant common-food matches.
2. FitOS backend database.
3. USDA + Open Food Facts provider queries.
4. Cache normalized provider results to FitOS DB.

## Identity separation
A generic canonical food and a branded/store product are not the same thing. The backend stores source/source_id/barcode and preserves provenance so future retailer-price records can be attached without corrupting nutrition identity.

## Indian foods
The import script is intentionally source-agnostic. Before importing IFCT or another Indian dataset into a commercial product, confirm redistribution/licensing terms. FitOS should preserve the original source name and source record ID.

## Retail prices
Do not put store price into `foods`. Future tables should be:
- retailers
- stores
- retailer_products
- store_prices (price, unit_price, checked_at, store_id)
