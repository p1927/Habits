from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.google.sheets import read_key_value_block


def _physio_num(physio: dict[str, object], key: str, default: float | None = None) -> float | None:
    if key not in physio:
        return default
    try:
        return float(str(physio[key]).replace("g", "").replace("kg", "").strip())
    except ValueError:
        return default


async def get_body_targets(settings: Settings, db: TokenDB) -> dict:
    physio = await read_key_value_block(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_body_config,
        "A1:C30",
    )
    return {
        "weight_kg": _physio_num(physio, "Weight"),
        "protein_target_g": _physio_num(physio, "Protein target") or _physio_num(physio, "Protein target (g)"),
        "calorie_target": _physio_num(physio, "Calorie target") or _physio_num(physio, "Calories target") or 2200.0,
    }


async def get_food_targets(settings: Settings, db: TokenDB) -> dict:
    if not await db.google_connected():
        return {"calorie_target": 2200, "protein_target_g": 150, "sheets_connected": False}
    targets = await get_body_targets(settings, db)
    return {**targets, "sheets_connected": True}
