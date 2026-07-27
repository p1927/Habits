from __future__ import annotations

from datetime import date

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.habits.models import METRICS, METRIC_TARGETS, TrackerDay
from habits_api.habits.tracker_sheet import load_tracker


def day_hits_target(day: TrackerDay, metric: str) -> bool:
    target = METRIC_TARGETS.get(metric, 0)
    if target <= 0:
        return True
    val = day.metrics.get(metric)
    return val is not None and val >= target


def day_all_targets_hit(day: TrackerDay) -> bool:
    for m in METRICS:
        target = METRIC_TARGETS.get(m, 0)
        if target <= 0:
            continue
        if not day_hits_target(day, m):
            return False
    return True


async def get_week_summary(settings: Settings, db: TokenDB) -> dict:
    if not await db.google_connected():
        return {"days_tracked": 0, "averages": {}, "recent_days": []}

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


async def get_streaks(settings: Settings, db: TokenDB) -> dict:
    if not await db.google_connected():
        return {"overall": 0, "metrics": {}, "sheets_connected": False}

    days = await load_tracker(settings, db)
    today = date.today().isoformat()
    ordered = sorted(
        [d for d in days if d.day_date <= today],
        key=lambda d: d.day_date,
        reverse=True,
    )
    by_date = {d.day_date: d for d in ordered}

    def count_streak(check) -> int:
        streak = 0
        cursor = date.fromisoformat(today)
        while True:
            day = by_date.get(cursor.isoformat())
            if not day or not check(day):
                break
            streak += 1
            cursor = cursor.fromordinal(cursor.toordinal() - 1)
        return streak

    metric_streaks = {m: count_streak(lambda d, metric=m: day_hits_target(d, metric)) for m in METRICS}
    return {
        "overall": count_streak(day_all_targets_hit),
        "metrics": metric_streaks,
        "sheets_connected": True,
    }
