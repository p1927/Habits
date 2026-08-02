from __future__ import annotations

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
