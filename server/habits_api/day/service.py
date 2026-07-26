from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import read_range, update_range


async def get_manage_day(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"quadrants": {}, "sheets_connected": False}

    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_life,
        settings.habits_tab_manage_day,
        "B3:H30",
    )
    # Eisenhower matrix from Life DashBoard Manage Day tab
    quadrants = {
        "do_today": [],
        "schedule": [],
        "delegate": [],
        "eliminate": [],
    }
    current = None
    for row in rows:
        if not row:
            continue
        label = str(row[0]).strip() if row[0] else ""
        if "DO (" in label.upper() or label.upper().startswith("DO "):
            current = "do_today"
            continue
        if "DECIDE" in label.upper() or "SCHEDULE" in label.upper():
            current = "schedule"
            continue
        if "DELEGATE" in label.upper():
            current = "delegate"
            continue
        if "ELIMINATE" in label.upper() or "NOT URGENT" in label.upper():
            if "NOT URGENT" in label.upper() and "DELEGATE" not in label.upper():
                current = "eliminate"
            continue
        if current and label and label not in ("Urgent", "Not Urgent"):
            item_text = label
            if len(row) > 1 and row[1]:
                item_text = str(row[1]).strip() or label
            quadrants[current].append(item_text)

    return {"quadrants": quadrants, "sheets_connected": True}


async def update_manage_day(settings: Settings, db: TokenDB, quadrant: str, items: list[str]) -> dict:
    valid = {"do_today", "schedule", "delegate", "eliminate"}
    if quadrant not in valid:
        raise ValueError(f"Unknown quadrant: {quadrant}")

    row_map = {"do_today": 3, "schedule": 3, "delegate": 15, "eliminate": 15}
    start_row = row_map.get(quadrant, 3)
    col = "C" if quadrant in ("do_today", "schedule") else "G"

    for i, item in enumerate(items[:10]):
        await update_range(
            settings,
            db,
            settings.habits_sheet_life,
            settings.habits_tab_manage_day,
            f"{col}{start_row + i}",
            [[item]],
        )
    return await get_manage_day(settings, db)
