from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import credentials_from_db


async def _calendar_service(settings: Settings, db: TokenDB):
    creds = await credentials_from_db(settings, db)
    if not creds:
        raise RuntimeError("Google not connected")
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


async def list_today_events(settings: Settings, db: TokenDB) -> list[dict[str, Any]]:
    svc = await _calendar_service(settings, db)
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    def _list():
        result = (
            svc.events()
            .list(
                calendarId="primary",
                timeMin=start.isoformat(),
                timeMax=end.isoformat(),
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        return result.get("items", [])

    items = await asyncio.to_thread(_list)
    return [
        {
            "id": e.get("id"),
            "summary": e.get("summary", ""),
            "start": e.get("start", {}).get("dateTime") or e.get("start", {}).get("date"),
            "end": e.get("end", {}).get("dateTime") or e.get("end", {}).get("date"),
        }
        for e in items
    ]


async def create_event(
    settings: Settings,
    db: TokenDB,
    title: str,
    start_iso: str,
    duration_minutes: int = 60,
    description: str = "",
) -> dict[str, Any]:
    svc = await _calendar_service(settings, db)
    start = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    end = start + timedelta(minutes=duration_minutes)

    body = {
        "summary": title,
        "description": description,
        "start": {"dateTime": start.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end.isoformat(), "timeZone": "UTC"},
    }

    def _insert():
        return svc.events().insert(calendarId="primary", body=body).execute()

    event = await asyncio.to_thread(_insert)
    return {
        "id": event.get("id"),
        "summary": event.get("summary"),
        "start": event.get("start", {}).get("dateTime"),
        "htmlLink": event.get("htmlLink"),
    }
