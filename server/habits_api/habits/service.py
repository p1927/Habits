from __future__ import annotations

from datetime import date

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import read_range, update_range
from habits_api.habits.models import METRICS, METRIC_COLS
from habits_api.habits.tracker_sheet import load_tracker
from habits_api.habits.week_streak import get_streaks, get_week_summary

__all__ = [
    "get_streaks",
    "get_today_tracker",
    "get_week_summary",
    "update_metric",
]


async def get_today_tracker(settings: Settings, db: TokenDB) -> dict:
    if not await db.google_connected():
        today = date.today().isoformat()
        return {
            "date": today,
            "row": None,
            "weekday": date.today().strftime("%a").upper(),
            "metrics": {m: None for m in METRICS},
            "notes": None,
            "sheets_connected": False,
        }

    today = date.today().isoformat()
    days = await load_tracker(settings, db)
    match = next((d for d in days if d.day_date == today), None)
    if not match:
        return {
            "date": today,
            "row": None,
            "weekday": date.today().strftime("%a").upper(),
            "metrics": {m: None for m in METRICS},
            "notes": None,
            "sheets_connected": True,
        }
    return {
        "date": match.day_date,
        "row": match.row,
        "weekday": match.weekday,
        "metrics": match.metrics,
        "notes": match.notes,
        "sheets_connected": True,
    }


async def update_metric(
    settings: Settings,
    db: TokenDB,
    metric: str,
    value: float | None,
) -> dict:
    metric = metric.lower()
    if metric not in METRICS:
        raise ValueError(f"Unknown metric: {metric}")

    today = date.today()
    days = await load_tracker(settings, db)
    match = next((d for d in days if d.day_date == today.isoformat()), None)

    if match:
        row = match.row
    else:
        rows = await read_range(
            settings,
            db,
            settings.habits_sheet_life,
            settings.habits_tab_habit_tracker,
            "A4:A200",
        )
        row = 4
        for offset, r in enumerate(rows):
            if not r or not r[0]:
                row = 4 + offset
                break
            row = 4 + offset + 1
        await update_range(
            settings,
            db,
            settings.habits_sheet_life,
            settings.habits_tab_habit_tracker,
            f"A{row}:B{row}",
            [[today.isoformat(), today.strftime("%a").upper()[:3]]],
        )

    col = METRIC_COLS[metric]
    cell_val = value if value is not None else ""
    await update_range(
        settings,
        db,
        settings.habits_sheet_life,
        settings.habits_tab_habit_tracker,
        f"{col}{row}",
        [[cell_val]],
    )
    return await get_today_tracker(settings, db)
