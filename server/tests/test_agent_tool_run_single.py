"""Tests for ``_run_single_tool`` (ch-159 extracted helper).

Covers the parse-args + execute_tool + build-tool-message pipeline that
``_process_tool_calls`` (sync POST loop) and ``_stream_tool_calls`` (SSE
streaming loop) share.
"""

from typing import Union
from unittest.mock import AsyncMock, MagicMock

import pytest

from habits_api.agent.service import _run_single_tool, _stream_tool_calls


def _tc(name: str, args: Union[str, dict], *, call_id: str = "call_test") -> dict:
    if isinstance(args, dict):
        import json as _json

        args = _json.dumps(args)
    return {
        "id": call_id,
        "function": {"name": name, "arguments": args},
    }


def _settings() -> MagicMock:
    return MagicMock()


@pytest.mark.asyncio
async def test_run_single_tool_happy_path():
    fake_settings = _settings()
    fake_db = MagicMock()
    fake_settings.minimax_api_key = "test-key"

    # Patch execute_tool via the import the helper already binds. We patch
    # the symbol on the service module so the helper's closure hits our mock.
    import habits_api.agent.service as service_mod

    service_mod.execute_tool = AsyncMock(return_value={"ok": True, "count": 2})

    tc = _tc("search_food", {"query": "apple"})
    tr, tm = await _run_single_tool(tc, fake_settings, fake_db)

    assert tr == {"tool": "search_food", "args": {"query": "apple"}, "result": {"ok": True, "count": 2}}
    assert tm["role"] == "tool"
    assert tm["tool_call_id"] == "call_test"
    # content is the JSON-encoded result
    import json as _json

    assert _json.loads(tm["content"]) == {"ok": True, "count": 2}

    service_mod.execute_tool.assert_awaited_once_with(
        fake_settings, fake_db, "search_food", {"query": "apple"}
    )


@pytest.mark.asyncio
async def test_run_single_tool_invalid_json_falls_back_to_empty_args():
    import habits_api.agent.service as service_mod

    service_mod.execute_tool = AsyncMock(return_value={"error": "nope"})

    fake_settings = _settings()
    fake_db = MagicMock()
    tc = _tc("log_food", "{not valid json", call_id="call_x")
    tr, tm = await _run_single_tool(tc, fake_settings, fake_db)

    assert tr["args"] == {}
    assert tm["tool_call_id"] == "call_x"
    service_mod.execute_tool.assert_awaited_once()
    # verify it was called with empty args
    call_args = service_mod.execute_tool.await_args
    assert call_args is not None
    assert call_args.args == (fake_settings, fake_db, "log_food", {})


@pytest.mark.asyncio
async def test_run_single_tool_uses_tc_id_for_tool_call_id():
    import habits_api.agent.service as service_mod

    service_mod.execute_tool = AsyncMock(return_value={"ok": True})

    tc = _tc("add_card", {"card_type": "notes", "title": "t", "body": "b"}, call_id="call_abc")
    _, tm = await _run_single_tool(tc, _settings(), MagicMock())
    assert tm["tool_call_id"] == "call_abc"


@pytest.mark.asyncio
async def test_stream_tool_calls_emits_start_end_events_around_each_tool():
    import habits_api.agent.service as service_mod

    service_mod.execute_tool = AsyncMock(side_effect=[
        {"results": ["a"], "count": 1},
        {"ok": True},
    ])

    tool_calls = [
        _tc("search_food", {"query": "x"}, call_id="call_1"),
        _tc("log_food", {"description": "y"}, call_id="call_2"),
    ]

    events: list[tuple[str, object]] = []
    terminal = None
    async for item in _stream_tool_calls(tool_calls, _settings(), MagicMock()):
        if isinstance(item, str):
            events.append(_parse_sse_event(item))
        else:
            terminal = item

    # start/end events around each tool, in order
    assert events == [
        ("tool_start", {"tool": "search_food"}),
        ("tool_end", {"tool": "search_food"}),
        ("tool_start", {"tool": "log_food"}),
        ("tool_end", {"tool": "log_food"}),
    ]
    assert terminal is not None
    phase, results, messages = terminal
    assert phase == "done"
    assert len(results) == 2
    assert results[0]["tool"] == "search_food"
    assert results[1]["tool"] == "log_food"
    assert len(messages) == 2
    assert messages[0]["role"] == "tool"
    assert messages[1]["role"] == "tool"


def _parse_sse_event(raw: str) -> tuple[str, object]:
    """Parse ``event: <name>\\ndata: <json>\\n\\n`` into a tuple."""
    import json as _json

    lines = raw.strip().split("\n")
    event_line = next(ln for ln in lines if ln.startswith("event:"))
    data_line = next(ln for ln in lines if ln.startswith("data:"))
    event_name = event_line[len("event:"):].strip()
    payload = _json.loads(data_line[len("data:"):].strip())
    return event_name, payload
