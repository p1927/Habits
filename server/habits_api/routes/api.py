from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from habits_api.auth import require_admin, require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import oauth_flow
from habits_api.routes import settings as settings_routes

router = APIRouter()


class IssueRequest(BaseModel):
    device_id: str = Field(min_length=1, max_length=64)
    label: str = ""


class IssueResponse(BaseModel):
    device_id: str
    bearer: str


class SettingsUpdate(BaseModel):
    body: dict[str, Any] | None = None
    meal_plan: dict[str, Any] | None = None
    notification_times: dict[str, str] | None = None


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
    if not settings.google_client_id:
        raise HTTPException(503, "Google OAuth not configured")
    flow = oauth_flow(settings)
    url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    return RedirectResponse(url)


@router.get("/auth/callback")
async def auth_callback(
    request: Request,
    settings: Settings = Depends(get_settings),
    db: TokenDB = Depends(get_db),
):
    if not settings.google_client_id:
        raise HTTPException(503, "Google OAuth not configured")
    flow = oauth_flow(settings)
    flow.fetch_token(authorization_response=str(request.url))
    creds = flow.credentials
    if not creds or not creds.refresh_token:
        raise HTTPException(400, "No refresh token — revoke app access and retry")
    await db.save_google_token(creds.refresh_token, " ".join(creds.scopes or []))
    pwa = settings.habits_pwa_url.rstrip("/")
    return RedirectResponse(f"{pwa}/?google=connected#settings")


@router.delete("/auth/google", dependencies=[Depends(require_bearer)])
async def auth_google_disconnect(db: TokenDB = Depends(get_db)) -> dict:
    await db.clear_google_token()
    return {"ok": True, "google_connected": False}


@router.get("/api/settings", dependencies=[Depends(require_bearer)])
async def get_settings_route(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await settings_routes.load_settings(settings, db)


@router.put("/api/settings", dependencies=[Depends(require_bearer)])
async def put_settings_route(
    body: SettingsUpdate,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await settings_routes.save_settings(settings, db, body.model_dump(exclude_none=True))
