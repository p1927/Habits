from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.calendar import service as calendar_service
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


class CreateEventRequest(BaseModel):
    title: str = Field(min_length=1)
    start: str = Field(min_length=1, description="ISO datetime")
    duration_minutes: int = Field(default=60, ge=5, le=480)
    description: str = ""
    location: str = ""


@router.get("/api/calendar/today", dependencies=[Depends(require_bearer)])
async def calendar_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(calendar_service.get_today_events(settings, db))


@router.post("/api/calendar/event", dependencies=[Depends(require_bearer)])
async def calendar_create_event(
    body: CreateEventRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        calendar_service.create_event(
            settings,
            db,
            body.title,
            body.start,
            body.duration_minutes,
            body.description,
            body.location,
        ),
        map_value_error=True,
    )
