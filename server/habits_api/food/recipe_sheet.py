from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.models import is_placeholder_food, parse_float
from habits_api.google.sheets import read_range

RECIPES_DATA_RANGE = "B1:G30"
RECIPE_NAME_CELL = "B16:B16"


def _is_recipe_row_skipped(name: str) -> bool:
    n = name.strip().lower()
    return is_placeholder_food(name) or n in ("food", "save as", "total")


async def load_saved_recipe(settings: Settings, db: TokenDB) -> dict | None:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_recipes,
        RECIPES_DATA_RANGE,
    )

    name = "Saved recipe"
    name_rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_recipes,
        RECIPE_NAME_CELL,
    )
    if name_rows and name_rows[0] and name_rows[0][0]:
        n = str(name_rows[0][0]).strip()
        if n and n.lower() != "save as":
            name = n

    items: list[dict] = []
    totals: dict | None = None

    for row in rows:
        if not row or len(row) < 2:
            continue
        food = str(row[0]).strip() if row[0] else ""
        if food.lower() == "total":
            totals = {
                "quantity_g": parse_float(row[1] if len(row) > 1 else 0),
                "calories": parse_float(row[2] if len(row) > 2 else 0),
                "carbs": parse_float(row[3] if len(row) > 3 else 0),
                "protein": parse_float(row[4] if len(row) > 4 else 0),
                "fat": parse_float(row[5] if len(row) > 5 else 0),
            }
            break
        if _is_recipe_row_skipped(food):
            continue
        qty = parse_float(row[1] if len(row) > 1 else 0)
        if qty <= 0:
            continue
        items.append({
            "food": food,
            "quantity_g": qty,
            "calories": parse_float(row[2] if len(row) > 2 else 0),
            "carbs": parse_float(row[3] if len(row) > 3 else 0),
            "protein": parse_float(row[4] if len(row) > 4 else 0),
            "fat": parse_float(row[5] if len(row) > 5 else 0),
        })

    if not items:
        return None

    return {"name": name, "items": items, "totals": totals}
