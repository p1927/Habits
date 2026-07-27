from __future__ import annotations

from typing import Any

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google import calendar as calendar_api


async def get_today_events(settings: Settings, db: TokenDB) -> dict[str, Any]:
    if not await db.google_connected():
        return {"events": [], "sheets_connected": False}
    events = await calendar_api.list_today_events(settings, db)
    return {"events": events, "sheets_connected": True}


async def create_event(
    settings: Settings,
    db: TokenDB,
    title: str,
    start_iso: str,
    duration_minutes: int = 60,
    description: str = "",
) -> dict[str, Any]:
    if not await db.google_connected():
        raise RuntimeError("Google not connected")
    event = await calendar_api.create_event(
        settings,
        db,
        title,
        start_iso,
        duration_minutes,
        description,
    )
    return {"event": event}
