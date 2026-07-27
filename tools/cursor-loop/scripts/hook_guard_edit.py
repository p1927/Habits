#!/usr/bin/env python3
"""preToolUse hook — block app-scope edits on main without worktree."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import loop_hook_lib as mod

EDIT_TOOLS = frozenset({"Write", "StrReplace", "EditNotebook", "Delete"})


def main() -> int:
    raw = os.environ.get("CURSOR_LOOP_INPUT", "")
    if not raw:
        return 0
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return 0

    tool_name = payload.get("tool_name") or payload.get("tool") or ""
    if tool_name not in EDIT_TOOLS:
        return 0

    root = mod.workspace_root(payload)
    if root is None:
        return 0

    try:
        manifest = mod.load_manifest(root)
    except (FileNotFoundError, ValueError):
        return 0

    scripts = root / manifest["package_root"] / "scripts"
    guard = scripts / "guard_edit_scope.py"
    if not guard.is_file():
        return 0

    proc = subprocess.run(
        [sys.executable, str(guard), "--json"],
        input=raw,
        capture_output=True,
        text=True,
        cwd=str(root),
        env={**os.environ, "PYTHONPATH": str(scripts)},
    )
    if proc.returncode == 2:
        msg = proc.stdout.strip() or proc.stderr.strip() or "Edit blocked by guard_edit_scope"
        out = {
            "permission": "deny",
            "user_message": "Edit blocked: app scope must use worktree",
            "agent_message": msg,
        }
        print(json.dumps(out))
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
