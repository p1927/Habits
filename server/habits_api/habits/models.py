from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any

METRICS = ("sleep", "work", "wasted", "speak", "game", "read")
METRIC_COLS = {"sleep": "F", "work": "G", "wasted": "H", "speak": "I", "game": "J", "read": "K"}
METRIC_TARGETS = {"sleep": 7, "work": 4, "read": 1, "speak": 0.5, "game": 0, "wasted": 0}


@dataclass
class TrackerDay:
    row: int
    day_date: str
    weekday: str
    metrics: dict[str, float | None]
    notes: str | None


def parse_date(val: Any) -> date | None:
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


def parse_float(val: Any) -> float | None:
    if val is None or val == "":
        return None
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return None
