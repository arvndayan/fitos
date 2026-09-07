import httpx
from app.core.config import get_settings

BASE = "https://api.nal.usda.gov/fdc/v1"

NUTRIENT_NAMES = {
    "Energy": "calories",
    "Protein": "protein",
    "Carbohydrate, by difference": "carbs",
    "Total lipid (fat)": "fat",
    "Fiber, total dietary": "fiber",
    "Sugars, total including NLEA": "sugar",
    "Fatty acids, total saturated": "saturatedFat",
    "Sodium, Na": "sodium",
    "Potassium, K": "potassium",
    "Cholesterol": "cholesterol",
    "Calcium, Ca": "calcium",
    "Iron, Fe": "iron",
}

def _nutrients(food: dict) -> dict:
    out = {v: None for v in NUTRIENT_NAMES.values()}
    for item in food.get("foodNutrients") or []:
        nutrient = item.get("nutrient") or {}
        name = nutrient.get("name") or item.get("nutrientName")
        key = NUTRIENT_NAMES.get(name)
        if not key:
            continue
        value = item.get("amount")
        if value is None:
            value = item.get("value")
        try:
            value = float(value)
        except (TypeError, ValueError):
            continue
        unit = (nutrient.get("unitName") or item.get("unitName") or "").upper()
        if key == "calories" and unit == "KJ":
            value = value / 4.184
        out[key] = round(value, 4)
    return out

def _map(food: dict) -> dict:
    desc = food.get("description") or food.get("lowercaseDescription") or "USDA food"
    data_type = food.get("dataType")
    brand = food.get("brandOwner") or food.get("brandName")
    barcode = food.get("gtinUpc")
    return {
        "id": f"usda:{food.get('fdcId')}",
        "source": "USDA FoodData Central",
        "sourceId": str(food.get("fdcId")),
        "name": desc.title() if desc.isupper() else desc,
        "brand": brand,
        "barcode": barcode,
        "category": food.get("foodCategory"),
        "preparation": None,
        "confidence": .96 if data_type in {"Foundation", "SR Legacy"} else .9,
        "aliases": [],
        "portions": [],
        "per100g": _nutrients(food),
    }

async def search_usda(query: str, limit: int = 15) -> list[dict]:
    settings = get_settings()
    if not settings.usda_enabled or not settings.usda_api_key:
        return []
    payload = {
        "query": query,
        "pageSize": min(max(limit, 1), 50),
        "dataType": ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(f"{BASE}/foods/search", params={"api_key": settings.usda_api_key}, json=payload)
        r.raise_for_status()
        data = r.json()
    return [_map(x) for x in data.get("foods", [])]

async def get_usda_food(fdc_id: str) -> dict | None:
    settings = get_settings()
    if not settings.usda_api_key:
        return None
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{BASE}/food/{fdc_id}", params={"api_key": settings.usda_api_key})
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return _map(r.json())
