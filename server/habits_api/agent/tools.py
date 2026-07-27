from __future__ import annotations

from typing import Any

from habits_api.cards import service as cards_service
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.google.calendar import create_event
from habits_api.habits import service as habits_service
from habits_api.habits.models import METRICS

AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "log_food",
            "description": "Log food eaten, e.g. '200g paneer'",
            "parameters": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "meal_type": {"type": "string", "enum": ["breakfast", "lunch", "dinner", "snack", "other"]},
                },
                "required": ["description"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_habit",
            "description": "Update today's habit metric hours",
            "parameters": {
                "type": "object",
                "properties": {
                    "metric": {"type": "string", "enum": list(METRICS)},
                    "value": {"type": "number"},
                },
                "required": ["metric", "value"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_event",
            "description": "Create a calendar event",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "start": {"type": "string", "description": "ISO datetime"},
                    "duration_minutes": {"type": "integer"},
                },
                "required": ["title", "start"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "add_card",
            "description": "Add a sickness, notes, or strategy card",
            "parameters": {
                "type": "object",
                "properties": {
                    "card_type": {"type": "string", "enum": ["sickness", "notes", "strategy"]},
                    "title": {"type": "string"},
                    "body": {"type": "string"},
                },
                "required": ["card_type", "title", "body"],
            },
        },
    },
]


async def execute_tool(settings: Settings, db: TokenDB, name: str, args: dict) -> dict[str, Any]:
    if name == "log_food":
        return await food_service.log_meal_description(
            settings, db, args.get("description", ""), args.get("meal_type", "other")
        )
    if name == "update_habit":
        return await habits_service.update_metric(
            settings, db, args.get("metric", ""), args.get("value")
        )
    if name == "create_event":
        return await create_event(
            settings,
            db,
            args.get("title", "Event"),
            args.get("start", ""),
            args.get("duration_minutes", 60),
        )
    if name == "add_card":
        return await cards_service.create_card(
            settings,
            db,
            args.get("card_type", "notes"),
            args.get("title", ""),
            args.get("body", ""),
        )
    return {"error": f"Unknown tool: {name}"}
