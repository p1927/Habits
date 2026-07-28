from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from habits_api.agent import service as agent_service
from habits_api.agent.tools import execute_tool
from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


class ChatMessage(BaseModel):
    message: str = Field(min_length=1)
    history: list[dict] | None = None
    image_base64: str | None = Field(default=None, min_length=100)


class ToolExecuteRequest(BaseModel):
    name: str = Field(min_length=1)
    args: dict = Field(default_factory=dict)


@router.post("/api/agent/tools/execute", dependencies=[Depends(require_bearer)])
async def agent_tools_execute(
    body: ToolExecuteRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Execute a single agent tool — used by the Habits voice coach worker."""
    result = await execute_tool(settings, db, body.name, body.args)
    return {"result": result}


@router.post("/api/agent/chat", dependencies=[Depends(require_bearer)])
async def agent_chat(
    body: ChatMessage,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        agent_service.chat(settings, db, body.message, body.history, body.image_base64),
        map_value_error=True,
    )


@router.post("/api/agent/chat/stream", dependencies=[Depends(require_bearer)])
async def agent_chat_stream(
    body: ChatMessage,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> StreamingResponse:
    async def events():
        try:
            async for chunk in agent_service.chat_stream(
                settings, db, body.message, body.history, body.image_base64,
            ):
                yield chunk
        except ValueError as exc:
            yield f"event: error\ndata: {json.dumps({'message': str(exc)})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")
