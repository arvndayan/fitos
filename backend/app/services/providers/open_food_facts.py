import httpx
from app.core.config import get_settings

BASE = "https://world.openfoodfacts.org"

def n(v):
    try: return float(v)
    except (TypeError, ValueError): return None

def mg(v):
    x=n(v)
    return None if x is None else x*1000

def map_product(p: dict) -> dict:
    nutr = p.get("nutriments") or {}
    code = str(p.get("code") or "")
    return {
        "id": f"off:{code}",
        "source": "Open Food Facts",
        "sourceId": code,
        "name": p.get("product_name") or p.get("generic_name") or p.get("brands") or "Packaged food",
        "brand": p.get("brands"),
        "barcode": code or None,
        "category": (p.get("categories") or None),
        "preparation": None,
        "confidence": .82,
        "aliases": [],
        "portions": [],
        "per100g": {
            "calories": n(nutr.get("energy-kcal_100g")),
            "protein": n(nutr.get("proteins_100g")),
            "carbs": n(nutr.get("carbohydrates_100g")),
            "fat": n(nutr.get("fat_100g")),
            "fiber": n(nutr.get("fiber_100g")),
            "sugar": n(nutr.get("sugars_100g")),
            "saturatedFat": n(nutr.get("saturated-fat_100g")),
            "sodium": mg(nutr.get("sodium_100g")),
            "potassium": mg(nutr.get("potassium_100g")),
            "cholesterol": mg(nutr.get("cholesterol_100g")),
            "calcium": mg(nutr.get("calcium_100g")),
            "iron": mg(nutr.get("iron_100g")),
        }
    }

async def get_by_barcode(code: str) -> dict | None:
    settings=get_settings()
    if not settings.open_food_facts_enabled:
        return None
    headers={"User-Agent": settings.open_food_facts_user_agent}
    fields="code,product_name,generic_name,brands,categories,nutriments,serving_size"
    async with httpx.AsyncClient(timeout=15, headers=headers) as client:
        r=await client.get(f"{BASE}/api/v3/product/{code}.json", params={"fields":fields})
        if r.status_code==404:
            return None
        r.raise_for_status()
        data=r.json()
    p=data.get("product")
    return map_product(p) if p else None

async def legacy_text_search(query: str, limit: int = 10) -> list[dict]:
    # OFF's current docs recommend v3 for product reads. Full-text search is still
    # transitional; this legacy endpoint is kept only as a fallback for the prototype.
    settings=get_settings()
    if not settings.open_food_facts_enabled:
        return []
    headers={"User-Agent": settings.open_food_facts_user_agent}
    params={
        "search_terms":query,"search_simple":"1","action":"process","json":"1",
        "page_size":str(min(limit,20)),
        "fields":"code,product_name,generic_name,brands,categories,nutriments,serving_size"
    }
    async with httpx.AsyncClient(timeout=15, headers=headers) as client:
        r=await client.get(f"{BASE}/cgi/search.pl", params=params)
        r.raise_for_status()
        data=r.json()
    return [map_product(x) for x in data.get("products",[])]
