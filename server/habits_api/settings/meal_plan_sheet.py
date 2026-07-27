from __future__ import annotations

from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google import sheets as sheet_api
from habits_api.settings.constants import MEAL_PLAN_ROWS, WEEKDAYS


def meal_plan_key(meal_label: str) -> str:
    return meal_label.lower().replace("-", "_").replace(" ", "_")


def meal_plan_label(meal_key: str) -> str:
    return meal_key.upper().replace("_", " ").replace("MID DAY", "MID-DAY")


async def load_meal_plan(settings: Settings, db: TokenDB) -> dict[str, dict[str, str]]:
    if not await db.google_connected():
        return {}
    rows = await sheet_api.read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_meal_plan,
        "B3:I10",
    )
    plan: dict[str, dict[str, str]] = {}
    for row in rows:
        if len(row) < 3:
            continue
        meal = str(row[0]).strip().upper() if row[0] else ""
        if meal not in MEAL_PLAN_ROWS:
            continue
        day_map: dict[str, str] = {}
        for idx, day in enumerate(WEEKDAYS):
            col_idx = idx + 1
            if col_idx < len(row) and row[col_idx]:
                day_map[day.lower()] = str(row[col_idx]).strip()
        plan[meal_plan_key(meal)] = day_map
    return plan


async def save_meal_plan(settings: Settings, db: TokenDB, meal_plan: dict[str, Any]) -> None:
    rows = await sheet_api.read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_meal_plan,
        "A1:I10",
    )
    label_to_row: dict[str, int] = {}
    for idx, row in enumerate(rows, start=1):
        if len(row) < 2 or not row[1]:
            continue
        label = str(row[1]).strip().upper()
        label_to_row[label] = idx

    for meal_key, days in meal_plan.items():
        meal_label = meal_plan_label(meal_key)
        if meal_label not in MEAL_PLAN_ROWS:
            continue
        row_idx = label_to_row.get(meal_label)
        if not row_idx:
            continue
        values: list[Any] = [None, meal_label]
        for day in WEEKDAYS:
            val = ""
            if isinstance(days, dict):
                val = days.get(day.lower(), days.get(day, ""))
            values.append(val if val else None)
        await sheet_api.update_range(
            settings,
            db,
            settings.habits_sheet_nutrition,
            settings.habits_tab_meal_plan,
            f"B{row_idx}:I{row_idx}",
            [values[1:]],
        )
