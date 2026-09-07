from sqlalchemy import or_, select, func
from sqlalchemy.orm import Session, selectinload
from app.models.food import Food, FoodAlias, FoodNutrients, FoodPortion
from app.services.normalizer import model_to_public

def search_db(db: Session, query: str, limit: int = 20) -> list[dict]:
    q = f"%{query.strip().lower()}%"
    stmt = (
        select(Food)
        .outerjoin(FoodAlias)
        .where(or_(
            func.lower(Food.canonical_name).like(q),
            func.lower(Food.brand).like(q),
            func.lower(FoodAlias.alias).like(q),
        ))
        .options(selectinload(Food.aliases), selectinload(Food.portions), selectinload(Food.nutrients))
        .distinct()
        .limit(limit)
    )
    return [model_to_public(x) for x in db.scalars(stmt).all()]

def get_by_barcode(db: Session, barcode: str):
    stmt = (
        select(Food)
        .where(Food.barcode == barcode)
        .options(selectinload(Food.aliases), selectinload(Food.portions), selectinload(Food.nutrients))
    )
    food = db.scalar(stmt)
    return model_to_public(food) if food else None

def upsert_external(db: Session, payload: dict) -> dict:
    source, source_id = payload["source"], str(payload["sourceId"])
    food = db.scalar(select(Food).where(Food.source == source, Food.source_id == source_id))
    if food is None:
        food = Food(
            canonical_name=payload["name"][:300],
            brand=(payload.get("brand") or None),
            category=payload.get("category"),
            preparation=payload.get("preparation"),
            source=source,
            source_id=source_id,
            barcode=payload.get("barcode"),
            confidence=float(payload.get("confidence", .8)),
        )
        db.add(food)
        db.flush()
    else:
        food.canonical_name = payload["name"][:300]
        food.brand = payload.get("brand") or None
        food.barcode = payload.get("barcode") or food.barcode
    if food.nutrients is None:
        food.nutrients = FoodNutrients(food_id=food.id)
    n = payload.get("per100g", {})
    food.nutrients.calories = n.get("calories")
    food.nutrients.protein = n.get("protein")
    food.nutrients.carbs = n.get("carbs")
    food.nutrients.fat = n.get("fat")
    food.nutrients.fiber = n.get("fiber")
    food.nutrients.sugar = n.get("sugar")
    food.nutrients.saturated_fat = n.get("saturatedFat")
    food.nutrients.sodium_mg = n.get("sodium")
    food.nutrients.potassium_mg = n.get("potassium")
    food.nutrients.cholesterol_mg = n.get("cholesterol")
    food.nutrients.calcium_mg = n.get("calcium")
    food.nutrients.iron_mg = n.get("iron")
    db.commit()
    db.refresh(food)
    return model_to_public(food)
