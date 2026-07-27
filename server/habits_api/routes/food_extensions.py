from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from habits_api.auth import require_bearer
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import meal_plan as food_meal_plan
from habits_api.food import recipes as food_recipes
from habits_api.food import service as food_service
from habits_api.food import vision as food_vision
from habits_api.routes.api import get_db, get_settings
from habits_api.routes.food_schemas import MealPlanLogRequest
from habits_api.routes.service_invoke import invoke_service

router = APIRouter()


@router.get("/api/food/history", dependencies=[Depends(require_bearer)])
async def food_history(
    days: int = 7,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_service.get_food_history(settings, db, days=min(days, 30)),
    )


@router.get("/api/food/targets", dependencies=[Depends(require_bearer)])
async def food_targets(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(food_service.get_food_targets(settings, db))


@router.post("/api/food/scan", dependencies=[Depends(require_bearer)])
async def food_scan(
    file: UploadFile = File(...),
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 10MB)")
    ct = file.content_type or "image/jpeg"
    return await invoke_service(
        food_vision.scan_food_image(settings, db, content, ct),
        map_value_error=True,
    )


@router.get("/api/food/recipes", dependencies=[Depends(require_bearer)])
async def food_recipes_list(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(food_recipes.get_saved_recipe(settings, db))


@router.post("/api/food/recipes/log", dependencies=[Depends(require_bearer)])
async def food_recipes_log(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_recipes.log_saved_recipe(settings, db),
        map_value_error=True,
    )


@router.get("/api/food/meal-plan/today", dependencies=[Depends(require_bearer)])
async def meal_plan_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(food_meal_plan.get_today_meal_plan(settings, db))


@router.post("/api/food/meal-plan/log-today", dependencies=[Depends(require_bearer)])
async def meal_plan_log_today(
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_meal_plan.log_today_meal_plan(settings, db),
        map_value_error=True,
    )


@router.post("/api/food/meal-plan/log", dependencies=[Depends(require_bearer)])
async def meal_plan_log_item(
    body: MealPlanLogRequest,
    db: TokenDB = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    return await invoke_service(
        food_meal_plan.log_meal_plan_item(settings, db, body.meal),
        map_value_error=True,
    )
