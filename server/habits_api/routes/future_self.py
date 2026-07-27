from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.future_self import service as future_self_service
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


class AcceptCardRequest(BaseModel):
    card_id: str = Field(min_length=1)


class ProjectionRequest(BaseModel):
    photo_base64: str = Field(min_length=100)
    habit_id: str = "general"


@router.get("/api/future-self/summary", dependencies=[Depends(require_bearer)])
async def future_self_summary(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(future_self_service.get_summary(settings, db))


@router.get("/api/future-self/cards", dependencies=[Depends(require_bearer)])
async def future_self_cards(
    images: bool = Query(False),
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        future_self_service.get_card_deck(settings, db, with_images=images),
    )


@router.post("/api/future-self/projections", dependencies=[Depends(require_bearer)])
async def future_self_projections(
    body: ProjectionRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        future_self_service.generate_projections(
            settings, db, body.photo_base64, body.habit_id
        ),
    )


@router.post("/api/future-self/accept", dependencies=[Depends(require_bearer)])
async def future_self_accept(
    body: AcceptCardRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        future_self_service.accept_card(settings, db, body.card_id),
    )
