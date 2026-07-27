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
