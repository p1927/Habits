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
    protein_g = food.get("protein_g") or 0
    protein_target = food.get("protein_target_g")
    protein_remaining = round(max(0, protein_target - protein_g), 1) if protein_target is not None else None
    items = food.get("items") or []
    return {
        "food": {"protein_g": protein_g, "protein_target_g": protein_target, "protein_remaining_g": protein_remaining, "calories": food.get("calories"), "recent_items": [{"food": i.get("food"), "quantity_g": i.get("quantity_g"), "protein": i.get("protein")} for i in items[-5:]]},
        "habits": habits.get("metrics"),
        "calendar": {"event_count": len(events), "events": [{"id": e.get("id"), "summary": e.get("summary"), "start": e.get("start"), "end": e.get("end")} for e in events[:10]]},
    }
