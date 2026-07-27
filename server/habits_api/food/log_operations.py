from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.food_db_search import search_food_db
from habits_api.food.parser import fuzzy_match_food, parse_meal_description
from habits_api.food.row_log_ops import delete_log_row, update_log_row
from habits_api.food.sheet_log import find_next_log_row, load_food_db, write_log_row
from habits_api.food.today_summary import get_today_summary, log_success_message

__all__ = [
    "delete_log_row",
    "log_food_item",
    "log_food_with_macros",
    "log_meal_description",
    "search_food_db",
    "update_log_row",
]


async def log_food_item(
    settings: Settings,
    db: TokenDB,
    food_name: str,
    quantity_g: float,
) -> dict:
    db_entries = await load_food_db(settings, db)
    names = [e.name for e in db_entries]
    matched = fuzzy_match_food(food_name, names)
    if not matched:
        raise ValueError(f"Food '{food_name}' not found in Nutritional Data API tab")

    entry = next(e for e in db_entries if e.name == matched)
    macros = entry.scale(quantity_g)
    row_idx = await find_next_log_row(settings, db)
    await write_log_row(settings, db, row_idx, entry.name, quantity_g, macros)

    summary = await get_today_summary(settings, db)
    return {
        "food": entry.name,
        "quantity_g": quantity_g,
        **macros,
        "message": log_success_message(quantity_g, entry.name, macros["protein"], summary),
        "summary": summary,
    }


async def log_food_with_macros(
    settings: Settings,
    db: TokenDB,
    food_name: str,
    quantity_g: float,
    calories: float,
    carbs: float,
    protein: float,
    fat: float,
) -> dict:
    if not await db.google_connected():
        raise RuntimeError("Google Sheets not connected")

    name = food_name.strip()
    if not name:
        raise ValueError("Food name is required")

    row_idx = await find_next_log_row(settings, db)
    macros = {
        "calories": round(calories, 2),
        "carbs": round(carbs, 4),
        "protein": round(protein, 4),
        "fat": round(fat, 4),
    }
    await write_log_row(settings, db, row_idx, name, quantity_g, macros)

    summary = await get_today_summary(settings, db)
    return {
        "food": name,
        "quantity_g": quantity_g,
        **macros,
        "message": log_success_message(
            quantity_g,
            name,
            macros["protein"],
            summary,
            source_note="from barcode data",
        ),
        "summary": summary,
    }


async def log_meal_description(
    settings: Settings,
    db: TokenDB,
    description: str,
    meal_type: str = "other",
) -> dict:
    parsed = parse_meal_description(description)
    if not parsed:
        raise ValueError("Could not parse any food from description")

    logged = []
    errors = []
    for item in parsed:
        try:
            result = await log_food_item(settings, db, item.name, item.quantity_g)
            logged.append(result)
        except ValueError as exc:
            errors.append(str(exc))

    summary = await get_today_summary(settings, db)
    if not logged and errors:
        raise ValueError("; ".join(errors))

    msg_parts = [r["message"] for r in logged]
    return {
        "meal_type": meal_type,
        "logged": logged,
        "errors": errors,
        "message": " ".join(msg_parts),
        "summary": summary,
    }
