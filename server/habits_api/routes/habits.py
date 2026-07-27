from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.habits import service as habits_service
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


class MetricUpdate(BaseModel):
    value: float | None = None


@router.get("/api/habits/today", dependencies=[Depends(require_bearer)])
async def habits_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(habits_service.get_today_tracker(settings, db))


@router.put("/api/habits/today/{metric}", dependencies=[Depends(require_bearer)])
async def habits_update_metric(
    metric: str,
    body: MetricUpdate,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        habits_service.update_metric(settings, db, metric, body.value),
        map_value_error=True,
    )


@router.get("/api/habits/week", dependencies=[Depends(require_bearer)])
async def habits_week(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(habits_service.get_week_summary(settings, db))


@router.get("/api/habits/streaks", dependencies=[Depends(require_bearer)])
async def habits_streaks(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(habits_service.get_streaks(settings, db))
