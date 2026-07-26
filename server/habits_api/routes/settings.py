from __future__ import annotations

from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google import sheets as sheet_api

DEFAULT_NOTIFICATION_TIMES = {
    "breakfast": "08:00",
    "mid_day_snack": "11:00",
    "lunch": "13:00",
    "evening_snack": "16:00",
    "late_evening_snack": "18:00",
    "dinner": "20:00",
    "late_night_snack": "22:00",
    "bedtime": "22:30",
}

MEAL_PLAN_ROWS = [
    "BREAKFAST",
    "MID-DAY SNACK",
    "LUNCH",
    "EVENING SNACK",
    "LATE EVENING SNACK",
    "DINNER",
    "LATE NIGHT SNACK",
]

WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

_NUMERIC_KEYS = {
    "Weight",
    "Size",
    "Age",
    "Gross mass rate",
    "Mass search",
    "Base metabolism",
    "Energy expenditure rate",
    "Journalistic calorie needs",
    "Protein target",
    "Protein target (g)",
}

NOTIFICATION_CACHE_KEY = "notification_times"


async def _load_notification_times(db: TokenDB) -> dict[str, str]:
    cached = await db.get_setting_cache_json(NOTIFICATION_CACHE_KEY)
    if isinstance(cached, dict):
        merged = dict(DEFAULT_NOTIFICATION_TIMES)
        merged.update({k: str(v) for k, v in cached.items()})
        return merged
    return dict(DEFAULT_NOTIFICATION_TIMES)


async def _load_meal_plan(settings: Settings, db: TokenDB) -> dict[str, dict[str, str]]:
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
        plan[meal.lower().replace("-", "_").replace(" ", "_")] = day_map
    return plan


async def _save_meal_plan(settings: Settings, db: TokenDB, meal_plan: dict[str, Any]) -> None:
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
        meal_label = meal_key.upper().replace("_", " ").replace("MID DAY", "MID-DAY")
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


async def load_settings(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    body: dict[str, str | float | None] = {}
    if connected:
        raw = await sheet_api.read_key_value_block(
            settings,
            db,
            settings.habits_sheet_nutrition,
            settings.habits_tab_body_config,
            "A1:C30",
        )
        for k, v in raw.items():
            if not k or k.startswith("(") or "FORMULA" in k.upper() or k == "BASIC DATA":
                continue
            try:
                if k in _NUMERIC_KEYS:
                    body[k] = float(str(v).replace(" kg", "").replace(",", ".").replace("g", "").strip())
                else:
                    body[k] = v
            except ValueError:
                body[k] = v

    protein_target = await _load_protein_target(settings, db) if connected else None
    if protein_target is not None:
        body["Protein target"] = protein_target

    meal_plan = await _load_meal_plan(settings, db) if connected else {}

    return {
        "body": body,
        "meal_plan": meal_plan,
        "notification_times": await _load_notification_times(db),
        "sheets_connected": connected,
    }


async def _load_protein_target(settings: Settings, db: TokenDB) -> float | None:
    from habits_api.food.service import get_protein_target

    return await get_protein_target(settings, db)


async def save_settings(settings: Settings, db: TokenDB, payload: dict) -> dict:
    body = payload.get("body") or {}
    if await db.google_connected():
        for key, val in body.items():
            if val is None:
                continue
            await sheet_api.write_physio_value(settings, db, str(key), str(val))
        meal_plan = payload.get("meal_plan")
        if isinstance(meal_plan, dict):
            await _save_meal_plan(settings, db, meal_plan)

    if "notification_times" in payload and isinstance(payload["notification_times"], dict):
        await db.set_setting_cache_json(NOTIFICATION_CACHE_KEY, payload["notification_times"])

    current = await load_settings(settings, db)
    if "notification_times" in payload:
        current["notification_times"] = payload["notification_times"]
    if "meal_plan" in payload:
        current["meal_plan"] = payload.get("meal_plan") or current["meal_plan"]
    return current
