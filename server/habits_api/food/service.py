from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.parser import fuzzy_match_food, parse_meal_description
from habits_api.google.sheets import (
    DAILY_LOG_DATA_START_ROW,
    FOOD_DB_DATA_START_ROW,
    read_key_value_block,
    read_range,
    update_range,
    write_physio_value,
)


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


def _float(val: Any, default: float = 0.0) -> float:
    if val is None or val == "":
        return default
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return default


def _is_placeholder_food(name: str) -> bool:
    n = name.strip().lower()
    return not n or n in ("...", "…", "-", "food")


async def load_food_db(settings: Settings, db: TokenDB) -> list[FoodDbEntry]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_db,
        f"B{FOOD_DB_DATA_START_ROW}:K500",
    )
    entries: list[FoodDbEntry] = []
    for row in rows:
        if len(row) < 2:
            continue
        name = str(row[0]).strip() if row[0] else ""
        if _is_placeholder_food(name) or name.upper().startswith("SEARCH"):
            continue
        ref_grams = _float(row[3] if len(row) > 3 else row[1], 100.0)
        calories = _float(row[6] if len(row) > 6 else 0)
        carbs = _float(row[7] if len(row) > 7 else 0)
        protein = _float(row[8] if len(row) > 8 else 0)
        fat = _float(row[9] if len(row) > 9 else 0)
        if protein == 0 and calories == 0:
            continue
        entries.append(
            FoodDbEntry(
                name=name,
                ref_grams=ref_grams,
                calories=calories,
                carbs=carbs,
                protein=protein,
                fat=fat,
            )
        )
    return entries


async def load_daily_log(settings: Settings, db: TokenDB) -> list[FoodLogItem]:
    """Daily calculation tab holds today's log only (no date column in sheet)."""
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{DAILY_LOG_DATA_START_ROW}:F500",
    )
    items: list[FoodLogItem] = []
    for offset, row in enumerate(rows):
        if len(row) < 1:
            continue
        food = str(row[0]).strip() if row[0] else ""
        if _is_placeholder_food(food):
            continue
        qty = _float(row[1] if len(row) > 1 else 0)
        if qty <= 0:
            continue
        items.append(
            FoodLogItem(
                row=DAILY_LOG_DATA_START_ROW + offset,
                food=food,
                quantity_g=qty,
                calories=_float(row[2] if len(row) > 2 else 0),
                carbs=_float(row[3] if len(row) > 3 else 0),
                protein=_float(row[4] if len(row) > 4 else 0),
                fat=_float(row[5] if len(row) > 5 else 0),
            )
        )
    return items


async def get_protein_target(settings: Settings, db: TokenDB) -> float | None:
    physio = await read_key_value_block(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_body_config,
        "A1:C30",
    )
    for key in ("Protein target", "Protein target (g)", "Protein"):
        if key in physio:
            try:
                return float(str(physio[key]).replace("g", "").strip())
            except ValueError:
                pass
    return None


async def get_today_summary(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {
            "protein_g": 0,
            "protein_target_g": None,
            "calories": 0,
            "carbs": 0,
            "fat": 0,
            "items": [],
            "sheets_connected": False,
        }

    items = await load_daily_log(settings, db)
    protein = sum(i.protein for i in items)
    calories = sum(i.calories for i in items)
    carbs = sum(i.carbs for i in items)
    fat = sum(i.fat for i in items)
    target = await get_protein_target(settings, db)

    return {
        "protein_g": round(protein, 2),
        "protein_target_g": target,
        "calories": round(calories, 2),
        "carbs": round(carbs, 2),
        "fat": round(fat, 2),
        "items": [
            {
                "row": i.row,
                "food": i.food,
                "quantity_g": i.quantity_g,
                "calories": i.calories,
                "carbs": i.carbs,
                "protein": i.protein,
                "fat": i.fat,
            }
            for i in items
        ],
        "sheets_connected": True,
    }


async def _find_next_log_row(settings: Settings, db: TokenDB) -> int:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{DAILY_LOG_DATA_START_ROW}:B500",
    )
    for offset, row in enumerate(rows):
        food = str(row[0]).strip() if row and row[0] else ""
        qty = _float(row[1] if len(row) > 1 else 0)
        if _is_placeholder_food(food) or qty == 0:
            return DAILY_LOG_DATA_START_ROW + offset
    return DAILY_LOG_DATA_START_ROW + len(rows)


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
    row_idx = await _find_next_log_row(settings, db)

    await update_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{row_idx}:F{row_idx}",
        [[entry.name, quantity_g, macros["calories"], macros["carbs"], macros["protein"], macros["fat"]]],
    )

    summary = await get_today_summary(settings, db)
    return {
        "food": entry.name,
        "quantity_g": quantity_g,
        **macros,
        "message": (
            f"Logged {quantity_g}g {entry.name} ({macros['protein']}g protein). "
            f"Today: {summary['protein_g']}g protein"
            + (f" of {summary['protein_target_g']}g target" if summary.get("protein_target_g") else "")
            + "."
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


async def update_log_row(
    settings: Settings,
    db: TokenDB,
    row: int,
    food_name: str | None = None,
    quantity_g: float | None = None,
) -> dict:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{row}:F{row}",
    )
    if not rows or not rows[0]:
        raise ValueError(f"Row {row} not found")

    current = rows[0]
    name = food_name or str(current[0]).strip()
    qty = quantity_g if quantity_g is not None else _float(current[1] if len(current) > 1 else 0)

    db_entries = await load_food_db(settings, db)
    matched = fuzzy_match_food(name, [e.name for e in db_entries])
    if not matched:
        raise ValueError(f"Food '{name}' not found in database")
    entry = next(e for e in db_entries if e.name == matched)
    macros = entry.scale(qty)

    await update_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{row}:F{row}",
        [[entry.name, qty, macros["calories"], macros["carbs"], macros["protein"], macros["fat"]]],
    )
    return await get_today_summary(settings, db)


async def delete_log_row(settings: Settings, db: TokenDB, row: int) -> dict:
    await update_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{row}:F{row}",
        [["...", 0, 0, 0, 0, 0]],
    )
    return await get_today_summary(settings, db)


async def search_food_db(settings: Settings, db: TokenDB, query: str) -> list[dict]:
    entries = await load_food_db(settings, db)
    q = query.lower().strip()
    results = [
        {
            "name": e.name,
            "ref_grams": e.ref_grams,
            "protein": e.protein,
            "calories": e.calories,
        }
        for e in entries
        if q in e.name.lower()
    ]
    if not results:
        match = fuzzy_match_food(query, [e.name for e in entries])
        if match:
            e = next(x for x in entries if x.name == match)
            results = [{"name": e.name, "ref_grams": e.ref_grams, "protein": e.protein, "calories": e.calories}]
    return results[:20]
