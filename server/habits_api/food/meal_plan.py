from __future__ import annotations

from datetime import date

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.routes.settings import MEAL_PLAN_ROWS, WEEKDAYS, _load_meal_plan


def _today_key() -> str:
    return date.today().strftime("%A").lower()


async def get_today_meal_plan(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"date": date.today().isoformat(), "weekday": _today_key(), "meals": [], "sheets_connected": False}

    plan = await _load_meal_plan(settings, db)
    today = _today_key()
    meals: list[dict] = []
    for meal_row in MEAL_PLAN_ROWS:
        key = meal_row.lower().replace("-", "_").replace(" ", "_")
        day_map = plan.get(key, {})
        text = day_map.get(today, "").strip()
        if text:
            meals.append({"meal": key, "label": meal_row.title(), "description": text})

    return {
        "date": date.today().isoformat(),
        "weekday": today,
        "meals": meals,
        "sheets_connected": True,
    }


async def log_today_meal_plan(settings: Settings, db: TokenDB) -> dict:
    data = await get_today_meal_plan(settings, db)
    meals = data.get("meals") or []
    if not meals:
        raise ValueError(f"No meals planned for {data.get('weekday', 'today')}")

    logged = []
    errors = []
    for m in meals:
        try:
            result = await food_service.log_meal_description(
                settings, db, m["description"], m["meal"]
            )
            logged.append({"meal": m["meal"], "message": result.get("message", "")})
            if result.get("errors"):
                errors.extend(result["errors"])
        except ValueError as exc:
            errors.append(str(exc))

    summary = await food_service.get_today_summary(settings, db)
    return {
        "logged": logged,
        "errors": errors,
        "message": f"Logged {len(logged)} planned meals for {data['weekday']}.",
        "summary": summary,
    }
