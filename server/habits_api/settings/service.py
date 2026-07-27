from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google import sheets as sheet_api
from habits_api.settings.constants import (
    DEFAULT_NOTIFICATION_TIMES,
    NOTIFICATION_CACHE_KEY,
    NUMERIC_BODY_KEYS,
)
from habits_api.settings.meal_plan_sheet import load_meal_plan, save_meal_plan

# Re-export for food/meal_plan and other callers.
from habits_api.settings.constants import MEAL_PLAN_ROWS, WEEKDAYS  # noqa: F401


async def load_notification_times(db: TokenDB) -> dict[str, str]:
    cached = await db.get_setting_cache_json(NOTIFICATION_CACHE_KEY)
    if isinstance(cached, dict):
        merged = dict(DEFAULT_NOTIFICATION_TIMES)
        merged.update({k: str(v) for k, v in cached.items()})
        return merged
    return dict(DEFAULT_NOTIFICATION_TIMES)


async def _load_protein_target(settings: Settings, db: TokenDB) -> float | None:
    from habits_api.food.service import get_protein_target

    return await get_protein_target(settings, db)


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
                if k in NUMERIC_BODY_KEYS:
                    body[k] = float(str(v).replace(" kg", "").replace(",", ".").replace("g", "").strip())
                else:
                    body[k] = v
            except ValueError:
                body[k] = v

    protein_target = await _load_protein_target(settings, db) if connected else None
    if protein_target is not None:
        body["Protein target"] = protein_target

    meal_plan = await load_meal_plan(settings, db) if connected else {}

    return {
        "body": body,
        "meal_plan": meal_plan,
        "notification_times": await load_notification_times(db),
        "sheets_connected": connected,
    }


async def save_settings(settings: Settings, db: TokenDB, payload: dict) -> dict:
    body = payload.get("body") or {}
    if await db.google_connected():
        for key, val in body.items():
            if val is None:
                continue
            await sheet_api.write_physio_value(settings, db, str(key), str(val))
        meal_plan = payload.get("meal_plan")
        if isinstance(meal_plan, dict):
            await save_meal_plan(settings, db, meal_plan)

    if "notification_times" in payload and isinstance(payload["notification_times"], dict):
        await db.set_setting_cache_json(NOTIFICATION_CACHE_KEY, payload["notification_times"])

    current = await load_settings(settings, db)
    if "notification_times" in payload:
        current["notification_times"] = payload["notification_times"]
    if "meal_plan" in payload:
        current["meal_plan"] = payload.get("meal_plan") or current["meal_plan"]
    return current
