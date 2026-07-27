from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.food.recipe_sheet import load_saved_recipe


async def get_saved_recipe(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"recipe": None, "sheets_connected": False}

    recipe = await load_saved_recipe(settings, db)
    if not recipe:
        return {"recipe": None, "sheets_connected": True}

    return {"recipe": recipe, "sheets_connected": True}


async def log_saved_recipe(settings: Settings, db: TokenDB) -> dict:
    data = await get_saved_recipe(settings, db)
    recipe = data.get("recipe")
    if not recipe:
        raise ValueError("No saved recipe in Save Reciepe tab")

    logged = []
    errors = []
    for item in recipe["items"]:
        try:
            result = await food_service.log_food_item(
                settings, db, item["food"], item["quantity_g"]
            )
            logged.append(result)
        except ValueError as exc:
            errors.append(str(exc))

    summary = await food_service.get_today_summary(settings, db)
    return {
        "recipe": recipe["name"],
        "logged_count": len(logged),
        "errors": errors,
        "message": f"Logged recipe '{recipe['name']}' ({len(logged)} items).",
        "summary": summary,
    }
