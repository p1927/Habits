from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.habits import service as habits_service
from habits_api.routes.api import get_db, get_settings

router = APIRouter()


class MetricUpdate(BaseModel):
    value: float | None = None


@router.get("/api/habits/today", dependencies=[Depends(require_bearer)])
async def habits_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        if not await db.google_connected():
            return {
                "date": "",
                "row": None,
                "weekday": "",
                "metrics": {m: None for m in habits_service.METRICS},
                "notes": None,
                "sheets_connected": False,
            }
        return await habits_service.get_today_tracker(settings, db)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc


@router.put("/api/habits/today/{metric}", dependencies=[Depends(require_bearer)])
async def habits_update_metric(
    metric: str,
    body: MetricUpdate,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await habits_service.update_metric(settings, db, metric, body.value)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.get("/api/habits/week", dependencies=[Depends(require_bearer)])
async def habits_week(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        if not await db.google_connected():
            return {"days_tracked": 0, "averages": {}, "recent_days": []}
        return await habits_service.get_week_summary(settings, db)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
