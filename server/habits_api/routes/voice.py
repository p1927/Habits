from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.routes.api import get_settings
from habits_api.voice.livekit import (
    ConnectionDetailsRequest,
    ConnectionDetailsResponse,
    create_connection_details,
)

router = APIRouter()


@router.post(
    "/api/connection-details",
    response_model=ConnectionDetailsResponse,
    dependencies=[Depends(require_bearer)],
)
async def connection_details(
    body: ConnectionDetailsRequest,
    settings: Settings = Depends(get_settings),
) -> ConnectionDetailsResponse:
    try:
        return await create_connection_details(settings, body)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
