from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.google.calendar import list_today_events
from habits_api.habits import service as habits_service


async def build_agent_context(settings: Settings, db: TokenDB) -> dict:
    food = await food_service.get_today_summary(settings, db)
    habits = await habits_service.get_today_tracker(settings, db)
    try:
        events = await list_today_events(settings, db)
    except Exception:
        events = []
    return {
        "food": {
            "protein_g": food.get("protein_g"),
            "protein_target_g": food.get("protein_target_g"),
            "calories": food.get("calories"),
        },
        "habits": habits.get("metrics"),
        "calendar_events": len(events),
    }
