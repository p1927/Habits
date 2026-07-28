from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from livekit.api import AccessToken, VideoGrants
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.routes.api import get_settings

router = APIRouter()


class VoiceTokenRequest(BaseModel):
    room: str | None = Field(default=None, max_length=64)


class VoiceTokenResponse(BaseModel):
    token: str
    url: str
    room: str
    identity: str


@router.post(
    "/api/voice/token",
    response_model=VoiceTokenResponse,
    dependencies=[Depends(require_bearer)],
)
async def voice_token(
    body: VoiceTokenRequest,
    settings: Settings = Depends(get_settings),
) -> VoiceTokenResponse:
    if not settings.livekit_api_key or not settings.livekit_api_secret:
        raise HTTPException(503, "LiveKit is not configured")

    room = body.room or f"habits-voice-{uuid.uuid4().hex[:8]}"
    identity = f"habits-user-{uuid.uuid4().hex[:8]}"
    token = (
        AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(identity)
        .with_name("Habits user")
        .with_grants(VideoGrants(room_join=True, room=room))
        .to_jwt()
    )
    return VoiceTokenResponse(
        token=token,
        url=settings.livekit_url,
        room=room,
        identity=identity,
    )
