from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.google.sheets import read_range


def _float(val, default=0.0):
    if val is None or val == "":
        return default
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return default


def _is_placeholder(name: str) -> bool:
    n = name.strip().lower()
    return not n or n in ("...", "…", "-", "food", "total")


async def get_saved_recipe(settings: Settings, db: TokenDB) -> dict:
    connected = await db.google_connected()
    if not connected:
        return {"recipe": None, "sheets_connected": False}

    rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_recipes,
        "B1:G30",
    )

    name = "Saved recipe"
    for row in rows:
        if row and str(row[0]).strip().lower() == "save as" and len(row) > 1:
            # Name may be on same row col C or next rows
            pass
        if row and len(row) > 0 and str(row[0]).strip().lower() not in ("save as", "food", "food  "):
            candidate = str(row[0]).strip()
            if candidate and not _is_placeholder(candidate) and candidate.lower() != "total":
                # Row 16 style name-only row after Save as section
                if len(row) == 1 or (row[1] is None and row[2] is None):
                    if _float(row[1] if len(row) > 1 else 0) == 0 and candidate not in name:
                        name = candidate

    # Re-read name from typical cell B16
    name_rows = await read_range(
        settings,
        db,
        settings.habits_sheet_nutrition,
        settings.habits_tab_recipes,
        "B16:B16",
    )
    if name_rows and name_rows[0] and name_rows[0][0]:
        n = str(name_rows[0][0]).strip()
        if n and n.lower() != "save as":
            name = n

    items: list[dict] = []
    totals: dict | None = None

    for row in rows:
        if not row or len(row) < 2:
            continue
        food = str(row[0]).strip() if row[0] else ""
        if food.lower() == "total":
            totals = {
                "quantity_g": _float(row[1] if len(row) > 1 else 0),
                "calories": _float(row[2] if len(row) > 2 else 0),
                "carbs": _float(row[3] if len(row) > 3 else 0),
                "protein": _float(row[4] if len(row) > 4 else 0),
                "fat": _float(row[5] if len(row) > 5 else 0),
            }
            break
        if _is_placeholder(food) or food.lower() in ("food", "save as"):
            continue
        qty = _float(row[1] if len(row) > 1 else 0)
        if qty <= 0:
            continue
        items.append({
            "food": food,
            "quantity_g": qty,
            "calories": _float(row[2] if len(row) > 2 else 0),
            "carbs": _float(row[3] if len(row) > 3 else 0),
            "protein": _float(row[4] if len(row) > 4 else 0),
            "fat": _float(row[5] if len(row) > 5 else 0),
        })

    if not items:
        return {"recipe": None, "sheets_connected": True}

    return {
        "recipe": {
            "name": name,
            "items": items,
            "totals": totals,
        },
        "sheets_connected": True,
    }


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
