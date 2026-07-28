from __future__ import annotations

import json
from typing import Any

import httpx

from habits_api.agent.context import build_agent_context
from habits_api.agent.prompts import build_system_message
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
    system = build_system_message(context)

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

    for _ in range(5):
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


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _parse_minimax_stream_line(line: str) -> tuple[str | None, list[dict]]:
    line = line.strip()
    if not line.startswith("data:"):
        return None, []
    payload = line[5:].strip()
    if not payload or payload == "[DONE]":
        return None, []
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return None, []

    choices = data.get("choices") or []
    if not choices:
        return None, []
    delta = choices[0].get("delta") or choices[0].get("message") or {}
    text = delta.get("content") or delta.get("text") or ""
    tool_calls = delta.get("tool_calls") or []
    return (text if text else None), tool_calls


def _merge_tool_call_deltas(acc: dict[int, dict], deltas: list[dict]) -> None:
    for tc in deltas:
        idx = tc.get("index", 0)
        entry = acc.setdefault(idx, {"id": "", "type": "function", "function": {"name": "", "arguments": ""}})
        if tc.get("id"):
            entry["id"] = tc["id"]
        fn = tc.get("function") or {}
        if fn.get("name"):
            entry["function"]["name"] = fn["name"]
        if fn.get("arguments"):
            entry["function"]["arguments"] += fn["arguments"]


async def _stream_minimax_round(
    settings: Settings,
    messages: list[dict[str, Any]],
) -> Any:
    """Yield token str chunks, then final assistant message dict."""
    url = f"{settings.minimax_base_url.rstrip('/')}/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {settings.minimax_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.minimax_model,
        "messages": messages,
        "tools": AGENT_TOOLS,
        "stream": True,
    }

    content_parts: list[str] = []
    tool_acc: dict[int, dict] = {}

    async with httpx.AsyncClient(timeout=90.0) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as resp:
            if resp.status_code != 200:
                body = await resp.aread()
                raise ValueError(f"Chat API error: {resp.status_code} {body[:200]!r}")

            async for line in resp.aiter_lines():
                text, tool_deltas = _parse_minimax_stream_line(line)
                if text:
                    content_parts.append(text)
                    yield text
                if tool_deltas:
                    _merge_tool_call_deltas(tool_acc, tool_deltas)

    msg: dict[str, Any] = {"role": "assistant", "content": "".join(content_parts)}
    if tool_acc:
        msg["tool_calls"] = [tool_acc[i] for i in sorted(tool_acc)]
    yield msg


async def chat_stream(
    settings: Settings,
    db: TokenDB,
    message: str,
    history: list[dict] | None = None,
    image_base64: str | None = None,
):
    if not settings.minimax_api_key:
        yield _sse_event("error", {"message": "MINIMAX_API_KEY not configured"})
        return

    context = await build_agent_context(settings, db)
    system = build_system_message(context)

    messages: list[dict[str, Any]] = [{"role": "system", "content": system}]
    if history:
        messages.extend(history[-10:])
    messages.append(_build_user_message(message, image_base64))

    tool_results: list[dict] = []
    reply = ""

    for _ in range(5):
        assistant_msg: dict[str, Any] | None = None
        async for chunk in _stream_minimax_round(settings, messages):
            if isinstance(chunk, str):
                yield _sse_event("token", {"text": chunk})
            else:
                assistant_msg = chunk

        if assistant_msg is None:
            break

        reply = assistant_msg.get("content") or assistant_msg.get("text") or ""
        tool_calls = assistant_msg.get("tool_calls") or []
        if not tool_calls:
            break

        messages.append(assistant_msg)
        for tc in tool_calls:
            fn = tc.get("function") or {}
            name = fn.get("name", "")
            try:
                args = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                args = {}
            yield _sse_event("tool_start", {"tool": name})
            result = await execute_tool(settings, db, name, args)
            yield _sse_event("tool_end", {"tool": name})
            tool_results.append({"tool": name, "args": args, "result": result})
            messages.append({
                "role": "tool",
                "tool_call_id": tc.get("id", name),
                "content": json.dumps(result),
            })

    yield _sse_event("done", {"reply": reply or "Done.", "tool_results": tool_results})
