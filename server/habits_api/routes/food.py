from __future__ import annotations

from fastapi import APIRouter, Depends

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.food_schemas import (
    FoodItemRequest,
    FoodLogRequest,
    FoodMacrosRequest,
    FoodUpdateRequest,
)
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


@router.get("/api/food/today", dependencies=[Depends(require_bearer)])
async def food_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(food_service.get_today_summary(settings, db))


@router.get("/api/food/search", dependencies=[Depends(require_bearer)])
async def food_search(
    q: str,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    results = await invoke_service(food_service.search_food_db(settings, db, q))
    return {"results": results}


@router.post("/api/food/log", dependencies=[Depends(require_bearer)])
async def food_log(
    body: FoodLogRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_service.log_meal_description(settings, db, body.description, body.meal_type),
        map_value_error=True,
    )


@router.post("/api/food/item", dependencies=[Depends(require_bearer)])
async def food_log_item(
    body: FoodItemRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_service.log_food_item(settings, db, body.food, body.quantity_g),
        map_value_error=True,
    )


@router.post("/api/food/item/macros", dependencies=[Depends(require_bearer)])
async def food_log_item_macros(
    body: FoodMacrosRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_service.log_food_with_macros(
            settings,
            db,
            body.food,
            body.quantity_g,
            body.calories,
            body.carbs,
            body.protein,
            body.fat,
        ),
        map_value_error=True,
    )


@router.put("/api/food/log/{row}", dependencies=[Depends(require_bearer)])
async def food_update_row(
    row: int,
    body: FoodUpdateRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_service.update_log_row(settings, db, row, body.food, body.quantity_g),
        map_value_error=True,
    )


@router.delete("/api/food/log/{row}", dependencies=[Depends(require_bearer)])
async def food_delete_row(
    row: int,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_service.delete_log_row(settings, db, row),
        map_value_error=True,
    )
