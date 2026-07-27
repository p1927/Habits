from __future__ import annotations

import asyncio
import time
from typing import Any

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheet_auth import credentials_from_db

READ_CACHE_TTL_SEC = 20.0
_SHEET_READ_CACHE: dict[tuple[str, str, str], tuple[float, list[list[Any]]]] = {}


def _sheets_service(creds):
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


async def _run_sync(fn, *args, **kwargs):
    return await asyncio.to_thread(fn, *args, **kwargs)


async def _get_service(settings: Settings, db: TokenDB):
    creds = await credentials_from_db(settings, db)
    if not creds:
        raise RuntimeError("Google not connected")
    return _sheets_service(creds)


def _cache_key(spreadsheet_id: str, tab: str, range_a1: str) -> tuple[str, str, str]:
    return (spreadsheet_id, tab, range_a1)


def invalidate_sheet_cache(spreadsheet_id: str, tab: str) -> None:
    stale = [k for k in _SHEET_READ_CACHE if k[0] == spreadsheet_id and k[1] == tab]
    for key in stale:
        del _SHEET_READ_CACHE[key]


def _execute_with_retry(fn, *, max_retries: int = 3):
    delay = 1.0
    last_error: HttpError | None = None
    for attempt in range(max_retries):
        try:
            return fn()
        except HttpError as exc:
            last_error = exc
            if exc.resp.status == 429 and attempt < max_retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            if exc.resp.status == 429:
                raise RuntimeError(
                    "Google Sheets rate limit exceeded — try again in a minute"
                ) from exc
            raise
    if last_error is not None:
        raise last_error
    raise RuntimeError("Google Sheets request failed")


async def read_range(
    settings: Settings,
    db: TokenDB,
    spreadsheet_id: str,
    tab: str,
    range_a1: str,
) -> list[list[Any]]:
    key = _cache_key(spreadsheet_id, tab, range_a1)
    now = time.monotonic()
    cached = _SHEET_READ_CACHE.get(key)
    if cached and now - cached[0] < READ_CACHE_TTL_SEC:
        return cached[1]

    svc = await _get_service(settings, db)

    def _read():
        result = (
            svc.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=f"'{tab}'!{range_a1}")
            .execute()
        )
        return result.get("values", [])

    rows = await _run_sync(lambda: _execute_with_retry(_read))
    _SHEET_READ_CACHE[key] = (time.monotonic(), rows)
    return rows


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

    await _run_sync(lambda: _execute_with_retry(_append))
    invalidate_sheet_cache(spreadsheet_id, tab)


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

    await _run_sync(lambda: _execute_with_retry(_update))
    invalidate_sheet_cache(spreadsheet_id, tab)
