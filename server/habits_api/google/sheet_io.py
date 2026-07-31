from __future__ import annotations

import asyncio
import time
from collections import OrderedDict
from typing import Any

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheet_auth import credentials_from_db

READ_CACHE_TTL_SEC = 20.0
_READ_CACHE_CAP = 64

# Bounded LRU for in-process sheet reads. Cross-process (multi-worker)
# invalidation is the caller's responsibility — but writes always call
# invalidate_sheet_cache() which both writes here and lets each worker pick
# up the change on its own TTL or next read.
_SHEET_READ_CACHE: "OrderedDict[tuple[str, str, str], tuple[float, list[list[Any]]]]" = (
    OrderedDict()
)

# Per-tab write serialization for append/update. The Sheets API itself does
# not provide row-level locking; without this, concurrent writes can race on
# the next-empty-row decision in find_next_log_row().
_WRITE_LOCKS: dict[tuple[str, str], asyncio.Lock] = {}
_WRITE_LOCKS_GUARD = asyncio.Lock()


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
    stale = [
        k
        for k in list(_SHEET_READ_CACHE.keys())
        if k[0] == spreadsheet_id and k[1] == tab
    ]
    for key in stale:
        _SHEET_READ_CACHE.pop(key, None)


def _cache_get(key: tuple[str, str, str]) -> list[list[Any]] | None:
    now = time.monotonic()
    cached = _SHEET_READ_CACHE.get(key)
    if not cached:
        return None
    timestamp, rows = cached
    if now - timestamp >= READ_CACHE_TTL_SEC:
        _SHEET_READ_CACHE.pop(key, None)
        return None
    # Move to end to record recent use (LRU semantics).
    _SHEET_READ_CACHE.move_to_end(key)
    return rows


def _cache_put(key: tuple[str, str, str], rows: list[list[Any]]) -> None:
    _SHEET_READ_CACHE[key] = (time.monotonic(), rows)
    _SHEET_READ_CACHE.move_to_end(key)
    while len(_SHEET_READ_CACHE) > _READ_CACHE_CAP:
        _SHEET_READ_CACHE.popitem(last=False)


async def _write_lock_for(spreadsheet_id: str, tab: str) -> asyncio.Lock:
    key = (spreadsheet_id, tab)
    async with _WRITE_LOCKS_GUARD:
        lock = _WRITE_LOCKS.get(key)
        if lock is None:
            lock = asyncio.Lock()
            _WRITE_LOCKS[key] = lock
    return lock


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
    cached = _cache_get(key)
    if cached is not None:
        return cached

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
    _cache_put(key, rows)
    return rows


async def append_rows(
    settings: Settings,
    db: TokenDB,
    spreadsheet_id: str,
    tab: str,
    rows: list[list[Any]],
) -> None:
    lock = await _write_lock_for(spreadsheet_id, tab)
    async with lock:
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
    lock = await _write_lock_for(spreadsheet_id, tab)
    async with lock:
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
