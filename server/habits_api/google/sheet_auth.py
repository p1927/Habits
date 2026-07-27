from __future__ import annotations

import os
from typing import Any

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheet_constants import SCOPES


def _client_config(settings: Settings) -> dict[str, Any]:
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_redirect_uri],
        }
    }


def oauth_flow(settings: Settings) -> Flow:
    if settings.google_redirect_uri.startswith("http://"):
        os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    return Flow.from_client_config(
        _client_config(settings),
        scopes=SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )


async def credentials_from_db(settings: Settings, db: TokenDB) -> Credentials | None:
    row = await db.get_google_token()
    if not row:
        return None
    refresh_token, scopes_raw = row
    scopes = [s for s in scopes_raw.split(" ") if s]
    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=scopes or SCOPES,
    )
