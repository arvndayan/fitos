# FitOS v3 — integrated Nutrition Intelligence

This repository structure replaces the prior single-file prototype and the separate `fitos_phase1_nutrition` demo folder.

## Structure

```text
fitos/
├── index.html
├── css/
│   └── styles.css
├── data/
│   └── food-seed.js
├── js/
│   ├── app.js
│   ├── core/
│   │   ├── state.js
│   │   └── profile.js
│   ├── nutrition/
│   │   ├── food-parser.js
│   │   ├── food-search.js
│   │   └── nutrition-engine.js
│   └── training/
│       └── plans.js
└── README.md
```

## What changed
- Nutrition Intelligence is now part of the main FitOS Nutrition screen.
- Users can type inputs such as `3 eggs breakfast`, `150g cooked chicken breast`, `1 banana`, or `2 chapati`.
- Quantity, unit, meal and preparation are parsed automatically.
- Generic chicken asks for cut and then raw/cooked where needed.
- Food nutrition scales automatically from per-100g values.
- Local food search is attempted first.
- Open Food Facts is used as a packaged-food fallback.
- Food logs persist in `localStorage`.
- Profile targets, plans and weight logs remain integrated.

## Important production note
The bundled food seed is only a development fallback. Do not attempt to manually hard-code a production food catalog into the browser.

Next production step:
1. Add a backend API.
2. Add PostgreSQL.
3. Import/normalize USDA FoodData Central.
4. Add Indian food-composition datasets with licensing/source provenance.
5. Cache Open Food Facts branded products.
6. Move secrets/API keys to the backend.
7. Add authentication and cloud sync.

## Replacing the current repository
Delete the old standalone files/folder that are no longer needed:
- `app.js`
- `styles.css`
- `fitos_phase1_nutrition/`

Then copy the contents of this package into the repository root and commit everything.

GitHub Pages can serve this version directly because all imports use relative paths and ES modules.


## v4 Food Data Layer

The repository now includes a `backend/` FastAPI service with:
- PostgreSQL/SQLite support
- normalized food, aliases, nutrient, and portion tables
- USDA FoodData Central search
- Open Food Facts barcode lookup and packaged-food fallback
- external result caching
- Indian food CSV ingestion interface with provenance
- CORS configuration for the GitHub Pages frontend

The browser first searches the small local development seed, then the FitOS backend, then the legacy Open Food Facts browser fallback.

See `backend/README.md`.
