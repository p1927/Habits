from __future__ import annotations

import json
from typing import Any

import httpx

from habits_api.cards import service as cards_service
from habits_api.config import Settings
from habits_api.db import TokenDB
from habits_api.food import service as food_service
from habits_api.google.calendar import create_event, list_today_events
from habits_api.habits import service as habits_service


TOOLS = [
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
                    "metric": {"type": "string", "enum": list(habits_service.METRICS)},
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


async def chat(settings: Settings, db: TokenDB, message: str, history: list[dict] | None = None) -> dict:
    if not settings.minimax_api_key:
        raise ValueError("MINIMAX_API_KEY not configured")

    context = await _build_context(settings, db)
    system = (
        "You are the Habits coach assistant. Help with food logging, habits, calendar, and health notes. "
        "Use tools when the user wants to log data or take action. Be concise and motivating.\n\n"
        f"Today's context:\n{json.dumps(context, indent=2)}"
    )

    messages: list[dict[str, Any]] = [{"role": "system", "content": system}]
    if history:
        messages.extend(history[-10:])
    messages.append({"role": "user", "content": message})

    url = f"{settings.minimax_base_url.rstrip('/')}/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }

    tool_results: list[dict] = []
    reply = ""

    for _ in range(3):
        payload = {
            "model": settings.minimax_model,
            "messages": messages,
            "tools": TOOLS,
        }
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise ValueError(f"Chat API error: {resp.status_code} {resp.text[:200]}")
            data = resp.json()

        choice = (data.get("choices") or [{}])[0]
        msg = choice.get("message") or {}
        reply = msg.get("content") or msg.get("text") or ""
        tool_calls = msg.get("tool_calls") or []

        if not tool_calls:
            break

        messages.append(msg)
        for tc in tool_calls:
            fn = tc.get("function") or {}
            name = fn.get("name", "")
            try:
                args = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                args = {}
            result = await _execute_tool(settings, db, name, args)
            tool_results.append({"tool": name, "args": args, "result": result})
            messages.append({
                "role": "tool",
                "tool_call_id": tc.get("id", name),
                "content": json.dumps(result),
            })

    return {"reply": reply, "tool_results": tool_results, "context": context}


async def _build_context(settings: Settings, db: TokenDB) -> dict:
    food = await food_service.get_today_summary(settings, db)
    habits = await habits_service.get_today_tracker(settings, db)
    try:
        events = await list_today_events(settings, db)
    except Exception:
        events = []
    return {
        "food": {
            "protein_g": food.get("protein_g"),
            "protein_target_g": food.get("protein_target_g"),
            "calories": food.get("calories"),
        },
        "habits": habits.get("metrics"),
        "calendar_events": len(events),
    }


async def _execute_tool(settings: Settings, db: TokenDB, name: str, args: dict) -> dict:
    if name == "log_food":
        return await food_service.log_meal_description(
            settings, db, args.get("description", ""), args.get("meal_type", "other")
        )
    if name == "update_habit":
        return await habits_service.update_metric(
            settings, db, args.get("metric", ""), args.get("value")
        )
    if name == "create_event":
        ev = await create_event(
            settings,
            db,
            args.get("title", "Event"),
            args.get("start", ""),
            args.get("duration_minutes", 60),
        )
        return ev
    if name == "add_card":
        return await cards_service.create_card(
            settings,
            db,
            args.get("card_type", "notes"),
            args.get("title", ""),
            args.get("body", ""),
        )
    return {"error": f"Unknown tool: {name}"}
