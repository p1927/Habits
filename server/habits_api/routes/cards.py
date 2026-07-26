from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.cards import service as cards_service
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.routes.api import get_db, get_settings

router = APIRouter()


class CreateCardRequest(BaseModel):
    card_type: str = Field(pattern="^(sickness|notes|strategy)$")
    title: str = Field(min_length=1)
    body: str = ""


@router.get("/api/cards", dependencies=[Depends(require_bearer)])
async def list_cards(
    type: str | None = Query(None, alias="type"),
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await cards_service.list_cards(settings, db, type)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc


@router.post("/api/cards", dependencies=[Depends(require_bearer)])
async def create_card(
    body: CreateCardRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await cards_service.create_card(settings, db, body.card_type, body.title, body.body)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.delete("/api/cards/{card_type}/{row}", dependencies=[Depends(require_bearer)])
async def delete_card(
    card_type: str,
    row: int,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await cards_service.delete_card(settings, db, card_type, row)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
