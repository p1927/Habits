"""LiveKit connection-details — same contract as local-voice-ai Next.js route."""

from __future__ import annotations

import json
import random
from typing import Any

from livekit import api
from pydantic import BaseModel, Field

from habits_api.config import Settings


class VoicePipeline(BaseModel):
    stt: str = "whisper"
    tts: str = "kokoro"
    llm: str = "minimax"


class ConnectionDetailsRequest(BaseModel):
    voice_pipeline: VoicePipeline | None = None
    room_config: dict[str, Any] | None = None


class ConnectionDetailsResponse(BaseModel):
    serverUrl: str
    roomName: str
    participantName: str
    participantToken: str


def _livekit_http_url(ws_url: str) -> str:
    return ws_url.replace("ws://", "http://").replace("wss://", "https://")


async def create_connection_details(
    settings: Settings,
    body: ConnectionDetailsRequest,
) -> ConnectionDetailsResponse:
    api_key = settings.livekit_api_key
    api_secret = settings.livekit_api_secret
    browser_url = settings.livekit_public_url
    server_url = settings.livekit_url

    if not api_key or not api_secret:
        raise RuntimeError("LiveKit not configured")

    voice_pipeline = (body.voice_pipeline or VoicePipeline()).model_dump()
    room_name = f"habits_room_{random.randint(0, 99999)}"
    participant_name = "user"
    participant_identity = f"habits_user_{random.randint(0, 99999)}"
    metadata = json.dumps({"voicePipeline": voice_pipeline})

    lk = api.LiveKitAPI(_livekit_http_url(server_url), api_key, api_secret)
    try:
        await lk.room.create_room(
            api.CreateRoomRequest(name=room_name, metadata=metadata, empty_timeout=300)
        )
    finally:
        await lk.aclose()

    token = (
        api.AccessToken(api_key, api_secret)
        .with_identity(participant_identity)
        .with_name(participant_name)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .to_jwt()
    )

    return ConnectionDetailsResponse(
        serverUrl=browser_url,
        roomName=room_name,
        participantName=participant_name,
        participantToken=token,
    )
