from __future__ import annotations

from habits_api.food.body_targets import get_body_targets, get_food_targets
from habits_api.food.history_sheet import get_food_history
from habits_api.food.log_operations import (
    delete_log_row,
    log_food_item,
    log_food_with_macros,
    log_meal_description,
    search_food_db,
    update_log_row,
)
from habits_api.food.models import FoodDbEntry, FoodLogItem
from habits_api.food.sheet_log import get_protein_target, load_daily_log, load_food_db
from habits_api.food.today_summary import get_today_summary

# Re-export for callers that import from service (settings, vision, routes).
__all__ = [
    "FoodDbEntry",
    "FoodLogItem",
    "delete_log_row",
    "get_body_targets",
    "get_food_history",
    "get_food_targets",
    "get_protein_target",
    "get_today_summary",
    "load_daily_log",
    "load_food_db",
    "log_food_item",
    "log_food_with_macros",
    "log_meal_description",
    "search_food_db",
    "update_log_row",
]
