#!/usr/bin/env python3
"""macOS Composer Push — focus bound chat via window slot or title and submit wake prompt."""
from __future__ import annotations

import argparse
import json
import platform
import subprocess
import sys
import time
from pathlib import Path

import loop_hook_lib as lh
import cursor_ui_discover as ui


def is_cursor_running() -> bool:
    if platform.system() != "Darwin":
        return False
    try:
        r = subprocess.run(
            [
                "osascript",
                "-e",
                'tell application "System Events" to return (exists process "Cursor")',
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return r.returncode == 0 and r.stdout.strip().lower() == "true"
    except (subprocess.SubprocessError, OSError):
        return False


def open_cursor_workspace(root: Path, *, delay_sec: float = 0.0) -> bool:
    if platform.system() != "Darwin":
        return False
    try:
        subprocess.run(["open", "-a", "Cursor", str(root)], check=False, timeout=15)
        if delay_sec > 0:
            time.sleep(delay_sec)
        return True
    except (subprocess.SubprocessError, OSError):
        return False


def chat_title_for_loop(root: Path, loop_id: str) -> str:
    return str(lh.ui_target_for_loop(root, loop_id).get("chat_title") or loop_id)


def _escape_applescript(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def build_focus_actions(
    *,
    ui_window_slot: int | None = None,
    chat_title: str = "",
    conversation_id: str = "",
    tab_match: str = "",
) -> tuple[list[str], str]:
    """Build AppleScript lines to focus the target Cursor window/chat."""
    actions = [
        'tell application "Cursor" to activate',
        "delay 0.4",
        'tell application "System Events"',
        '  tell process "Cursor"',
        "    set frontmost to true",
    ]
    method = "none"
    match = tab_match or chat_title or (conversation_id[:8] if conversation_id else "")

    if ui_window_slot is not None and ui_window_slot > 0:
        actions.extend(
            [
                f"    set targetWindow to window {ui_window_slot}",
                '    perform action "AXRaise" of targetWindow',
                "    set found to true",
            ]
        )
        method = "window_slot"
        if match:
            actions.extend(["  end tell", "end tell"])
            actions.extend(ui.build_focus_agent_tab_actions(ui_window_slot, match))
            actions.extend(
                [
                    'tell application "System Events"',
                    '  tell process "Cursor"',
                    "    set frontmost to true",
                ]
            )
            method = "window_slot+tab"
    elif chat_title:
        actions.extend(
            [
                f'    set targetTitle to "{_escape_applescript(chat_title)}"',
                "    set found to false",
                "    repeat with w in windows",
                "      if name of w contains targetTitle then",
                '        perform action "AXRaise" of w',
                "        set found to true",
                "        exit repeat",
                "      end if",
                "    end repeat",
                "    if not found then",
                "      repeat with w in windows",
                '        set uiElems to entire contents of w',
                "        repeat with e in uiElems",
                "          try",
                "            if name of e contains targetTitle then",
                '              perform action "AXPress" of e',
                "              set found to true",
                "              exit repeat",
                "            end if",
                "          end try",
                "        end repeat",
                "        if found then exit repeat",
                "      end repeat",
                "    end if",
            ]
        )
        method = "chat_title"
    elif conversation_id:
        prefix = conversation_id[:8]
        actions.extend(
            [
                f'    set targetPrefix to "{_escape_applescript(prefix)}"',
                "    set found to false",
                "    repeat with w in windows",
                "      if name of w contains targetPrefix then",
                '        perform action "AXRaise" of w',
                "        set found to true",
                "        exit repeat",
                "      end if",
                "    end repeat",
            ]
        )
        method = "conversation_id"

    actions.extend(["  end tell", "end tell", "delay 0.3"])
    return actions, method


def build_paste_actions(prompt: str) -> list[str]:
    return [
        f'set the clipboard to "{_escape_applescript(prompt)}"',
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "v" using command down',
        "    delay 0.15",
        "    keystroke return",
        "  end tell",
        "end tell",
    ]


def push_prompt_macos(
    prompt: str,
    *,
    ui_window_slot: int | None = None,
    chat_title: str = "",
    conversation_id: str = "",
    dry_run: bool = False,
) -> dict:
    """Activate Cursor, focus target window/chat, paste prompt, submit."""
    if platform.system() != "Darwin":
        return {"ok": False, "method": "ui_push", "error": "ui_push requires macOS"}

    focus_actions, targeting = build_focus_actions(
        ui_window_slot=ui_window_slot,
        chat_title=chat_title,
        conversation_id=conversation_id,
        tab_match=chat_title,
    )
    paste_actions = build_paste_actions(prompt)

    if dry_run:
        return {
            "ok": True,
            "method": "ui_push",
            "dry_run": True,
            "targeting": targeting,
            "ui_window_slot": ui_window_slot,
            "chat_title": chat_title or None,
            "conversation_id": conversation_id[:12] + "…" if conversation_id else None,
            "actions": focus_actions + paste_actions,
            "prompt_len": len(prompt),
        }

    try:
        subprocess.run(
            ["pbcopy"],
            input=prompt.encode("utf-8"),
            check=True,
            timeout=5,
        )
    except (subprocess.SubprocessError, OSError) as exc:
        return {"ok": False, "method": "ui_push", "error": f"pbcopy failed: {exc}"}

    script = "\n".join(focus_actions + paste_actions)
    try:
        r = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=30,
        )
    except (subprocess.SubprocessError, OSError) as exc:
        return {"ok": False, "method": "ui_push", "error": f"osascript failed: {exc}"}

    if r.returncode != 0:
        err = (r.stderr or r.stdout or "osascript error").strip()
        hint = (
            " Grant Accessibility to Terminal/Cursor in System Settings → Privacy → Accessibility."
        )
        return {"ok": False, "method": "ui_push", "error": f"{err}{hint}", "targeting": targeting}

    return {
        "ok": True,
        "method": "ui_push",
        "targeting": targeting,
        "ui_window_slot": ui_window_slot,
        "chat_title": chat_title or None,
    }


def push_loop_wake(
    root: Path,
    loop_id: str,
    *,
    prompt: str | None = None,
    dry_run: bool = False,
    open_if_closed: bool = True,
    open_delay_sec: float = 2.0,
) -> dict:
    if not lh.has_loop_binding(root, loop_id):
        return {"ok": False, "loop_id": loop_id, "method": "ui_push", "error": "not_bound"}

    lock = lh.read_loop_lock(root, loop_id) or {}
    contract = lock.get("contract_doc") or f"docs/window-instances/{loop_id}/INSTANCE.md"

    if not prompt:
        manifest = lh.load_manifest(root)
        for entry in lh.load_instances_manifest(root, manifest).get("instances") or []:
            if entry.get("loop_id") == loop_id:
                contract = entry.get("contract_doc") or contract
                break
        prompt = f"@{contract} keep working"

    if not is_cursor_running():
        if open_if_closed:
            open_cursor_workspace(root, delay_sec=open_delay_sec)
        else:
            return {
                "ok": False,
                "loop_id": loop_id,
                "method": "ui_push",
                "error": "cursor_not_running",
            }

    target = lh.ui_target_for_loop(root, loop_id)
    result = push_prompt_macos(
        prompt,
        ui_window_slot=target.get("ui_window_slot"),
        chat_title=str(target.get("chat_title") or loop_id),
        conversation_id=str(target.get("conversation_id") or ""),
        dry_run=dry_run,
    )
    result["loop_id"] = loop_id
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Push wake prompt into bound Composer chat (macOS)")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", required=True)
    parser.add_argument("--prompt", default="", help="Override prompt (default: @INSTANCE keep working)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-open", action="store_true", help="Do not open Cursor if closed")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    result = push_loop_wake(
        root,
        args.loop_id,
        prompt=args.prompt or None,
        dry_run=args.dry_run,
        open_if_closed=not args.no_open,
    )
    print(json.dumps(result, indent=2 if args.json else None))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
