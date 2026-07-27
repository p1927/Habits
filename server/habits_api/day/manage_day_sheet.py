from __future__ import annotations

from typing import Any

MANAGE_DAY_QUADRANTS = ("do_today", "schedule", "delegate", "eliminate")

QUADRANT_ROW_MAP = {"do_today": 3, "schedule": 3, "delegate": 15, "eliminate": 15}

QUADRANT_COL_MAP = {
    "do_today": "C",
    "schedule": "C",
    "delegate": "G",
    "eliminate": "G",
}


def empty_quadrants() -> dict[str, list[str]]:
    return {q: [] for q in MANAGE_DAY_QUADRANTS}


def parse_manage_day_rows(rows: list[list[Any]]) -> dict[str, list[str]]:
    """Parse Eisenhower matrix rows from Life Dashboard Manage Day tab."""
    quadrants = empty_quadrants()
    current: str | None = None
    for row in rows:
        if not row:
            continue
        label = str(row[0]).strip() if row[0] else ""
        upper = label.upper()
        if "DO (" in upper or upper.startswith("DO "):
            current = "do_today"
            continue
        if "DECIDE" in upper or "SCHEDULE" in upper:
            current = "schedule"
            continue
        if "DELEGATE" in upper:
            current = "delegate"
            continue
        if "ELIMINATE" in upper or "NOT URGENT" in upper:
            if "NOT URGENT" in upper and "DELEGATE" not in upper:
                current = "eliminate"
            continue
        if current and label and label not in ("Urgent", "Not Urgent"):
            item_text = label
            if len(row) > 1 and row[1]:
                item_text = str(row[1]).strip() or label
            quadrants[current].append(item_text)
    return quadrants
