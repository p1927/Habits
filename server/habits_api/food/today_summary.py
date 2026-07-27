from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.sheet_log import get_protein_target, load_daily_log


def log_success_message(
    quantity_g: float,
    name: str,
    protein_g: float,
    summary: dict,
    source_note: str = "",
) -> str:
    note = f" {source_note}" if source_note else ""
    return (
        f"Logged {quantity_g}g {name} ({protein_g}g protein){note}. "
        f"Today: {summary['protein_g']}g protein"
        + (f" of {summary['protein_target_g']}g target" if summary.get("protein_target_g") else "")
        + "."
    )


async def get_today_summary(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {
            "protein_g": 0,
            "protein_target_g": None,
            "calories": 0,
            "carbs": 0,
            "fat": 0,
            "items": [],
            "sheets_connected": False,
        }

    items = await load_daily_log(settings, db)
    protein = sum(i.protein for i in items)
    calories = sum(i.calories for i in items)
    carbs = sum(i.carbs for i in items)
    fat = sum(i.fat for i in items)
    target = await get_protein_target(settings, db)

    return {
        "protein_g": round(protein, 2),
        "protein_target_g": target,
        "calories": round(calories, 2),
        "carbs": round(carbs, 2),
        "fat": round(fat, 2),
        "items": [
            {
                "row": i.row,
                "food": i.food,
                "quantity_g": i.quantity_g,
                "calories": i.calories,
                "carbs": i.carbs,
                "protein": i.protein,
                "fat": i.fat,
            }
            for i in items
        ],
        "sheets_connected": True,
    }
