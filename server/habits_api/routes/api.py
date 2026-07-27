from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from habits_api.auth import require_admin, require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.oauth_service import (
    disconnect_google,
    finish_google_oauth,
    start_google_oauth,
)
from habits_api.routes.api_schemas import SettingsUpdate, oauth_http_exception
from habits_api.routes.service_invoke import invoke_service
from habits_api.settings import service as settings_service

router = APIRouter()


class IssueRequest(BaseModel):
    device_id: str = Field(min_length=1, max_length=64)
    label: str = ""


class IssueResponse(BaseModel):
    device_id: str
    bearer: str


def get_db(request: Request) -> TokenDB:
    return request.app.state.db


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


@router.get("/healthz")
async def healthz(request: Request) -> dict:
    db: TokenDB = request.app.state.db
    return {
        "ok": True,
        "google_connected": await db.google_connected(),
    }


@router.post("/api/issue", response_model=IssueResponse, dependencies=[Depends(require_admin)])
async def issue_token(body: IssueRequest, db: TokenDB = Depends(get_db)) -> IssueResponse:
    bearer = await db.issue_bearer(body.device_id, body.label)
    return IssueResponse(device_id=body.device_id, bearer=bearer)


@router.get("/auth/google")
async def auth_google(settings: Settings = Depends(get_settings)):
    try:
        url = await start_google_oauth(settings)
    except Exception as exc:
        raise oauth_http_exception(exc) from exc
    return RedirectResponse(url)


@router.get("/auth/callback")
async def auth_callback(
    request: Request,
    settings: Settings = Depends(get_settings),
    db: TokenDB = Depends(get_db),
):
    try:
        redirect_url = await finish_google_oauth(settings, db, str(request.url))
    except Exception as exc:
        raise oauth_http_exception(exc) from exc
    return RedirectResponse(redirect_url)


@router.delete("/auth/google", dependencies=[Depends(require_bearer)])
async def auth_google_disconnect(db: TokenDB = Depends(get_db)) -> dict:
    return await disconnect_google(db)


@router.get("/api/settings", dependencies=[Depends(require_bearer)])
async def get_settings_route(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(settings_service.load_settings(settings, db))


@router.put("/api/settings", dependencies=[Depends(require_bearer)])
async def put_settings_route(
    body: SettingsUpdate,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        settings_service.save_settings(settings, db, body.model_dump(exclude_none=True)),
    )
