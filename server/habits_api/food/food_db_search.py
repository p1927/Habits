from __future__ import annotations

from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food.parser import fuzzy_match_food
from habits_api.food.sheet_log import load_food_db


async def search_food_db(settings: Settings, db: TokenDB, query: str) -> list[dict]:
    entries = await load_food_db(settings, db)
    q = query.lower().strip()
    results = [
        {
            "name": e.name,
            "ref_grams": e.ref_grams,
            "protein": e.protein,
            "calories": e.calories,
        }
        for e in entries
        if q in e.name.lower()
    ]
    if not results:
        match = fuzzy_match_food(query, [e.name for e in entries])
        if match:
            e = next(x for x in entries if x.name == match)
            results = [{"name": e.name, "ref_grams": e.ref_grams, "protein": e.protein, "calories": e.calories}]
    return results[:20]
