from __future__ import annotations

from typing import Any

from habits_api.cards import service as cards_service
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.google.calendar import create_event, list_today_events
from habits_api.habits import service as habits_service
from habits_api.habits.models import METRICS

AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_food",
            "description": "Search the food database before logging.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "log_food",
            "description": "Log food eaten from a natural language description.",
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
            "name": "log_food_item",
            "description": "Log a specific food with exact grams.",
            "parameters": {
                "type": "object",
                "properties": {
                    "food_name": {"type": "string"},
                    "quantity_g": {"type": "number"},
                    "meal_type": {"type": "string", "enum": ["breakfast", "lunch", "dinner", "snack", "other"]},
                },
                "required": ["food_name", "quantity_g"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_food_today",
            "description": "Get today's protein, calories, and logged food items.",
            "parameters": {"type": "object", "properties": {}},
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
            "name": "list_calendar_events",
            "description": "List calendar events for today.",
            "parameters": {"type": "object", "properties": {}},
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
                    "description": {"type": "string"},
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
    try:
        if name in {"search_food", "search_food_db"}:
            results = await food_service.search_food_db(settings, db, args.get("query", ""))
            return {"results": results, "count": len(results)}

        if name in {"log_food", "log_meal"}:
            return await food_service.log_meal_description(
                settings, db, args.get("description", ""), args.get("meal_type", "other")
            )

        if name == "log_food_item":
            out = await food_service.log_food_item(
                settings, db, args.get("food_name", ""), float(args.get("quantity_g", 0))
            )
            out["meal_type"] = args.get("meal_type", "other")
            return out

        if name == "get_food_today":
            return await food_service.get_today_summary(settings, db)

        if name == "update_habit":
            return await habits_service.update_metric(
                settings, db, args.get("metric", ""), args.get("value")
            )

        if name in {"list_calendar_events", "get_calendar_today"}:
            events = await list_today_events(settings, db)
            return {"events": events, "count": len(events)}

        if name in {"create_event", "create_calendar_event"}:
            return await create_event(
                settings,
                db,
                args.get("title", "Event"),
                args.get("start", args.get("start_iso", "")),
                args.get("duration_minutes", 60),
                args.get("description", ""),
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
    except ValueError as exc:
        return {"error": str(exc)}
    except RuntimeError as exc:
        return {"error": str(exc)}
