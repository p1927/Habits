from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, Field

from habits_api.google.oauth_service import (
    OAuthNotConfiguredError,
    OAuthSessionExpiredError,
    OAuthStateMissingError,
    OAuthTokenError,
)


class SettingsUpdate(BaseModel):
    body: dict[str, Any] | None = None
    meal_plan: dict[str, Any] | None = None
    notification_times: dict[str, str] | None = None


def oauth_http_exception(exc: Exception) -> HTTPException:
    if isinstance(exc, OAuthNotConfiguredError):
        return HTTPException(503, "Google OAuth not configured")
    if isinstance(exc, OAuthStateMissingError):
        return HTTPException(400, "Missing OAuth state")
    if isinstance(exc, OAuthSessionExpiredError):
        return HTTPException(400, "OAuth session expired — start Connect Google again")
    if isinstance(exc, OAuthTokenError):
        return HTTPException(400, str(exc))
    raise exc
