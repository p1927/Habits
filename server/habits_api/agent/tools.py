from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from habits_api.cards import service as cards_service
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.google.calendar import create_event, delete_event, list_events, update_event
from habits_api.habits import service as habits_service
from habits_api.habits.models import METRICS

AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_food",
            "description": "Search the food database by name before logging.",
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
            "description": "Log food from a natural language description.",
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
            "description": "Log a specific food with exact name and grams.",
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
            "description": "Get today\'s logged food and macro totals.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_habit",
            "description": "Update today\'s habit metric hours.",
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
            "description": "List calendar events for a date range.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string"},
                    "days": {"type": "integer"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_event",
            "description": "Create a calendar event.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "start": {"type": "string"},
                    "duration_minutes": {"type": "integer"},
                    "description": {"type": "string"},
                    "location": {"type": "string"},
                },
                "required": ["title", "start"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_calendar_event",
            "description": "Update or reschedule a calendar event.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_id": {"type": "string"},
                    "title": {"type": "string"},
                    "start": {"type": "string"},
                    "duration_minutes": {"type": "integer"},
                    "description": {"type": "string"},
                    "location": {"type": "string"},
                },
                "required": ["event_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_calendar_event",
            "description": "Delete a calendar event.",
            "parameters": {
                "type": "object",
                "properties": {"event_id": {"type": "string"}},
                "required": ["event_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "add_card",
            "description": "Add a sickness, notes, or strategy card.",
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


def _parse_date_range(date_str: str | None, days: int | None) -> tuple[datetime, datetime]:
    span = max(1, min(days or 1, 14))
    if date_str:
        base = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
    else:
        base = datetime.now(timezone.utc)
    start = base.replace(hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=span)


async def execute_tool(settings: Settings, db: TokenDB, name: str, args: dict) -> dict[str, Any]:
    try:
        if name == "search_food":
            results = await food_service.search_food_db(settings, db, args.get("query", ""))
            return {"results": results, "count": len(results)}
        if name == "log_food":
            return await food_service.log_meal_description(
                settings, db, args.get("description", ""), args.get("meal_type", "other")
            )
        if name == "log_food_item":
            result = await food_service.log_food_item(
                settings, db, args.get("food_name", ""), float(args.get("quantity_g", 0))
            )
            result["meal_type"] = args.get("meal_type", "other")
            return result
        if name == "get_food_today":
            return await food_service.get_today_summary(settings, db)
        if name == "update_habit":
            return await habits_service.update_metric(settings, db, args.get("metric", ""), args.get("value"))
        if name == "list_calendar_events":
            start, end = _parse_date_range(args.get("date"), args.get("days"))
            events = await list_events(settings, db, start, end)
            return {"events": events, "count": len(events)}
        if name == "create_event":
            return await create_event(
                settings, db,
                args.get("title", "Event"),
                args.get("start", ""),
                args.get("duration_minutes", 60),
                args.get("description", ""),
                args.get("location", ""),
            )
        if name == "update_calendar_event":
            return await update_event(
                settings, db, args.get("event_id", ""),
                title=args.get("title"),
                start_iso=args.get("start"),
                duration_minutes=args.get("duration_minutes"),
                description=args.get("description"),
                location=args.get("location"),
            )
        if name == "delete_calendar_event":
            return await delete_event(settings, db, args.get("event_id", ""))
        if name == "add_card":
            return await cards_service.create_card(
                settings, db,
                args.get("card_type", "notes"),
                args.get("title", ""),
                args.get("body", ""),
            )
        return {"error": f"Unknown tool: {name}"}
    except ValueError as exc:
        return {"error": str(exc)}
    except RuntimeError as exc:
        return {"error": str(exc)}
