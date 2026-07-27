from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.models import FoodDbEntry, FoodLogItem, is_placeholder_food, parse_float
from habits_api.google.sheets import (
    DAILY_LOG_DATA_START_ROW,
    FOOD_DB_DATA_START_ROW,
    read_key_value_block,
    read_range,
    update_range,
)


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
        if is_placeholder_food(name) or name.upper().startswith("SEARCH"):
            continue
        ref_grams = parse_float(row[3] if len(row) > 3 else row[1], 100.0)
        calories = parse_float(row[6] if len(row) > 6 else 0)
        carbs = parse_float(row[7] if len(row) > 7 else 0)
        protein = parse_float(row[8] if len(row) > 8 else 0)
        fat = parse_float(row[9] if len(row) > 9 else 0)
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
        if is_placeholder_food(food):
            continue
        qty = parse_float(row[1] if len(row) > 1 else 0)
        if qty <= 0:
            continue
        items.append(
            FoodLogItem(
                row=DAILY_LOG_DATA_START_ROW + offset,
                food=food,
                quantity_g=qty,
                calories=parse_float(row[2] if len(row) > 2 else 0),
                carbs=parse_float(row[3] if len(row) > 3 else 0),
                protein=parse_float(row[4] if len(row) > 4 else 0),
                fat=parse_float(row[5] if len(row) > 5 else 0),
            )
        )
    return items


async def find_next_log_row(settings: Settings, db: TokenDB) -> int:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{DAILY_LOG_DATA_START_ROW}:B500",
    )
    for offset, row in enumerate(rows):
        food = str(row[0]).strip() if row and row[0] else ""
        qty = parse_float(row[1] if len(row) > 1 else 0)
        if is_placeholder_food(food) or qty == 0:
            return DAILY_LOG_DATA_START_ROW + offset
    return DAILY_LOG_DATA_START_ROW + len(rows)


async def write_log_row(
    settings: Settings,
    db: TokenDB,
    row_idx: int,
    name: str,
    quantity_g: float,
    macros: dict[str, float],
) -> None:
    await update_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_log,
        f"A{row_idx}:F{row_idx}",
        [[name, quantity_g, macros["calories"], macros["carbs"], macros["protein"], macros["fat"]]],
    )


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
