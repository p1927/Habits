from __future__ import annotations

from collections.abc import Awaitable
from typing import TypeVar

from fastapi import HTTPException

T = TypeVar("T")


async def invoke_service(coro: Awaitable[T], *, map_value_error: bool = False) -> T:
    try:
        return await coro
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        if map_value_error:
            raise HTTPException(400, str(exc)) from exc
        raise
