from __future__ import annotations

import json
from typing import Any

import httpx

from habits_api.agent.context import build_agent_context
from habits_api.agent.tools import AGENT_TOOLS, execute_tool
from habits_api.config import Settings
from habits_api.db import TokenDB


def _build_user_message(message: str, image_base64: str | None) -> dict[str, Any]:
    if not image_base64:
        return {"role": "user", "content": message}
    data_uri = image_base64 if image_base64.startswith("data:") else f"data:image/jpeg;base64,{image_base64}"
    return {
        "role": "user",
        "content": [
            {"type": "text", "text": message},
            {"type": "image_url", "image_url": {"url": data_uri}},
        ],
    }


async def chat(
    settings: Settings,
    db: TokenDB,
    message: str,
    history: list[dict] | None = None,
    image_base64: str | None = None,
) -> dict:
    if not settings.minimax_api_key:
        raise ValueError("MINIMAX_API_KEY not configured")

    context = await build_agent_context(settings, db)
    system = (
        "You are the Habits coach assistant. Help with food logging, habits, calendar, and health notes. "
        "Use tools when the user wants to log data or take action. Be concise and motivating.\n\n"
        f"Today's context:\n{json.dumps(context, indent=2)}"
    )

    messages: list[dict[str, Any]] = [{"role": "system", "content": system}]
    if history:
        messages.extend(history[-10:])
    messages.append(_build_user_message(message, image_base64))

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
            "tools": AGENT_TOOLS,
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
            result = await execute_tool(settings, db, name, args)
            tool_results.append({"tool": name, "args": args, "result": result})
            messages.append({
                "role": "tool",
                "tool_call_id": tc.get("id", name),
                "content": json.dumps(result),
            })

    return {"reply": reply, "tool_results": tool_results, "context": context}
