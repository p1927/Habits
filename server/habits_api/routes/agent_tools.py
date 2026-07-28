from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from habits_api.agent.tools import AGENT_TOOLS, execute_tool
from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.routes.api import get_db, get_settings

router = APIRouter()


class ToolExecuteRequest(BaseModel):
    name: str = Field(min_length=1)
    args: dict = Field(default_factory=dict)


@router.get("/api/agent/tools", dependencies=[Depends(require_bearer)])
async def list_agent_tools() -> dict:
    return {"tools": AGENT_TOOLS}


@router.post("/api/agent/tools/execute", dependencies=[Depends(require_bearer)])
async def agent_tools_execute(
    body: ToolExecuteRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    result = await execute_tool(settings, db, body.name, body.args)
    return {"result": result}
