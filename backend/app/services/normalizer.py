from app.models.food import Food

def model_to_public(food: Food) -> dict:
    n = food.nutrients
    return {
        "id": f"db:{food.id}",
        "source": food.source,
        "sourceId": food.source_id,
        "name": food.canonical_name,
        "brand": food.brand,
        "barcode": food.barcode,
        "category": food.category,
        "preparation": food.preparation,
        "confidence": food.confidence,
        "aliases": [a.alias for a in food.aliases],
        "portions": [
            {"unit": p.unit, "amount": p.amount, "grams": p.grams, "description": p.description}
            for p in food.portions
        ],
        "per100g": {
            "calories": n.calories if n else None,
            "protein": n.protein if n else None,
            "carbs": n.carbs if n else None,
            "fat": n.fat if n else None,
            "fiber": n.fiber if n else None,
            "sugar": n.sugar if n else None,
            "saturatedFat": n.saturated_fat if n else None,
            "sodium": n.sodium_mg if n else None,
            "potassium": n.potassium_mg if n else None,
            "cholesterol": n.cholesterol_mg if n else None,
            "calcium": n.calcium_mg if n else None,
            "iron": n.iron_mg if n else None,
        },
    }
