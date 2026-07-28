from __future__ import annotations
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any
from googleapiclient.discovery import build
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import credentials_from_db

def _normalize_event(e):
    return {"id": e.get("id"), "summary": e.get("summary", ""), "start": e.get("start", {}).get("dateTime") or e.get("start", {}).get("date"), "end": e.get("end", {}).get("dateTime") or e.get("end", {}).get("date"), "description": e.get("description", ""), "location": e.get("location", ""), "htmlLink": e.get("htmlLink")}

async def _calendar_service(settings, db):
    creds = await credentials_from_db(settings, db)
    if not creds: raise RuntimeError("Google not connected")
    return build("calendar", "v3", credentials=creds, cache_discovery=False)

async def list_events(settings, db, time_min, time_max):
    svc = await _calendar_service(settings, db)
    def _list():
        return svc.events().list(calendarId="primary", timeMin=time_min.isoformat(), timeMax=time_max.isoformat(), singleEvents=True, orderBy="startTime").execute().get("items", [])
    return [_normalize_event(e) for e in await asyncio.to_thread(_list)]

async def list_today_events(settings, db):
    now = datetime.now(timezone.utc); start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return await list_events(settings, db, start, start + timedelta(days=1))

async def create_event(settings, db, title, start_iso, duration_minutes=60, description="", location=""):
    svc = await _calendar_service(settings, db)
    start = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
    if start.tzinfo is None: start = start.replace(tzinfo=timezone.utc)
    end = start + timedelta(minutes=duration_minutes)
    body = {"summary": title, "description": description, "start": {"dateTime": start.isoformat(), "timeZone": "UTC"}, "end": {"dateTime": end.isoformat(), "timeZone": "UTC"}}
    if location: body["location"] = location
    event = await asyncio.to_thread(lambda: svc.events().insert(calendarId="primary", body=body).execute())
    return _normalize_event(event)

async def update_event(settings, db, event_id, *, title=None, start_iso=None, duration_minutes=None, description=None, location=None):
    svc = await _calendar_service(settings, db)
    def _patch():
        existing = svc.events().get(calendarId="primary", eventId=event_id).execute()
        if title is not None: existing["summary"] = title
        if description is not None: existing["description"] = description
        if location is not None: existing["location"] = location
        if start_iso is not None:
            start = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
            if start.tzinfo is None: start = start.replace(tzinfo=timezone.utc)
            existing["start"] = {"dateTime": start.isoformat(), "timeZone": "UTC"}
            existing["end"] = {"dateTime": (start + timedelta(minutes=duration_minutes or 60)).isoformat(), "timeZone": "UTC"}
        elif duration_minutes is not None and existing.get("start", {}).get("dateTime"):
            start = datetime.fromisoformat(existing["start"]["dateTime"].replace("Z", "+00:00"))
            existing["end"] = {"dateTime": (start + timedelta(minutes=duration_minutes)).isoformat(), "timeZone": "UTC"}
        return svc.events().update(calendarId="primary", eventId=event_id, body=existing).execute()
    return _normalize_event(await asyncio.to_thread(_patch))

async def delete_event(settings, db, event_id):
    svc = await _calendar_service(settings, db)
    await asyncio.to_thread(lambda: svc.events().delete(calendarId="primary", eventId=event_id).execute())
    return {"deleted": True, "id": event_id}
