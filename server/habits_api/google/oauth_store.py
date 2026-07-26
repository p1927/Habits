from __future__ import annotations

import time
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from google_auth_oauthlib.flow import Flow

_PENDING: dict[str, tuple[float, Flow]] = {}
_TTL_SECONDS = 600


def store_flow(state: str, flow: Flow) -> None:
    _purge_expired()
    _PENDING[state] = (time.time() + _TTL_SECONDS, flow)


def pop_flow(state: str) -> Flow | None:
    _purge_expired()
    entry = _PENDING.pop(state, None)
    if not entry:
        return None
    expires_at, flow = entry
    if time.time() > expires_at:
        return None
    return flow


def _purge_expired() -> None:
    now = time.time()
    expired = [key for key, (expires_at, _) in _PENDING.items() if now > expires_at]
    for key in expired:
        del _PENDING[key]
