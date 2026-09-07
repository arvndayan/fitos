from pydantic import BaseModel, ConfigDict

class NutrientsOut(BaseModel):
    calories: float | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None
    fiber: float | None = None
    sugar: float | None = None
    saturatedFat: float | None = None
    sodium: float | None = None
    potassium: float | None = None
    cholesterol: float | None = None
    calcium: float | None = None
    iron: float | None = None

class PortionOut(BaseModel):
    unit: str
    amount: float = 1
    grams: float
    description: str | None = None

class FoodOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    source: str
    sourceId: str
    name: str
    brand: str | None = None
    barcode: str | None = None
    category: str | None = None
    preparation: str | None = None
    confidence: float = 0.8
    aliases: list[str] = []
    portions: list[PortionOut] = []
    per100g: NutrientsOut
