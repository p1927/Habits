from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.day.manage_day_sheet import (
    MANAGE_DAY_QUADRANTS,
    QUADRANT_COL_MAP,
    QUADRANT_ROW_MAP,
    parse_manage_day_rows,
)
from habits_api.google.sheets import read_range, update_range

MANAGE_DAY_RANGE = "B3:H30"


async def load_manage_day(settings: Settings, db: TokenDB) -> dict[str, list[str]]:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_life,
        settings.habits_tab_manage_day,
        MANAGE_DAY_RANGE,
    )
    return parse_manage_day_rows(rows)


async def get_manage_day(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"quadrants": {}, "sheets_connected": False}

    quadrants = await load_manage_day(settings, db)
    return {"quadrants": quadrants, "sheets_connected": True}


async def update_manage_day(settings: Settings, db: TokenDB, quadrant: str, items: list[str]) -> dict:
    if quadrant not in MANAGE_DAY_QUADRANTS:
        raise ValueError(f"Unknown quadrant: {quadrant}")

    start_row = QUADRANT_ROW_MAP.get(quadrant, 3)
    col = QUADRANT_COL_MAP.get(quadrant, "C")

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
