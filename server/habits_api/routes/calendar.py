from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google import calendar as calendar_api
from habits_api.routes.api import get_db, get_settings

router = APIRouter()


class CreateEventRequest(BaseModel):
    title: str = Field(min_length=1)
    start: str = Field(min_length=1, description="ISO datetime")
    duration_minutes: int = Field(default=60, ge=5, le=480)
    description: str = ""


@router.get("/api/calendar/today", dependencies=[Depends(require_bearer)])
async def calendar_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        if not await db.google_connected():
            return {"events": [], "sheets_connected": False}
        events = await calendar_api.list_today_events(settings, db)
        return {"events": events, "sheets_connected": True}
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc


@router.post("/api/calendar/event", dependencies=[Depends(require_bearer)])
async def calendar_create_event(
    body: CreateEventRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        event = await calendar_api.create_event(
            settings,
            db,
            body.title,
            body.start,
            body.duration_minutes,
            body.description,
        )
        return {"event": event}
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(400, str(exc)) from exc
