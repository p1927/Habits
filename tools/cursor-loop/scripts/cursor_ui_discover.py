#!/usr/bin/env python3
"""Discover and focus Cursor Habits windows and Agent chat tabs (macOS)."""
from __future__ import annotations

import platform
import subprocess
from pathlib import Path


def _escape_applescript(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def run_applescript(script: str, *, timeout: int = 30) -> tuple[bool, str]:
    if platform.system() != "Darwin":
        return False, "requires macOS"
    try:
        r = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except (subprocess.SubprocessError, OSError) as exc:
        return False, str(exc)
    if r.returncode != 0:
        return False, (r.stderr or r.stdout or "osascript error").strip()
    return True, (r.stdout or "").strip()


def list_cursor_windows(*, habits_marker: str = "Habits") -> list[dict]:
    """Return [{slot, title, is_habits}, ...] with 1-based window slots."""
    if platform.system() != "Darwin":
        return []
    ok, out = run_applescript(
        """
tell application "System Events"
  tell process "Cursor"
    set n to count of windows
    set lines to {}
    repeat with i from 1 to n
      set end of lines to (i as text) & "\\t" & (name of window i)
    end repeat
    return lines as text
  end tell
end tell
"""
    )
    if not ok or not out:
        return []
    rows: list[dict] = []
    marker = habits_marker.lower()
    for line in out.splitlines():
        parts = line.split("\t", 1)
        if len(parts) != 2:
            continue
        try:
            slot = int(parts[0].strip())
        except ValueError:
            continue
        title = parts[1].strip()
        rows.append(
            {
                "slot": slot,
                "title": title,
                "is_habits": marker in title.lower(),
            }
        )
    return rows


def find_habits_window_slot(
    root: Path | None = None,
    *,
    habits_marker: str = "Habits",
    fallback_slot: int | None = None,
) -> int | None:
    """First Cursor window whose title contains habits_marker."""
    for row in list_cursor_windows(habits_marker=habits_marker):
        if row.get("is_habits"):
            return int(row["slot"])
    if fallback_slot and fallback_slot > 0:
        return fallback_slot
    return None


def list_agent_tabs(window_slot: int) -> list[str]:
    """Best-effort Agent sidebar tab labels from accessibility names in a window."""
    if platform.system() != "Darwin" or window_slot <= 0:
        return []
    ok, out = run_applescript(
        f"""
tell application "System Events"
  tell process "Cursor"
    set targetWindow to window {window_slot}
    set seen to {{}}
    set uiElems to entire contents of targetWindow
    repeat with e in uiElems
      try
        set n to name of e
        if length of n > 1 and n is not in seen then
          set end of seen to n
        end if
      end try
    end repeat
    set AppleScript's text item delimiters to linefeed
    return seen as text
  end tell
end tell
"""
    )
    if not ok or not out:
        return []
    return [line.strip() for line in out.splitlines() if line.strip()]


def tab_match_candidates(
    loop_id: str,
    *,
    chat_title: str = "",
    conversation_id: str = "",
) -> list[str]:
    out: list[str] = []
    for candidate in (loop_id, chat_title, conversation_id[:8] if conversation_id else ""):
        c = (candidate or "").strip()
        if c and c not in out:
            out.append(c)
    return out


def tab_exists(window_slot: int, match: str) -> bool:
    if not match:
        return False
    needle = match.lower()
    return any(needle in tab.lower() for tab in list_agent_tabs(window_slot))


def build_raise_window_actions(window_slot: int) -> list[str]:
    return [
        'tell application "Cursor" to activate',
        "delay 0.4",
        'tell application "System Events"',
        '  tell process "Cursor"',
        "    set frontmost to true",
        f"    set targetWindow to window {window_slot}",
        '    perform action "AXRaise" of targetWindow',
        "  end tell",
        "end tell",
    ]


def build_focus_agent_tab_actions(window_slot: int, match: str) -> list[str]:
    """Click sidebar/tab element in window whose name contains match."""
    escaped = _escape_applescript(match)
    return [
        "delay 0.3",
        'tell application "System Events"',
        '  tell process "Cursor"',
        f"    set targetWindow to window {window_slot}",
        f'    set targetMatch to "{escaped}"',
        "    set uiElems to entire contents of targetWindow",
        "    repeat with e in uiElems",
        "      try",
        "        if name of e contains targetMatch then",
        '          perform action "AXPress" of e',
        "          exit repeat",
        "        end if",
        "      end try",
        "    end repeat",
        "  end tell",
        "end tell",
        "delay 0.35",
    ]


def build_open_agent_pane_actions() -> list[str]:
    return [
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "i" using command down',
        "  end tell",
        "end tell",
        "delay 0.5",
    ]


def build_new_agent_chat_actions() -> list[str]:
    """Open Agent pane and start a new in-window chat."""
    return [
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "i" using command down',
        "    delay 0.4",
        '    keystroke "n" using {command down, shift down}',
        "  end tell",
        "end tell",
        "delay 0.6",
    ]


def build_paste_submit_actions(text: str) -> list[str]:
    escaped = _escape_applescript(text)
    return [
        f'set the clipboard to "{escaped}"',
        'tell application "System Events"',
        '  tell process "Cursor"',
        '    keystroke "v" using command down',
        "    delay 0.15",
        "    keystroke return",
        "  end tell",
        "end tell",
    ]


def build_rename_tab_actions(loop_id: str) -> list[str]:
    escaped = _escape_applescript(loop_id)
    return [
        "delay 0.6",
        'tell application "System Events"',
        '  tell process "Cursor"',
        f'    set renameTitle to "{escaped}"',
        "    try",
        '      keystroke "f2"',
        "      delay 0.15",
        '      keystroke "a" using command down',
        "      keystroke renameTitle",
        "      keystroke return",
        "    end try",
        "  end tell",
        "end tell",
    ]


def focus_agent_tab(
    window_slot: int,
    match: str,
    *,
    dry_run: bool = False,
) -> tuple[bool, str]:
    if dry_run:
        return True, "dry_run"
    actions = build_raise_window_actions(window_slot) + build_focus_agent_tab_actions(
        window_slot, match
    )
    return run_applescript("\n".join(actions))
