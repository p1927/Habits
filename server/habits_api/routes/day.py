from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.day import service as day_service
from habits_api.routes.api import get_db, get_settings

router = APIRouter()


class ManageDayUpdate(BaseModel):
    quadrant: str = Field(pattern="^(do_today|schedule|delegate|eliminate)$")
    items: list[str]


@router.get("/api/day/manage", dependencies=[Depends(require_bearer)])
async def get_manage_day(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await day_service.get_manage_day(settings, db)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc


@router.put("/api/day/manage", dependencies=[Depends(require_bearer)])
async def update_manage_day(
    body: ManageDayUpdate,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await day_service.update_manage_day(settings, db, body.quadrant, body.items)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
