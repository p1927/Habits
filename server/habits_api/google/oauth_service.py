from __future__ import annotations

from urllib.parse import parse_qs, urlparse

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.oauth_store import pop_flow, store_flow
from habits_api.google.sheets import oauth_flow


class OAuthNotConfiguredError(Exception):
    """Google OAuth client credentials are missing."""


class OAuthStateMissingError(Exception):
    """OAuth callback is missing the state parameter."""


class OAuthSessionExpiredError(Exception):
    """OAuth flow session expired or was not started."""


class OAuthTokenError(Exception):
    """Token exchange or refresh token validation failed."""


def _ensure_oauth_configured(settings: Settings) -> None:
    if not settings.google_client_id:
        raise OAuthNotConfiguredError()


async def start_google_oauth(settings: Settings) -> str:
    _ensure_oauth_configured(settings)
    flow = oauth_flow(settings)
    url, state = flow.authorization_url(access_type="offline", prompt="consent")
    store_flow(state, flow)
    return url


async def finish_google_oauth(settings: Settings, db: TokenDB, callback_url: str) -> str:
    _ensure_oauth_configured(settings)

    query = parse_qs(urlparse(callback_url).query)
    state = query.get("state", [None])[0]
    if not state:
        raise OAuthStateMissingError()

    flow = pop_flow(state)
    if not flow:
        raise OAuthSessionExpiredError()

    try:
        flow.fetch_token(authorization_response=callback_url)
    except Exception as exc:
        raise OAuthTokenError(str(exc)) from exc

    creds = flow.credentials
    if not creds or not creds.refresh_token:
        raise OAuthTokenError("No refresh token — revoke app access and retry")

    await db.save_google_token(creds.refresh_token, " ".join(creds.scopes or []))
    pwa = settings.habits_pwa_url.rstrip("/")
    return f"{pwa}/?google=connected#settings"


async def disconnect_google(db: TokenDB) -> dict:
    await db.clear_google_token()
    return {"ok": True, "google_connected": False}
