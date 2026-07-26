from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.routes.api import get_db, get_settings

router = APIRouter()


class FoodLogRequest(BaseModel):
    description: str = Field(min_length=1)
    meal_type: str = "other"


class FoodItemRequest(BaseModel):
    food: str = Field(min_length=1)
    quantity_g: float = Field(gt=0)


class FoodUpdateRequest(BaseModel):
    food: str | None = None
    quantity_g: float | None = Field(default=None, gt=0)


@router.get("/api/food/today", dependencies=[Depends(require_bearer)])
async def food_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await food_service.get_today_summary(settings, db)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc


@router.get("/api/food/search", dependencies=[Depends(require_bearer)])
async def food_search(
    q: str,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        results = await food_service.search_food_db(settings, db, q)
        return {"results": results}
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc


@router.post("/api/food/log", dependencies=[Depends(require_bearer)])
async def food_log(
    body: FoodLogRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await food_service.log_meal_description(
            settings, db, body.description, body.meal_type
        )
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/api/food/item", dependencies=[Depends(require_bearer)])
async def food_log_item(
    body: FoodItemRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await food_service.log_food_item(settings, db, body.food, body.quantity_g)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.put("/api/food/log/{row}", dependencies=[Depends(require_bearer)])
async def food_update_row(
    row: int,
    body: FoodUpdateRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await food_service.update_log_row(
            settings, db, row, body.food, body.quantity_g
        )
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.delete("/api/food/log/{row}", dependencies=[Depends(require_bearer)])
async def food_delete_row(
    row: int,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        return await food_service.delete_log_row(settings, db, row)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
