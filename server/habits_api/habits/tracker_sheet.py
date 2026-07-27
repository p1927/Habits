from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import read_range
from habits_api.habits.models import METRICS, TrackerDay, parse_date, parse_float


async def load_tracker(settings: Settings, db: TokenDB) -> list[TrackerDay]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_life,
        settings.habits_tab_habit_tracker,
        "A4:L200",
    )
    days: list[TrackerDay] = []
    for offset, row in enumerate(rows):
        if not row or not row[0]:
            continue
        d = parse_date(row[0])
        if not d:
            continue
        row_num = 4 + offset
        metrics = {
            m: parse_float(row[i]) if len(row) > i else None
            for i, m in zip([5, 6, 7, 8, 9, 10], METRICS)
        }
        notes = str(row[11]).strip() if len(row) > 11 and row[11] else None
        days.append(
            TrackerDay(
                row=row_num,
                day_date=d.isoformat(),
                weekday=str(row[1]).strip() if len(row) > 1 and row[1] else "",
                metrics=metrics,
                notes=notes,
            )
        )
    return days
