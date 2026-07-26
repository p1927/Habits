from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import read_range, update_range

METRICS = ("sleep", "work", "wasted", "speak", "game", "read")
METRIC_COLS = {"sleep": "F", "work": "G", "wasted": "H", "speak": "I", "game": "J", "read": "K"}


@dataclass
class TrackerDay:
    row: int
    day_date: str
    weekday: str
    metrics: dict[str, float | None]
    notes: str | None


def _parse_date(val: Any) -> date | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    try:
        return datetime.fromisoformat(str(val)[:10]).date()
    except ValueError:
        return None


def _float(val: Any) -> float | None:
    if val is None or val == "":
        return None
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return None


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
        d = _parse_date(row[0])
        if not d:
            continue
        row_num = 4 + offset
        metrics = {
            m: _float(row[i]) if len(row) > i else None
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


async def get_today_tracker(settings: Settings, db: TokenDB) -> dict:
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


async def get_week_summary(settings: Settings, db: TokenDB) -> dict:
    days = await load_tracker(settings, db)
    today = date.today()
    week_days = [d for d in days if d.day_date <= today.isoformat()][-7:]
    totals = {m: 0.0 for m in METRICS}
    counts = {m: 0 for m in METRICS}
    for d in week_days:
        for m in METRICS:
            v = d.metrics.get(m)
            if v is not None:
                totals[m] += v
                counts[m] += 1
    return {
        "days_tracked": len(week_days),
        "averages": {
            m: round(totals[m] / counts[m], 2) if counts[m] else None for m in METRICS
        },
        "recent_days": [
            {"date": d.day_date, "weekday": d.weekday, "metrics": d.metrics} for d in week_days
        ],
    }
