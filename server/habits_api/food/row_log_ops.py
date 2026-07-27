from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.models import parse_float
from habits_api.food.parser import fuzzy_match_food
from habits_api.food.sheet_log import load_food_db, write_log_row
from habits_api.food.today_summary import get_today_summary
from habits_api.google.sheets import read_range, update_range


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
    qty = quantity_g if quantity_g is not None else parse_float(current[1] if len(current) > 1 else 0)

    db_entries = await load_food_db(settings, db)
    matched = fuzzy_match_food(name, [e.name for e in db_entries])
    if not matched:
        raise ValueError(f"Food '{name}' not found in database")
    entry = next(e for e in db_entries if e.name == matched)
    macros = entry.scale(qty)

    await write_log_row(settings, db, row, entry.name, qty, macros)
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
