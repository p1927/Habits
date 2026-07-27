from __future__ import annotations

from datetime import date, datetime

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.models import parse_float
from habits_api.google.sheets import read_range


def _parse_history_date(raw: object) -> str | None:
    if isinstance(raw, datetime):
        return raw.date().isoformat()
    if isinstance(raw, date):
        return raw.isoformat()
    try:
        return datetime.fromisoformat(str(raw)[:10]).date().isoformat()
    except ValueError:
        return None


async def get_food_history(settings: Settings, db: TokenDB, days: int = 7) -> dict:
    """Read Followed tab: date, calories, carbs, protein, fat."""
    connected = await db.google_connected()
    if not connected:
        return {"days": [], "sheets_connected": False}

    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_food_history,
        "A3:F500",
    )

    history: list[dict] = []
    for row in rows:
        if not row or not row[0]:
            continue
        day_str = _parse_history_date(row[0])
        if not day_str:
            continue
        calories = parse_float(row[2] if len(row) > 2 else 0)
        if calories <= 0:
            continue
        history.append({
            "date": day_str,
            "calories": round(calories, 1),
            "carbs": round(parse_float(row[3] if len(row) > 3 else 0), 1),
            "protein": round(parse_float(row[4] if len(row) > 4 else 0), 1),
            "fat": round(parse_float(row[5] if len(row) > 5 else 0), 1),
        })

    history.sort(key=lambda x: x["date"], reverse=True)
    sliced = history[:days]
    sliced.reverse()
    return {"days": sliced, "sheets_connected": True}
