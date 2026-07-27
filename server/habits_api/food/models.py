from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class FoodDbEntry:
    name: str
    ref_grams: float
    calories: float
    carbs: float
    protein: float
    fat: float

    def scale(self, quantity_g: float) -> dict[str, float]:
        if self.ref_grams <= 0:
            factor = quantity_g / 100.0
        else:
            factor = quantity_g / self.ref_grams
        return {
            "calories": round(self.calories * factor, 2),
            "carbs": round(self.carbs * factor, 4),
            "protein": round(self.protein * factor, 4),
            "fat": round(self.fat * factor, 4),
        }


@dataclass
class FoodLogItem:
    row: int
    food: str
    quantity_g: float
    calories: float
    carbs: float
    protein: float
    fat: float


def parse_float(val: Any, default: float = 0.0) -> float:
    if val is None or val == "":
        return default
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return default


def is_placeholder_food(name: str) -> bool:
    n = name.strip().lower()
    return not n or n in ("...", "…", "-", "food")
