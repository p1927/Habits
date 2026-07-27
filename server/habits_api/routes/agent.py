from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from habits_api.agent import service as agent_service
from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


class ChatMessage(BaseModel):
    message: str = Field(min_length=1)
    history: list[dict] | None = None


@router.post("/api/agent/chat", dependencies=[Depends(require_bearer)])
async def agent_chat(
    body: ChatMessage,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        agent_service.chat(settings, db, body.message, body.history),
        map_value_error=True,
    )
