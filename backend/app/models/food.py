from datetime import datetime
from sqlalchemy import String, Float, DateTime, Text, UniqueConstraint, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Food(Base):
    __tablename__ = "foods"
    id: Mapped[int] = mapped_column(primary_key=True)
    canonical_name: Mapped[str] = mapped_column(String(300), index=True)
    brand: Mapped[str | None] = mapped_column(String(250), nullable=True, index=True)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    preparation: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    source: Mapped[str] = mapped_column(String(80), index=True)
    source_id: Mapped[str] = mapped_column(String(160), index=True)
    barcode: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    source_updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    aliases: Mapped[list["FoodAlias"]] = relationship(back_populates="food", cascade="all, delete-orphan")
    nutrients: Mapped["FoodNutrients"] = relationship(back_populates="food", cascade="all, delete-orphan", uselist=False)
    portions: Mapped[list["FoodPortion"]] = relationship(back_populates="food", cascade="all, delete-orphan")
    __table_args__ = (
        UniqueConstraint("source", "source_id", name="uq_food_source_id"),
        Index("ix_food_name_brand", "canonical_name", "brand"),
    )

class FoodAlias(Base):
    __tablename__ = "food_aliases"
    id: Mapped[int] = mapped_column(primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id", ondelete="CASCADE"), index=True)
    alias: Mapped[str] = mapped_column(String(300), index=True)
    locale: Mapped[str | None] = mapped_column(String(20), nullable=True)
    food: Mapped[Food] = relationship(back_populates="aliases")

class FoodNutrients(Base):
    __tablename__ = "food_nutrients"
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id", ondelete="CASCADE"), primary_key=True)
    calories: Mapped[float | None] = mapped_column(Float, nullable=True)
    protein: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs: Mapped[float | None] = mapped_column(Float, nullable=True)
    fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    fiber: Mapped[float | None] = mapped_column(Float, nullable=True)
    sugar: Mapped[float | None] = mapped_column(Float, nullable=True)
    saturated_fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    sodium_mg: Mapped[float | None] = mapped_column(Float, nullable=True)
    potassium_mg: Mapped[float | None] = mapped_column(Float, nullable=True)
    cholesterol_mg: Mapped[float | None] = mapped_column(Float, nullable=True)
    calcium_mg: Mapped[float | None] = mapped_column(Float, nullable=True)
    iron_mg: Mapped[float | None] = mapped_column(Float, nullable=True)
    food: Mapped[Food] = relationship(back_populates="nutrients")

class FoodPortion(Base):
    __tablename__ = "food_portions"
    id: Mapped[int] = mapped_column(primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id", ondelete="CASCADE"), index=True)
    unit: Mapped[str] = mapped_column(String(80))
    amount: Mapped[float] = mapped_column(Float, default=1)
    grams: Mapped[float] = mapped_column(Float)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    food: Mapped[Food] = relationship(back_populates="portions")
