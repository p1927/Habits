from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheet_io import read_range, update_range


async def read_key_value_block(
    settings: Settings,
    db: TokenDB,
    spreadsheet_id: str,
    tab: str,
    range_a1: str = "A1:C30",
) -> dict[str, str]:
    rows = await read_range(settings, db, spreadsheet_id, tab, range_a1)
    out: dict[str, str] = {}
    for row in rows:
        if len(row) >= 2 and row[0]:
            key = str(row[0]).strip()
            val = str(row[2]).strip() if len(row) >= 3 and row[2] not in (None, "") else str(row[1]).strip()
            out[key] = val
    return out


async def write_physio_value(
    settings: Settings,
    db: TokenDB,
    key: str,
    value: str,
) -> None:
    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_body_config,
        "A1:C30",
    )
    for idx, row in enumerate(rows, start=1):
        if row and str(row[0]).strip() == key:
            await update_range(
                settings,
                db,
                settings.habits_sheet_nutrition,
                settings.habits_tab_body_config,
                f"C{idx}",
                [[value]],
            )
            return
    next_row = len(rows) + 1
    await update_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_body_config,
        f"A{next_row}:C{next_row}",
        [[key, "", value]],
    )
