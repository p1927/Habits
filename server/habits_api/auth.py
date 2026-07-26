from __future__ import annotations

from fastapi import Header, HTTPException, Request, status


async def require_bearer(
    request: Request,
    authorization: str = Header(default=""),
) -> None:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bearer token required")
    token = authorization[7:].strip()
    db = request.app.state.db
    if not await db.verify_bearer(token):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid bearer token")


async def require_admin(
    request: Request,
    x_admin_token: str = Header(default="", alias="X-Admin-Token"),
) -> None:
    import secrets

    expected = request.app.state.settings.habits_admin_secret
    if not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Admin token required")
