# FitOS Food Backend

This backend gives FitOS a real food-data layer instead of a browser-only hard-coded catalog.

## Providers
- **USDA FoodData Central** for generic, foundation, survey and branded foods.
- **Open Food Facts** for packaged product/barcode data.
- **Indian food import pipeline** for approved/licensed food-composition datasets.

USDA's official API requires a data.gov API key and explicitly says the key must not be publicly exposed. Keep it in `.env` on the backend, never in GitHub Pages code.

## Local start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# put your USDA key in .env
docker compose up -d          # optional if using PostgreSQL
uvicorn app.main:app --reload --port 8000
```

Then:
- `GET http://localhost:8000/health`
- `GET http://localhost:8000/api/v1/foods/search?q=salmon`
- `GET http://localhost:8000/api/v1/foods/search?q=paneer`
- `GET http://localhost:8000/api/v1/foods/barcode/<UPC>`

For a no-Postgres smoke test, set:
`DATABASE_URL=sqlite:///./fitos.db`

## Production
Deploy this backend separately (Render/Fly/Railway/AWS/etc.), point the frontend's `FITOS_API_BASE` at it, use PostgreSQL, and add migrations/auth/rate limiting before public launch.
