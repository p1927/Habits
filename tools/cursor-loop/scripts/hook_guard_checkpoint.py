#!/usr/bin/env python3
"""Block direct CHECKPOINT field edits in STATE.md — use prepare_* / advance_ritual_step scripts."""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

PROTECTED_FIELDS = frozenset(
    {
        "phase",
        "ritual_step",
        "review_status",
        "code_changed",
        "worktree_status",
        "worktree_path",
        "worktree_branch",
        "worktree_item_id",
        "receive_review_done",
        "brainstorm_done",
        "fix_verify_done",
        "reflect_done",
        "commit_done",
        "merge_done",
        "execute_started",
        "review_tick_applied_at",
        "review_changed_files",
        "review_fingerprint",
        "last_reviewed_round",
    }
)

FIELD_ROW = re.compile(
    r"\|\s*`?(" + "|".join(re.escape(f) for f in sorted(PROTECTED_FIELDS)) + r")`?\s*\|",
    re.IGNORECASE,
)


def _state_path_from_tool(tool_input: dict) -> str:
    return str(
        tool_input.get("path")
        or tool_input.get("file_path")
        or tool_input.get("target_notebook")
        or ""
    )


def _touches_protected(text: str) -> list[str]:
    if not text:
        return []
    scope = text
    if "## CHECKPOINT" in text:
        scope = text.split("## CHECKPOINT", 1)[1]
        if "\n## " in scope:
            scope = scope.split("\n## ", 1)[0]
    hits: list[str] = []
    for m in FIELD_ROW.finditer(scope):
        name = m.group(1).lower()
        if name in {f.lower() for f in PROTECTED_FIELDS}:
            hits.append(m.group(1))
    return hits


def should_deny_edit(tool_name: str, tool_input: dict) -> tuple[bool, str]:
    path = _state_path_from_tool(tool_input)
    if not path:
        return False, ""
    normalized = path.replace("\\", "/")
    if "/window-instances/" not in normalized or not normalized.endswith("/STATE.md"):
        if not normalized.endswith("STATE.md") or "window-instances" not in normalized:
            return False, ""

    if tool_name == "Write":
        contents = str(tool_input.get("contents") or "")
        hits = _touches_protected(contents)
        if hits:
            return True, (
                f"Blocked: direct Write to CHECKPOINT fields {hits}. "
                "Use bash tools/cursor-loop/scripts/advance_ritual_step.sh --apply "
                "or prepare_*_tick.sh --apply scripts only."
            )
        return False, ""

    if tool_name in ("StrReplace", "EditNotebook"):
        old_s = str(tool_input.get("old_string") or "")
        new_s = str(tool_input.get("new_string") or "")
        hits = _touches_protected(old_s) + _touches_protected(new_s)
        if hits:
            return True, (
                f"Blocked: manual CHECKPOINT edit for {sorted(set(hits))}. "
                "Use advance_ritual_step.sh or prepare_review_tick.sh --apply; "
                "do not hand-edit phase/ritual_step/review_status."
            )

    return False, ""


def main() -> int:
    raw = os.environ.get("CURSOR_LOOP_INPUT", "")
    if not raw:
        return 0
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return 0

    tool_name = payload.get("tool_name") or payload.get("tool") or ""
    if tool_name not in ("Write", "StrReplace", "EditNotebook"):
        return 0

    tool_input = payload.get("tool_input") or payload.get("input") or {}
    deny, msg = should_deny_edit(tool_name, tool_input)
    if not deny:
        return 0

    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": "Use ritual scripts for CHECKPOINT updates",
                "agent_message": msg,
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
