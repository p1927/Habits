from __future__ import annotations

import asyncio
from typing import Any

from googleapiclient.discovery import build

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheet_auth import credentials_from_db


def _sheets_service(creds):
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


async def _run_sync(fn, *args, **kwargs):
    return await asyncio.to_thread(fn, *args, **kwargs)


async def _get_service(settings: Settings, db: TokenDB):
    creds = await credentials_from_db(settings, db)
    if not creds:
        raise RuntimeError("Google not connected")
    return _sheets_service(creds)


async def read_range(
    settings: Settings,
    db: TokenDB,
    spreadsheet_id: str,
    tab: str,
    range_a1: str,
) -> list[list[Any]]:
    svc = await _get_service(settings, db)

    def _read():
        result = (
            svc.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=f"'{tab}'!{range_a1}")
            .execute()
        )
        return result.get("values", [])

    return await _run_sync(_read)


async def append_rows(
    settings: Settings,
    db: TokenDB,
    spreadsheet_id: str,
    tab: str,
    rows: list[list[Any]],
) -> None:
    svc = await _get_service(settings, db)

    def _append():
        svc.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=f"'{tab}'!A:F",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": rows},
        ).execute()

    await _run_sync(_append)


async def update_range(
    settings: Settings,
    db: TokenDB,
    spreadsheet_id: str,
    tab: str,
    range_a1: str,
    rows: list[list[Any]],
) -> None:
    svc = await _get_service(settings, db)

    def _update():
        svc.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{tab}'!{range_a1}",
            valueInputOption="USER_ENTERED",
            body={"values": rows},
        ).execute()

    await _run_sync(_update)


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
