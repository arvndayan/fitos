"""
Import a licensed/approved Indian food-composition CSV into FitOS.

Expected columns:
canonical_name,aliases,category,preparation,source,source_id,
calories,protein,carbs,fat,fiber,sugar,saturated_fat,
sodium_mg,potassium_mg,cholesterol_mg,calcium_mg,iron_mg

aliases may be pipe-separated, e.g. "toor dal|arhar dal|kandi pappu".

Do NOT redistribute IFCT/other datasets until their licensing terms are confirmed.
"""
import csv, sys
from app.db.session import SessionLocal, Base, engine
from app.models.food import Food, FoodAlias, FoodNutrients

def f(row,key):
    v=(row.get(key) or "").strip()
    try:return float(v) if v else None
    except ValueError:return None

def main(path):
    Base.metadata.create_all(bind=engine)
    db=SessionLocal()
    try:
        with open(path,newline="",encoding="utf-8-sig") as fh:
            for row in csv.DictReader(fh):
                food=Food(
                    canonical_name=row["canonical_name"].strip(),
                    category=(row.get("category") or None),
                    preparation=(row.get("preparation") or None),
                    source=(row.get("source") or "Indian food source").strip(),
                    source_id=row["source_id"].strip(),
                    confidence=.93,
                )
                food.aliases=[FoodAlias(alias=x.strip(),locale="en-IN") for x in (row.get("aliases") or "").split("|") if x.strip()]
                food.nutrients=FoodNutrients(
                    calories=f(row,"calories"),protein=f(row,"protein"),carbs=f(row,"carbs"),
                    fat=f(row,"fat"),fiber=f(row,"fiber"),sugar=f(row,"sugar"),
                    saturated_fat=f(row,"saturated_fat"),sodium_mg=f(row,"sodium_mg"),
                    potassium_mg=f(row,"potassium_mg"),cholesterol_mg=f(row,"cholesterol_mg"),
                    calcium_mg=f(row,"calcium_mg"),iron_mg=f(row,"iron_mg")
                )
                db.add(food)
        db.commit()
    finally:
        db.close()

if __name__=="__main__":
    main(sys.argv[1])
