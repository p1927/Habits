from __future__ import annotations

import os
import urllib.parse
from typing import Any

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheet_constants import SCOPES

# Allowed-host allow-list for the OAuth redirect URI. `OAUTHLIB_INSECURE_TRANSPORT=1`
# was previously being set lazily inside `oauth_flow()`, which leaked the env
# flag into other workers / processes even when redirect URI was HTTPS. We now
# only set it when the redirect URI points to an explicit dev loopback.
_DEV_REDIRECT_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})


def _is_dev_redirect(uri: str) -> bool:
    if not uri.lower().startswith("http://"):
        return False
    try:
        host = (urllib.parse.urlparse(uri).hostname or "").lower()
    except ValueError:
        return False
    return host in _DEV_REDIRECT_HOSTS


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
    if _is_dev_redirect(settings.google_redirect_uri):
        # Scoped to dev loopback redirects only — never to http(s)://prod-host.
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
